const { MaxUint256 } = require("@ethersproject/constants");
const { parseUnits } = require("@ethersproject/units");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");
const { ethers } = require("hardhat");
const {UniswapV2Router02__factory} = require("@zetachain/protocol-contracts");

const addZetaEthLiquidity = async (
  signer,
  token,
  uniswapRouterAddr
) => {
  const block = await ethers.provider.getBlock("latest");

  const tx1 = await token.approve(uniswapRouterAddr, MaxUint256);
  await tx1.wait();

  const uniswapRouterFork = UniswapV2Router02__factory.connect(
    uniswapRouterAddr,
    signer
  );

  const tx2 = await uniswapRouterFork.addLiquidityETH(
    token.address,
    parseUnits("1000"),
    0,
    0,
    signer.address,
    block.timestamp + 360,
    { value: parseUnits("1000") }
  );
  await tx2.wait();
};

const evmSetup = async (
  wGasToken,
  uniswapFactoryAddr,
  uniswapRouterAddr
) => {
  const [signer] = await ethers.getSigners();

  const ZRC20Factory = (await ethers.getContractFactory(
    "TestZRC20"
  ));

  const token1Contract = (await ZRC20Factory.deploy(
    parseUnits("1000000"),
    "tBNB",
    "tBNB"
  ));
  const token2Contract = (await ZRC20Factory.deploy(
    parseUnits("1000000"),
    "gETH",
    "gETH"
  ));
  const token3Contract = (await ZRC20Factory.deploy(
    parseUnits("1000000"),
    "tMATIC",
    "tMATIC"
  ));

  const ZRC20Contracts = [token1Contract, token2Contract, token3Contract];

  const SystemContractFactory = (await ethers.getContractFactory(
    "TestSystemContract"
  ));

  const systemContract = (await SystemContractFactory.deploy(
    wGasToken,
    uniswapFactoryAddr,
    uniswapRouterAddr
  ));

  await systemContract.setGasCoinZRC20(97, ZRC20Contracts[0].address);
  await systemContract.setGasCoinZRC20(5, ZRC20Contracts[1].address);
  await systemContract.setGasCoinZRC20(80001, ZRC20Contracts[2].address);

  await addZetaEthLiquidity(signer, ZRC20Contracts[0], uniswapRouterAddr);
  await addZetaEthLiquidity(signer, ZRC20Contracts[1], uniswapRouterAddr);
  await addZetaEthLiquidity(signer, ZRC20Contracts[2], uniswapRouterAddr);

  return { ZRC20Contracts, systemContract };
};

module.exports = {
  evmSetup
}
