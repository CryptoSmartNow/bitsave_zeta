require("@nomicfoundation/hardhat-toolbox");
const { HardhatUserConfig } = require("hardhat/config");
const dotenv = require("dotenv");
const { getHardhatConfigNetworks } =  require("@zetachain/addresses-tools/dist/networks")
// Tasks
require("./tasks/account")
require("./tasks/faucet")
require("./tasks/deploy")

dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY !== undefined ?
  [`0x${process.env.PRIVATE_KEY}`] : [];

const config = {
  solidity: {
    compilers: [
      { version: "0.6.6" /** For uniswap v2 */ },
      { version: "0.8.7" },
    ]
  },
  networks: {
    ...getHardhatConfigNetworks(PRIVATE_KEY)
  },
  gas: 1800000,
};

module.exports = config;

/** @type import('hardhat/config').HardhatUserConfig */
// module.exports = {
//   solidity: "0.7.5",
// };
