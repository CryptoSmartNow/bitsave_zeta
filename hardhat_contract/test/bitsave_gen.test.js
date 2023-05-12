import { BigNumber } from "@ethersproject/bignumber";
import { parseUnits } from "@ethersproject/units";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import {getAddress as getAddressLib} from "@zetachain/addresses";
import { expect } from "chai";
import { ethers, network } from "hardhat";
const {USDC_ADDRESS, ROUTERADDRESS, ONE_GWEI} = require("../constants/config")


describe("Bitsave test", ()=>{
    let BitsaveContract;
    let ZRC20Contracts;
    let systemContract;

    let accounts;
    let deployer;

    beforeEach(async ()=>{
        accounts = await ethers.getSigners();
        [deployer] = accounts;

        await network.provider.send("hardhat_setBalance", [
            deployer.address,
            parseUnits("1000000").toHexString()
        ])

        const uniswapRouterAddr = getAddressLib({
            address: "uniswapV2Router02",
            networkName: "eth-mainnet",
            zetaNetwork: "mainnet",
        })
        const uniswapFactoryAddr = getAddressLib({
            address: "uniswapV2Factory",
            networkName: "eth-mainnet",
            zetaNetwork: "mainnet",
        })
        const wGasToken = getAddressLib({
          address: "weth9",
          networkName: "eth-mainnet",
          zetaNetwork: "mainnet",
        });

        const evmSetupResult = await evmSetup(
          wGasToken,
          uniswapFactoryAddr,
          uniswapRouterAddr
        );
        ZRC20Contracts = evmSetupResult.ZRC20Contracts;
        systemContract = evmSetupResult.systemContract;

        const Bitsave = await ethers.getContractFactory("Bitsave");
        const bitsave = await Bitsave.deploy(
            USDC_ADDRESS,
            systemContract.address,
            {
                value: 2 * ONE_GWEI
            }
        )
        await bitsave.deployed();
    })
})
