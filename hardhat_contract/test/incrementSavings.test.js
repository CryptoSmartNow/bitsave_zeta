
const {loadFixture, time} = require("@nomicfoundation/hardhat-network-helpers")
const {expect} = require("chai")
const {deployBitsaveFixture} = require("./bitsave.test")
const {USDC_ADDRESS, ONE_GWEI} = require("../constants/config");

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

    it("Should revert if saving to increment not present", async()=>{
        const {bitsave, registeredUser} = await loadFixture(deployBitsaveFixture);

        await expect(
            bitsave
                .connect(registeredUser)
                .incrementSaving("savingUnused")
        ).to.be.revertedWith("Saving to fund does not exist");
    })

    it("Should revert if saving maturity time exceeded", async()=>{
        const {bitsave, registeredUser} = await loadFixture(deployBitsaveFixture);

        const nameOfSaving = "school"
        const useSafeMode = false;
        const twoPenaltyPercentage = 2;
        const amountToSave = 3 * ONE_GWEI;
        const newTimestamp = Date.now() + 300_000;

        await bitsave
                .connect(registeredUser)
                .createSaving(
                    nameOfSaving,
                    newTimestamp,
                    twoPenaltyPercentage,
                    useSafeMode,
                    USDC_ADDRESS,
                    amountToSave
                )

        // increase time with hardhat
        await time.increaseTo(Math.round(newTimestamp / 1000));

        await expect(
            bitsave
                .connect(registeredUser)
                .incrementSaving(nameOfSaving)
        ).to.be.revertedWith("Sorry, saving has ended");
    })

    it("Should withdraw token of savings from user balance")

    it("Should increase worth of user's child contract")

    it("Should increment interest of saving")

    it("Should take note of saving mode")
})
