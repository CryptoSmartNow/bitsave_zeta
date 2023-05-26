import {ethers, network} from "hardhat";
import {parseUnits} from "@ethersproject/units";
import {getAddress as getAddressLib} from "@zetachain/addresses"

describe("Bitsave zetachain v2", ()=>{
    let zetaSwapV2Contract;
    let ZRC20Contracts;
    let systemContract;

    let accounts;
    let deployer;

    beforeEach(async ()=>{
        accounts = await ethers.getSigners();
        // fetch one deployer
        [deployer] = accounts;

        await network.provider.send(
            "hardhat_setBalance",
            [
                deployer.address,
                parseUnits("1000000").toHexString()
            ]
        )

        const uniswapRouterAddr = getAddressLib({
            address: "uniswapV2Router02",
            networkName: "eth-mainnet",
            zetaNetwork: "mainnet"
        })

        const uniswapFactoryAddr = getAddressLib({
          address: "uniswapV2Factory",
          networkName: "eth-mainnet",
          zetaNetwork: "mainnet",
        });

        const evmSetup = await evmSetup
    })

    it('should join bitsave', function () {
        
    });
    
    describe('CREATE SAVING', ()=>{
        it('should create saving', function () {
            
        });

        it('should reduce balance of user', function () {
            
        });

        it('should save risk mode and use exact token', function () {
            
        });

        it('should convert token to stableCoin for safe mode', function () {
            
        });

        it('should avoid invalid timestamp', function () {
            
        });

        it('should avoid invalid data', function () {
            
        });

        it('should prevent overwriting saving data', function () {
            
        });

        it('should emit event for creating saving', function () {
            
        });
    })

    describe('INCREMENT SAVING', function () {
        it('should add to saving', function () {
            
        });

        it('should ensure saving mode', function () {
            
        });

        it('should properly edit data', function () {
            
        });

        it('should emit event for incrementing saving', function () {
            
        });
    });

    describe('WITHDRAW SAVING', function () {
        it('should withdraw user\'s saving', function () {
            
        });

        it('should withdraw original token', function () {
            
        });

        it('should invalidate saving after withdrawal', function () {
            
        });

        it('should change value of saving to null', function () {
            
        });

        it('should emit event for withdrawal', function () {
            
        });
    });
})
