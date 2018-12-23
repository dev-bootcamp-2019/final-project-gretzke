pragma solidity ^0.4.24;

/// @title utility library for truffle tests
contract Utility {

    function encodeID(string _name, uint256 _arrayLen, address _sender, uint256 _blocknumber) public pure returns(bytes) {
        return abi.encodePacked(_name, _arrayLen, _sender, _blocknumber);
    }

}