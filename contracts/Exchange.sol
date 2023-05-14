// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

// Import this file to use console.log
import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount; // the account that receives exchange fees
    uint256 public feePercent; // the fee percentage
    uint256 public orderCount;

    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(uint256 id, 
                address user, 
                address tokenGet, 
                uint256 amountGet, 
                address tokenGive, 
                uint256 amountGive, 
                uint256 timestamp);

    event Cancel(uint256 id, 
            address user, 
            address tokenGet, 
            uint256 amountGet, 
            address tokenGive, 
            uint256 amountGive, 
            uint256 timestamp);

    event Trade(uint256 id,
                address user,
                address tokenGet,
                uint256 amountGet,
                address tokenGive,
                uint256 amountGive,
                address creator,
                uint256 timestamp); 

    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint256 _amount) public {
        require(Token(_token).transferFrom(msg.sender, address(this), _amount), "Insufficient allowance");
        tokens[_token][msg.sender] += _amount;

        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }

    function withdrawToken(address _token, uint256 _amount) public {
        require(tokens[_token][msg.sender] >= _amount, "Insufficient balance");
        Token(_token).transfer(msg.sender, _amount);
        tokens[_token][msg.sender] -= _amount;

        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        require(balanceOf(_tokenGive, msg.sender) >= _amountGive, "Insufficient balance");

        orderCount++;
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);

        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp);
    }

    function cancelOrder(uint256 _id) public {
        _Order storage order = orders[_id];

        require(order.id == _id, "Invalid order id");

        require(msg.sender == order.user, "Invalid user");

        orderCancelled[_id] = true;

        emit Cancel(_id, order.user, order.tokenGet, order.amountGet, order.tokenGive, order.amountGive, block.timestamp);
    }

    function fillOrder(uint256 _id) public {
        require(_id > 0 && _id <= orderCount, "Invalid order id");
        require(!orderFilled[_id], "Order already filled");
        require(!orderCancelled[_id], "Order already cancelled");

        _Order storage _order = orders[_id];

        tokens[_order.tokenGet][msg.sender] -=  _order.amountGet + _order.amountGet * feePercent / 100;
        tokens[_order.tokenGet][_order.user] += _order.amountGet;

        tokens[_order.tokenGive][msg.sender] += _order.amountGive;
        tokens[_order.tokenGive][_order.user] -= _order.amountGive;

        tokens[_order.tokenGet][feeAccount] += _order.amountGet * feePercent / 100;

        orderFilled[_id] = true;

        emit Trade(_id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, _order.user, block.timestamp);
    }
}
