// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Import this file to use console.log
import "hardhat/console.sol";

contract Token {
    string public name;
    string public symbol = "DAPP";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // Track Balances
    mapping(address => uint256) public balanceOf;

    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) {
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals); // 500 DAPP tokens (500 x 10^18 = 500 DAPP tokens)
        balanceOf[msg.sender] = totalSupply;
    }
}
