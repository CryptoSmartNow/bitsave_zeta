
// const web3 = require("web3")
const {loadFixture, time} = require("@nomicfoundation/hardhat-network-helpers")
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs")
const {expect} = require("chai")
const {ethers} = require("hardhat");
const {USDC_ADDRESS, ROUTERADDRESS, ONE_GWEI} = require("../constants/config")

async function deployBitsaveFixture() {
    // args
    const swapRouter = ROUTERADDRESS;
    const routerAddress = ROUTERADDRESS;
    const usdcAddress = USDC_ADDRESS;

    const [owner, toBeRegisteredAccount, otherAccount] = await ethers.getSigners();

    const Bitsave = await ethers.getContractFactory("Bitsave");
    const bitsave = await Bitsave.deploy(
        swapRouter,
        routerAddress,
        usdcAddress,
        {
            value: 2 * ONE_GWEI
        }
    )

    await bitsave.connect(toBeRegisteredAccount).joinBitsave({value: 10_000});

    return {
        bitsave,
        swapRouter,
        routerAddress,
        usdcAddress,
        owner,
        registeredUser: toBeRegisteredAccount,
        otherAccount,
    }
}

// test features to be written here
describe("Bitsave protocol", ()=>{

    describe("Deployment", ()=>{
        it("Should set stable coin as usdc", async ()=>{
            const {bitsave, usdcAddress} = await loadFixture(deployBitsaveFixture);

            const retrievedStableCoinAddress = await bitsave.stableCoin();
            expect(retrievedStableCoinAddress.toLowerCase()).to.equal(usdcAddress);
        })
        it("Should set swapRouter correctly", async()=>{
            const {bitsave, swapRouter} = await loadFixture(deployBitsaveFixture);

            expect(
                (await bitsave.swapRouter()).toLowerCase()
            ).to.equal(swapRouter.toLowerCase());
        })
    })

    describe("Registration", ()=>{
        it("should revert if fee is less than required", async()=>{
            const {bitsave} = await loadFixture(deployBitsaveFixture);

            await expect(bitsave.joinBitsave({value: 7000})).to.be
                .revertedWith("Incomplete bitsave fee");
        })
        it("Should create child contract and return the child address", async()=>{
            const {bitsave} = await loadFixture(deployBitsaveFixture);

            const childAddressFromJoining = await bitsave.joinBitsave({value: 10000});
            const childAddress = await bitsave.getUserChildContractAddress();
            expect(childAddress).to.be.properAddress;
        })
        // can make tests for child contract directly
    })

    describe("Saving features", ()=>{
        describe("Increment savings", ()=>{})

        describe("Withdraw savings", ()=>{})
    })
})

module.exports = deployBitsaveFixture
