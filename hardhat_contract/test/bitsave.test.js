const {ethers, network} = require("hardhat");
const {expect} = require("chai")
const {parseUnits} = require("@ethersproject/units");
const {getAddress: getAddressLib} = require("@zetachain/addresses")
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers");
const {deployBitsaveFixture, childContractGenerate} = require("./utils/generator");
const {getJoinParams} = require("./utils/helper");

describe("Bitsave zetachain v2", () => {
    const JoinFee = 100;

    // beforeEach(async ()=>{
    //     accounts = await ethers.getSigners();
    //     // fetch one deployer
    //     [deployer] = accounts;
    //
    //     await network.provider.send(
    //         "hardhat_setBalance",
    //         [
    //             deployer.address,
    //             parseUnits("1000000").toHexString()
    //         ]
    //     )
    //
    //     const uniswapRouterAddr = getAddressLib({
    //         address: "uniswapV2Router02",
    //         networkName: "eth-mainnet",
    //         zetaNetwork: "mainnet"
    //     })
    //
    //     const uniswapFactoryAddr = getAddressLib({
    //       address: "uniswapV2Factory",
    //       networkName: "eth-mainnet",
    //       zetaNetwork: "mainnet",
    //     });
    //
    //     // const evmSetup = await evmSetup
    // })

    describe("Authentication", () => {
        it('Should revert if fee not balanced', async function() {
            const {bitsave, otherAccount, ZRC20Contracts} = await loadFixture(deployBitsaveFixture);
            const paymentToken = ZRC20Contracts[0]

            await paymentToken
            .connect(otherAccount)
            .approve(bitsave.address, parseUnits(JoinFee.toString()))

            await expect(
                bitsave
                .connect(otherAccount)
                .onCrossChainCall(
                    paymentToken.address,
                    10,
                    getJoinParams(),
                )
            ).to.be.revertedWithCustomError(bitsave, "AmountNotEnough")
        });

        it('should join bitsave and return child address', async function () {
            const {bitsave, otherAccount, ZRC20Contracts} = await loadFixture(deployBitsaveFixture);
            const paymentToken = ZRC20Contracts[0]

            await paymentToken
            .connect(otherAccount)
            .approve(bitsave.address, parseUnits(JoinFee.toString()))

            await bitsave
                .connect(otherAccount)
                .onCrossChainCall(
                    paymentToken.address,
                    parseUnits(JoinFee.toString()),
                    getJoinParams(),
                )

            const addressOfChildContract = await bitsave
                .connect(otherAccount)
                .getUserChildContractAddress();

            console.log("User child address", addressOfChildContract)

            expect(addressOfChildContract).to.be.a.properAddress
        });

        it('should check childContract details', async() => {
            const {reg_userChildAddress} = await loadFixture(deployBitsaveFixture)

            const {userChildContract} = await childContractGenerate(reg_userChildAddress)

            console.log("testing cc stablecoin",
            await userChildContract.stableCoin(),
            await userChildContract.bitsaveAddress()
            )
        })
    })

    describe('INCREMENT SAVING', function () {
        it('should add to saving');

        it('should ensure saving mode');

        it('should properly edit data');

        it('should emit event for incrementing saving');
    });
})
