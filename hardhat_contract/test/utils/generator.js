const {ethers, network} = require("hardhat");
const {USDC_ADDRESS} = require("../../constants/config");
const {SYSTEM_CONTRACT} = require("../../scripts/deploy");
const {evmSetup} = require("./test.helper");
const {parseUnits} = require("@ethersproject/units");
const {getAddress: getAddressLib} = require("@zetachain/addresses");
const {BigNumber} = require("@ethersproject/bignumber");
const {getJoinParams} = require("./helper");

async function deployBitsaveFixture() {

    const wGasToken = getAddressLib({
        address: "weth9",
        networkName: "eth-mainnet",
        zetaNetwork: "mainnet",
    });

    const uniswapRouterAddr = getAddressLib({
        address: "uniswapV2Router02",
        networkName: "eth-mainnet",
        zetaNetwork: "mainnet"
    })

    const uniswapFactoryAddr = getAddressLib({
        address: "uniswapV2Factory",
        networkName: "eth-mainnet",
        zetaNetwork: "mainnet",
    });

    const evmSetupResult = await evmSetup(
        wGasToken,
        uniswapFactoryAddr,
        uniswapRouterAddr
    );

    const ZRC20Contracts = evmSetupResult.ZRC20Contracts;
    const systemContract = evmSetupResult.systemContract

    const factoryBitsave = await ethers.getContractFactory("Bitsave");

    const accounts = await ethers.getSigners();

    const [owner, toBeRegisteredAccount, otherAccount] = accounts

    const amount = parseUnits("1000")
    await ZRC20Contracts[0].transfer(toBeRegisteredAccount.address, amount);
    await ZRC20Contracts[0].transfer(otherAccount.address, amount);
    const stableCoin = ZRC20Contracts[1]

    const bitsave = await factoryBitsave.deploy(
        stableCoin.address,
        systemContract.address
    );
    await bitsave.deployed();


    await network.provider.send(
        "hardhat_setBalance",
        [
            toBeRegisteredAccount.address,
            parseUnits("1000000").toHexString()
        ]
    )

    await network.provider.send(
        "hardhat_setBalance",
        [
            otherAccount.address,
            parseUnits("1000000").toHexString()
        ]
    )


    // Register toBeRegisteredUser
    const paymentToken = ZRC20Contracts[0]
    const JoinFee = 100


    await paymentToken
        .connect(toBeRegisteredAccount)
        .approve(bitsave.address, parseUnits(JoinFee.toString()))

    await bitsave
        .connect(toBeRegisteredAccount)
        .onCrossChainCall(
            paymentToken.address,
            parseUnits(JoinFee.toString()),
            getJoinParams(),
        )

    const reg_userChildAddress = await bitsave
        .connect(toBeRegisteredAccount)
        .getUserChildContractAddress();

    return {
        bitsave,
        owner,
        registeredUser: toBeRegisteredAccount,
        reg_userChildAddress,
        otherAccount,
        ZRC20Contracts,
        stableCoin
    }
}

const childContractGenerate = async (childAddress) => {
    const BitsaveChild = await ethers
        .getContractFactory("UserContract")

    return {
        userChildContract: BitsaveChild.attach(childAddress),
        CC: BitsaveChild
    }
}

module.exports = {
    deployBitsaveFixture,
    childContractGenerate
}