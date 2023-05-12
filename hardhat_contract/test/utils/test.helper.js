import { MaxUint256 } from "@ethersproject/constants";
import { parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { ethers } from "hardhat";

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
