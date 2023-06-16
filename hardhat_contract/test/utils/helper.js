const {BigNumber} = require("@ethersproject/bignumber");
const {ethers} = require("hardhat");
const Opcodes = require("./constants");
const {encodeParams} = require("@zetachain/zevm-example-contracts/scripts/zeta-swap/helpers");

const paramTypes = ["bytes32", "string", "uint256", "uint8", "bool"]

const encodeParams = (dataTypes, data) => {
    return ethers.utils.defaultAbiCoder.encode(dataTypes, data);
}

const makeOpcode = (opcode) => ethers.utils.hexlify(
    ethers.utils.zeroPad(opcode)
)

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

function getJoinParams() {
    const paddedOpcode = makeOpcode(Opcodes.JOIN)

    return encodeParams(
        paramTypes,
        [paddedOpcode, "", 0, 0, false]
    )
}

const getSavingParams = (
    nameOfSaving,
    maturityTimestamp,
    penaltyPercentage,
    safeMode
) => {
    const paddedOpcode = makeOpcode(Opcodes.CREATE)

    return encodeParams(
        paramTypes,
        [paddedOpcode, nameOfSaving, maturityTimestamp, penaltyPercentage, safeMode]
    )
}

module.exports = {
    encodeParams,
    getSwapParams,
    getJoinParams,
    getSavingParams
}
