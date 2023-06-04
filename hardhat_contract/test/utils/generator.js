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
    console.log("sck")

    // Register toBeRegisteredUser
    await bitsave
        .connect(toBeRegisteredAccount)
        .joinBitsave({value: 10_000});

    console.log("here")

    const reg_userChildAddress = await bitsave
        .connect(toBeRegisteredAccount)
        .getUserChildContractAddress(); // might need to use public fns generated

    return {
        bitsave,
        owner,
        registeredUser: toBeRegisteredAccount,
        reg_userChildAddress,
        otherAccount
    }
}

module.exports = {
    deployBitsaveFixture
}