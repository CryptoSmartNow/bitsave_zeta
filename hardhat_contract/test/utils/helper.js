const {BigNumber} = require("@ethersproject/bignumber");
const {ethers} = require("hardhat");

const encodeParams = (dataTypes, data) => {
    const abiCoder = ethers.utils.defaultAbiCoder;
    return abiCoder.encode(dataTypes, data);
}

const getSwapParams = (
  destination,
  destinationToken,
  minOutput
) => {
  const paddedDestination = ethers.utils.hexlify(
    ethers.utils.zeroPad(destination, 32)
  );
  const params = encodeParams(
    ["address", "bytes32", "uint256"],
    [destinationToken, paddedDestination, minOutput]
  );

  return params;
};

module.exports = {
    encodeParams,
    getSwapParams
}
