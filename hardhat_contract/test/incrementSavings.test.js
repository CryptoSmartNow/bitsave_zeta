
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {expect} = require("chai")
const {deployBitsaveFixture} = require("./bitsave.test")

describe("Increment savings", ()=>{
    it("Should revert if user not registered", async ()=>{
        const {bitsave, otherAccount} = await loadFixture(deployBitsaveFixture)

        await expect(
            bitsave
                .connect(otherAccount)
                .incrementSaving(
                    "school"
                )
        ).to.be.revertedWith(
            "User not registered to bitsave!"
        )
    })

    it("Should revert if saving to increment not present")

    it("Should revert if saving maturity time exceeded")

    it("Should withdraw token of savings from user balance")

    it("Should increase worth of user's child contract")

    it("Should increment interest of saving")

    it("Should take note of saving mode")
})
