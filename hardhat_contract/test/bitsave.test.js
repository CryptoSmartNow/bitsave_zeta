const {ethers, network} = require("hardhat");
const {expect} = require("chai")
const {parseUnits} = require("@ethersproject/units");
const {getAddress: getAddressLib} = require("@zetachain/addresses")
const {USDC_ADDRESS} = require("../constants/config");
const {SYSTEM_CONTRACT} = require("../scripts/deploy");
const {loadFixture} = require("@nomicfoundation/hardhat-network-helpers")
const {deployBitsaveFixture} = require("./utils/generator")
const BitsaveLibrary = require("../artifacts/contracts/utils/BitsaveHelperLib.sol/BitsaveHelperLib.json")


describe("Bitsave zetachain v2", () => {
    let zetaSwapV2Contract;
    let ZRC20Contracts;
    let systemContract;

    let accounts;
    let deployer;

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
            const {bitsave, otherAccount} = await loadFixture(deployBitsaveFixture);

            await expect(
                bitsave
                    .connect(otherAccount)
                    .joinBitsave({value: 7_500})
            ).to.be.revertedWithCustomError(bitsave, "AmountNotEnough")
        });

        it('should join bitsave and return child address', async function () {
            const {bitsave, otherAccount} = await loadFixture(deployBitsaveFixture);

            await bitsave
                .connect(otherAccount)
                .joinBitsave({value: 10_500})

            const addressOfChildContract = await bitsave
                .connect(otherAccount)
                .getUserChildContractAddress();

            expect(addressOfChildContract).to.be.a.properAddress
        });
    })

    describe('CREATE SAVING', () => {
        it('should create saving');

        it('should reduce balance of user');

        it('should save risk mode and use exact token');

        it('should convert token to stableCoin for safe mode');

        it('should avoid invalid timestamp');

        it('should avoid invalid data');

        it('should prevent overwriting saving data');

        it('should emit event for creating saving');
    })

    describe('INCREMENT SAVING', function () {
        it('should add to saving');

        it('should ensure saving mode');

        it('should properly edit data');

        it('should emit event for incrementing saving');
    });

    describe('WITHDRAW SAVING', function () {
        it('should withdraw user\'s saving');

        it('should withdraw original token');

        it('should invalidate saving after withdrawal');

        it('should change value of saving to null');

        it('should emit event for withdrawal');
    });
})
