
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

    describe("Registration", ()=>{
        it("should revert if fee is less than required", async()=>{
            const {bitsave} = await loadFixture(deployBitsaveFixture);

            expect(bitsave.joinBitsave({value: 7000})).to.be
                .revertedWith("Incomplete bitsave fee");
        })
        it("Should create child contract and return the child address", async()=>{
            const {bitsave} = await loadFixture(deployBitsaveFixture);

            const childAddressFromJoining = await bitsave.joinBitsave({value: 10000});
            expect(childAddressFromJoining).to.be.equal(anyValue());
            expect(childAddressFromJoining).to.be.properAddress;
            expect(await bitsave.getUserChildContractAddress()).to.be.equal(childAddressFromJoining);
        })
        // can make tests for child contract directly
    })

    describe("Saving features", ()=>{
        
    })
})