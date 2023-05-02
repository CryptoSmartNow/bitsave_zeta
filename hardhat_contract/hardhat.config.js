require("@nomicfoundation/hardhat-toolbox");
const { HardhatUserConfig } = require("hardhat/config");
const dotenv = require("dotenv");
const { getHardhatConfigNetworks } =  require("@zetachain/addresses-tools/dist/networks")
// Tasks
require("./tasks/account")
require("./tasks/faucet")

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY !== undefined ?
  [`0x${process.env.PRIVATE_KEY}`] : [];

const config = {
  solidity: "0.8.1",
  networks: {
    ...getHardhatConfigNetworks(PRIVATE_KEY)
  }
};

module.exports = config;

/** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.7.5",
// };
