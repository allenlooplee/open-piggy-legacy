// SPDX-License-Identifier: MIT
pragma solidity ^0.8.25;

contract PiggyLegacy {
    address public owner;
    address public beneficiary;
    uint256 public lastCheckInTime;
    uint256 private withdrawalDelayPeriod;
    
    constructor(address _beneficiary, uint256 _withdrawalDelayPeriod) {
        owner = msg.sender;
        beneficiary = _beneficiary;
        withdrawalDelayPeriod = _withdrawalDelayPeriod;
        lastCheckInTime = block.timestamp;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Owner only");
        _;
    }

    function checkIn() external payable onlyOwner {
        require(beneficiary != address(0), "Contract already terminated");

        lastCheckInTime = block.timestamp;
    }

    function terminate() external onlyOwner {
        require(beneficiary != address(0), "Contract already terminated");

        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
        
        beneficiary = address(0);
    }

    function canWithdraw() public view returns(bool) {
        if (msg.sender != beneficiary) {
            return false;
        }

        uint256 lastCheckInDate = lastCheckInTime / 1 days;
        uint256 currentDate = block.timestamp / 1 days;

        // Check if at least one full day has passed since the last check-in date
        if (currentDate - lastCheckInDate > 1) {
            // Calculate the midnight timestamp for today
            uint256 midnightToday = currentDate * 1 days;

            // Check if the current timestamp has passed the specified withdrawal delay period since midnight today
            return block.timestamp >= midnightToday + withdrawalDelayPeriod;
        } else {
            return false;
        }
    }

    function withdraw() external {
        require(msg.sender == beneficiary, "Beneficiary only");
        require(canWithdraw(), "Withdrawal not allowed");

        (bool success, ) = beneficiary.call{value: address(this).balance}("");
        require(success, "Withdrawal failed");
    }
}
