// import { ethers } from "hardhat";
const { task } = require("hardhat/config");
const {USDC_ADDRESS, STABLE_C} = require("../constants/config");

const SYSTEM_CONTRACT = "0x239e96c8f17C85c30100AC26F635Ea15f23E9c67";

const main = async (args, hre) => {
  console.log(`Deploying Bitsave...`);

  if (hre.network.name !== "athens") {
    throw new Error(
      '🚨 Please use the "athens" network to deploy to ZetaChain.'
    );
  }

  const [signer] = await hre.ethers.getSigners();
  console.log(`🔑 Using account: ${signer.address}\n`);

  const Factory = await hre.ethers.getContractFactory("Bitsave");
  const contract = await Factory.deploy(
      STABLE_C,
      SYSTEM_CONTRACT
  );
  await contract.deployed();

  console.log(`🚀 Successfully deployed contract on ZetaChain.
        📜 Contract address: ${contract.address}
        🌍 Explorer: https://explorer.zetachain.com/address/${contract.address}
  `);

  console.log("Deployed Bitsave, Address:", contract.address);
};

task("deploy", "Deploy the contract").setAction(main);

module.exports = {
    SYSTEM_CONTRACT
}
