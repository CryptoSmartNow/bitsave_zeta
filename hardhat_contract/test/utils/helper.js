const {BigNumber} = require("@ethersproject/bignumber");
const {ethers} = require("hardhat");
const Opcodes = require("./constants");
// const {encodeParams} = require("@zetachain/zevm-example-contracts/scripts/zeta-swap/helpers");

const paramTypes = ["bytes", "string", "uint256", "uint256", "uint8", "bool"]

const encodeParams = (dataTypes, data) => {
    return ethers.utils.defaultAbiCoder.encode(dataTypes, data);
}

// const makeOpcode = (opcode) => ethers.utils.hexlify(
//     ethers.utils.zeroPad(opcode)
// )

const makeOpcode = (opcode) => ethers.utils.toUtf8Bytes(opcode)

const getSwapParams = (
    destination,
    destinationToken,
    minOutput
) => {
    const paddedDestination = ethers.utils.hexlify(
        ethers.utils.zeroPad(destination, 32)
    );
    return encodeParams(
        ["address", "bytes32", "uint256"],
        [destinationToken, paddedDestination, minOutput]
    );
};

function getJoinParams() {
    const paddedOpcode = makeOpcode(Opcodes.JOIN)

    return encodeParams(
        paramTypes,
        [paddedOpcode, "none", 0, 0, 0, false]
    )
}

const getSavingParams = (
    nameOfSaving,
    maturityTimestamp,
    startTime,
    penaltyPercentage,
    safeMode
) => {
    const paddedOpcode = makeOpcode(Opcodes.CREATE)

    return encodeParams(
        paramTypes,
        [
            paddedOpcode,
            nameOfSaving,
            maturityTimestamp,
            startTime, penaltyPercentage,
            safeMode
        ]
    )
}

const getIncrementParams = (
    nameOfSaving
) => {
    const paddedOpcode = makeOpcode(Opcodes.INCREMENT)

    return encodeParams(
        paramTypes,
        [paddedOpcode, nameOfSaving, 0, 0, 0, false]
    )
}

module.exports = {
    encodeParams,
    getSwapParams,
    getJoinParams,
    getSavingParams,
    getIncrementParams
}
