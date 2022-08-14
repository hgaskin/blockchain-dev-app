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
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(
        address indexed from,
        address indexed to,
        uint256 value
    );

    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );

    constructor(
        string memory _name, 
        string memory _symbol, 
        uint256 _totalSupply
    ){
        name = _name;
        symbol = _symbol;
        totalSupply = _totalSupply * (10 ** decimals); // 500 DAPP tokens (500 x 10^18 = 500 DAPP tokens)
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value) 
        public
        returns (bool success) 
    {
    // Check to confirm that the sender has enough balance to send
    require(balanceOf[msg.sender] >= _value);
    require(_to != address(0));

    // Deduct tokens from sender
     balanceOf[msg.sender] = balanceOf[msg.sender] - _value;

    //  Credit tokens to receiver
     balanceOf[_to] = balanceOf[_to] + _value;
     
    //  Emit an event for the transfer
     emit Transfer(msg.sender, _to, _value);

     return true;
    }

    function approve(address _spender, uint256 _value) 
        public
        returns (bool success) 
    {
        // Check to confirm reject invalid spender
        require(_spender != address(0));

        allowance[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);
        return true;
    }
}