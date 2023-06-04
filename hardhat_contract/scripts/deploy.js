const ethers = require("hardhat");
const { task } = require("hardhat/config")
const {USDC_ADDRESS} = require("../constants/config");

const SYSTEM_CONTRACT = "0x239e96c8f17C85c30100AC26F635Ea15f23E9c67";

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

module.exports = {
  SYSTEM_CONTRACT
}

// main().catch((error) => {
//   console.error(error);
//   process.exit(1);
// });