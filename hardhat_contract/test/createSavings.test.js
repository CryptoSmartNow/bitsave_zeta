
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {expect} = require("chai")
const {deployBitsaveFixture, childContractGenerate} = require("./bitsave.test")
const {USDC_ADDRESS, ONE_GWEI} = require("../constants/config");

describe("Create savings", ()=>{
    const twoPenaltyPercentage = 2;
    const amountToSave = 3 * ONE_GWEI;
    const newTimestamp = Date.now() + 300_000;

    it("Should revert if user is not registered", async()=>{
        const {bitsave, otherAccount} = await loadFixture(deployBitsaveFixture);

        expect(
            bitsave.connect(otherAccount).createSaving()
        ).to.be.revertedWith("User not registered to bitsave!");
    })

    it("Should revert if minimum savings not satisfied")

    it("Should revert savings that exclude or exceed maturity time", async()=>{
        const {bitsave, registeredUser} = await loadFixture(deployBitsaveFixture)

        const oldTimestamp = Math.round(Date.now() / 1000) - 1000;
        await expect(
            bitsave
                .connect(registeredUser)
                .createSaving(
                    "school",
                    oldTimestamp,
                    twoPenaltyPercentage,
                    false,
                    USDC_ADDRESS,
                    amountToSave
                )
        ).to.be.revertedWith("Maturity time exceeded/invalid");
    })

    it("Should create savings", async()=>{
        const {bitsave, registeredUser} = await loadFixture(deployBitsaveFixture);
        const nameOfSaving = "school"

        await bitsave
                .connect(registeredUser)
                .createSaving(
                    nameOfSaving,
                    newTimestamp,
                    twoPenaltyPercentage,
                    false,
                    USDC_ADDRESS,
                    amountToSave
                )

        const bsChildContractAddress = await bitsave.getUserChildContractAddress();
        const userChildContract = await childContractGenerate(bsChildContractAddress);

        console.log(await userChildContract.getSavings(nameOfSaving));

        // todo: work on the data retrieval
    })

    it("Should reduce balance of user by amount saved")

    it("Should increase balance of child contract by value")

    it("Should convert currency of saving for safe mode")

    it("Should revert if saving name has been used")
})
