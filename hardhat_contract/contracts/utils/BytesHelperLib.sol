// SPDX-License-Identifier: UNLICENSED
pragma solidity =0.8.7;

library BytesHelperLib {
    function bytesToAddress(bytes calldata data, uint256 offset) internal pure returns (address output) {
        bytes memory b = data[offset:offset + 20];
        assembly {
            output := mload(add(b, 20))
        }
    }

    function bytesToUint32(bytes calldata data, uint256 offset) internal pure returns (uint32 output) {
        bytes memory b = data[offset:offset + 4];
        assembly {
            output := mload(add(b, 4))
        }
    }

    function addressToBytes(address someAddress) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(someAddress)));
    }

    function compareStrings(bytes memory b1, string memory s2) internal pure returns (bool) {
        bytes memory b2 = bytes(s2);
        uint256 l1 = b1.length;
        if (l1 != b2.length) return false;
        for (uint256 i = 0; i < l1; i++) {
            if (b1[i] != b2[i]) return false;
        }
        return true;
    }

    function bytes32ToBytes(bytes32 data) internal pure returns (bytes memory) {
        return abi.encodePacked(data);
    }
}

