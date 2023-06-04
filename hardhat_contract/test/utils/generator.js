const {ethers} = require("hardhat");
const {USDC_ADDRESS} = require("../../constants/config");
const {SYSTEM_CONTRACT} = require("../../scripts/deploy");

async function deployBitsaveFixture() {
    const factoryBitsave = await ethers.getContractFactory("Bitsave");
    const [owner, toBeRegisteredAccount, otherAccount] = await ethers.getSigners();

    const bitsave = await factoryBitsave.deploy(
        USDC_ADDRESS,
        SYSTEM_CONTRACT
    );
    await bitsave.deployed();

    // Register toBeRegisteredUser
    await bitsave
        .connect(toBeRegisteredAccount)
        .joinBitsave({value: 10_500});


    const reg_userChildAddress = await bitsave
        .connect(toBeRegisteredAccount)
        .getUserChildContractAddress();

    return {
        bitsave,
        owner,
        registeredUser: toBeRegisteredAccount,
        reg_userChildAddress,
        otherAccount
    }
}

const childContractGenerate = async (childAddress) => {
    const BitsaveChild = await ethers
        .getContractFactory("UserContract")

    return {
        bitsaveChild: BitsaveChild.attach(childAddress)
    }
}

module.exports = {
    deployBitsaveFixture
}