
const {loadFixture, time} = require("@nomicfoundation/hardhat-network-helpers")
const {anyValue} = require("@nomicfoundation/hardhat-chai-matchers/withArgs")
const {expect} = require("chai")
const {ethers} = require("hardhat");

// test features to be written here
describe("Bitsave protocol", ()=>{
    async function deployBitsaveFixture() {
        // args
        const swapRouter = 0x4;
        const routerAddress = 0x4;
        const usdcAddress = 0x4;
        const ONE_GWEI = 1_000_000_000;

        const [owner, otherAccount] = ethers.getSigners();

        const Bitsave = await ethers.getContractFactory("Bitsave");
        const bitsave = await Bitsave.deploy(
            swapRouter,
            routerAddress,
            usdcAddress,
            {
                value: 2 * ONE_GWEI
            }
        )

        return {
            bitsave,
            swapRouter,
            routerAddress,
            usdcAddress,
            owner,
            otherAccount,
        }
    }

    describe("Deployment", ()=>{
        it("Should set stable coin as usdc", async ()=>{
            const {bitsave, usdcAddress} = await loadFixture(deployBitsaveFixture);

            expect(await bitsave.getStableCoin()).to.equal(usdcAddress);
        })
        it("Should set swapRouter correctly", async()=>{
            const {bitsave, swapRouter} = await loadFixture(deployBitsaveFixture);

            expect(await bitsave.getSwapRouter()).to.equal(swapRouter);
        })
    })
})