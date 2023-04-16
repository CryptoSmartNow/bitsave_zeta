
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {expect} = require("chai")
const deployBitsaveFixture = require("./bitsave.test")

describe("Withdraw saving", ()=>{
    it("Should revert if not registered")

    it("Should revert if saving to withdraw not present")

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
