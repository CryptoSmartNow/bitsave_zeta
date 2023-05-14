import { ethers } from "hardhat";
import { task } from "hardhat/config"
import {USDC_ADDRESS} from "../constants/config";

export const SYSTEM_CONTRACT = "0x239e96c8f17C85c30100AC26F635Ea15f23E9c67";

const main = async () => {
  console.log(`Deploying Bitsave...`);

  const Factory = await ethers.getContractFactory("Bitsave");
  const contract = await Factory.deploy(
      USDC_ADDRESS,
      SYSTEM_CONTRACT
  );
  await contract.deployed();

  console.log("Deployed ZetaSwap. Address:", contract.address);
};

task("deploy", "Deploy the contract").setAction(main);

// main().catch((error) => {
//   console.error(error);
//   process.exit(1);
// });