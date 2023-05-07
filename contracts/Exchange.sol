// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Import this file to use console.log
import "hardhat/console.sol";

contract Exchange {
    address public feeAccount; // the account that receives exchange fees
    uint256 public feePercent; // the fee percentage

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }


    // address public feeAccount; // the account that receives exchange fees
    // uint256 public feePercent; // the fee percentage
    // address constant ETHER = address(0); // store Ether in tokens mapping with blank address
    // mapping(address => mapping(address => uint256)) public tokens;
    // mapping(uint256 => _Order) public orders;
    // uint256 public orderCount;
    // mapping(uint256 => bool) public orderCancelled;
    // mapping(uint256 => bool) public orderFilled;

    // event Deposit(address token, address user, uint256 amount, uint256 balance);
    // event Withdraw(address token, address user, uint256 amount, uint256 balance);
    // event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
    // event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);
    // event Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address userFill, uint256 timestamp);

    // struct _Order {
    //     uint256 id;
    //     address user;
    //     address tokenGet;
    //     uint256 amountGet;
    //     address tokenGive;
    //     uint256 amountGive;
    //     uint256 timestamp;
    // }

    // constructor(address _feeAccount, uint256 _feePercent) {
    //     feeAccount = _feeAccount;
    //     feePercent = _feePercent;
    // }

    // // Fallback: reverts if Ether is sent to this smart contract by mistake
    // fallback() external {
    //     revert();
    // }

    // function depositEther() payable public {
    //     tokens[ETHER][msg.sender] += msg.value;
    //     emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
    // }

    // function withdrawEther(uint256 _amount) public {
    //     require(tokens[ETHER][msg.sender] >= _amount, "Insufficient balance");
    //     tokens[ETHER][msg.sender] -= _amount;
    //     payable(msg.sender).transfer(_amount);
    //     emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    // }

    // function depositToken(address _token, uint256 _amount) public {
    //     require(_token != ETHER, "Cannot deposit Ether");
    //     require(Token(_token).transferFrom(msg.sender, address(this), _amount), "Insufficient allowance");
    //     tokens[_token][msg.sender] += _amount;
    //     emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    // }

}