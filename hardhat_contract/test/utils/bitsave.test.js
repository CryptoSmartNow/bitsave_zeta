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
})
