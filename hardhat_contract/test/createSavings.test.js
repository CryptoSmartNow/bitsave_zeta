
const {BigNumber} = require("ethers")
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {expect} = require("chai")
const {deployBitsaveFixture, childContractGenerate} = require("./bitsave.test")
const {USDC_ADDRESS, ONE_GWEI} = require("../constants/config");

describe("Create savings", async()=>{
    const nameOfSaving = "school"
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
        const {bitsave, registeredUser, reg_userChildAddress} = await loadFixture(deployBitsaveFixture);
        const nameOfSaving = "school"
        const useSafeMode = false;

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

        const userChildContract = await childContractGenerate(reg_userChildAddress);
        const created_savings = await userChildContract.getSavings(nameOfSaving);

        expect(created_savings.maturityTime).to.be.equal(newTimestamp);
        expect(created_savings.amount).to.be
            .equal(
                BigNumber.from(amountToSave.toString())
            );
        expect(created_savings.isSafeMode).to.equal(useSafeMode);
        expect(created_savings.tokenId).to.equal(USDC_ADDRESS);
        expect(created_savings.penaltyPercentage).to.equal(
            BigNumber.from(twoPenaltyPercentage)
        );
    })

    it("Should reduce balance of user by amount saved", async()=>{
        const {bitsave, registeredUser} = await loadFixture(deployBitsaveFixture)

        const userBalanceBeforeSaving = await registeredUser.getBalance()

        const useSafeMode = false;
        // save amount
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
        const userBalanceAfterSaving = await registeredUser.getBalance()

        // todo: ! check these values well
        expect(parseInt(userBalanceBeforeSaving.toString()))
            .to.be
            .gte(parseInt(userBalanceAfterSaving.toString()) + (amountToSave / 1000))
    })

    it("Should increase balance of child contract by value")

    it("Should convert currency of saving for safe mode")

    it("Should revert if saving name has been used", async()=>{
        const {bitsave, registeredUser} = await loadFixture(deployBitsaveFixture);

        await bitsave
            .connect(registeredUser)
            .createSaving(
                nameOfSaving,
                newTimestamp,
                twoPenaltyPercentage,
                false,
                USDC_ADDRESS,
                amountToSave
            );

        await expect(
            bitsave
            .connect(registeredUser)
            .createSaving(
                nameOfSaving,
                newTimestamp,
                twoPenaltyPercentage,
                false,
                USDC_ADDRESS,
                amountToSave
            )
        ).to.be.revertedWith(
            "Savings exist already"
        )
    })
})
