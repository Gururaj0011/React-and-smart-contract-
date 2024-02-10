// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

contract Assessment {
    address payable public owner;
    uint256 public balance;
    uint256 public totalCashback;
    uint256 public transactionLimit;

    event Deposit(uint256 amount);
    event Withdraw(uint256 amount);
    event Cashback(uint256 amount);
    event SetTransactionLimit(uint256 limit);

    constructor(uint initBalance) payable {
        owner = payable(msg.sender);
        balance = initBalance;
    }

    function getBalance() public view returns(uint256){
        return balance;
    }

    function getTotalCashback() public view returns(uint256){
        return totalCashback;
    }

    function deposit(uint256 _amount) public payable {
        uint256 _previousBalance = balance;

        // make sure this is the owner
        require(msg.sender == owner, "You are not the owner of this account");

        // perform transaction
        balance += _amount;

        // assert transaction completed successfully
        assert(balance == _previousBalance + _amount);

        // emit the event
        emit Deposit(_amount);
    }

    error InsufficientBalance(uint256 balance, uint256 withdrawAmount);

    function withdraw(uint256 _withdrawAmount) public {
        require(msg.sender == owner, "You are not the owner of this account");
        uint256 _previousBalance = balance;
        if (balance < _withdrawAmount) {
            revert InsufficientBalance({
                balance: balance,
                withdrawAmount: _withdrawAmount
            });
        }

        // withdraw the given amount
        balance -= _withdrawAmount;

        // assert the balance is correct
        assert(balance == (_previousBalance - _withdrawAmount));

        // emit the event
        emit Withdraw(_withdrawAmount);
    }

    function cashback() public {
        uint256 cashbackAmount;

        if (balance > 1000) {
            cashbackAmount = 100;
        } else if (balance > 500) {
            cashbackAmount = 50;
        } else {
            return; // No cashback if conditions are not met
        }

        // perform cashback transaction
        balance += cashbackAmount;
        totalCashback += cashbackAmount;

        // emit the cashback event
        emit Cashback(cashbackAmount);
    }

    function setTransactionLimit(uint256 _limit) public {
        require(msg.sender == owner, "You are not the owner of this account");
        transactionLimit = _limit;
        emit SetTransactionLimit(_limit);
    }
}
