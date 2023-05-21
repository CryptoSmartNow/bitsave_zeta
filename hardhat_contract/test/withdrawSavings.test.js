
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {expect} = require("chai")
const {deployBitsaveFixture} = require("./bitsave.test_v1")

describe("Withdraw saving", ()=>{
    it("Should only allow bitsave protocol on child contract")

    it("Should revert if not registered", async()=>{
        const {bitsave, otherAccount} = await loadFixture(deployBitsaveFixture)
        await expect(
            bitsave
                .connect(otherAccount)
                .withdrawSaving("school")
        ).to.be.revertedWith(
            "User not registered to bitsave!"
        )
    })

    it("Should revert if saving to withdraw not present", async()=>{
        const {bitsave, registeredUser} = await loadFixture(deployBitsaveFixture);

        await expect(
            bitsave
                .connect(registeredUser)
                .withdrawSaving("unknown saving")
        ).to.be.revertedWith(
            "Saving to withdraw does not exist"
        )
    })

    describe("Breaking saving", ()=>{
        it("Should remove penalty from saving")

        it("Should not pay interest of CSA")

        it("Should increment user's balance by remnant of saving V = A / 100 * (100-P)")
    })

    describe("Matured saving", ()=>{

    })

    describe("Mode of saving", ()=>{
        // could make withdrawal in stable coin instead
        it("Safe mode: should send original token in actual value")

        it("Risk mode: should send value of saving in different value")
    })
})
