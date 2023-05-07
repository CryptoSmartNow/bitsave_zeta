
const { task } = require("hardhat/config");
const dotenv = require("dotenv");
const axios = require("axios");

dotenv.config();

const main = async(args, hre) => {
  if (!process.env.PRIVATE_KEY) {
    throw new Error("Please set PRIVATE_KEY; npm hardhat account --save");
  }

  const { address } = new hre.ethers.Wallet(process.env.PRIVATE_KEY);
  
  // Get token from faucet

  try {
    await axios.get(`https://faucet.zetachain.link/eth/${address}`)
    console.log("✅Testnet token retrieved from faucet successfully!")
  }catch (e) {
    console.log("❌Errr getting tokens from faucet!")
  }

}

task("faucet", "").setAction(main);

