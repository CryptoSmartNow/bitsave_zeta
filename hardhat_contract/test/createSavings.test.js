
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {expect} = require("chai")
const deployBitsaveFixture = require("./bitsave.test")

describe("Create savings", ()=>{
    it("Should revert if user is not registered", async()=>{
        const {bitsave, otherAccount} = await loadFixture(deployBitsaveFixture);

        expect(
            bitsave.connect(otherAccount).createSaving()
        ).to.be.revertedWith("User not registered to bitsave!");
    })

    it("Should revert if minimum savings not satisfied")

    it("Should revert if saving name has been used")

    it("Should create savings", async()=>{
        const {bitsave} = await loadFixture(deployBitsaveFixture);
        const bsChildContract = await bitsave.getUserChildContractAddress();

        // todo: work on the data retrieval
    })

    it("Should reduce balance of user by amount saved")

    it("Should increase balance of child contract by value")

    it("Should convert currency of saving for safe mode")
})
