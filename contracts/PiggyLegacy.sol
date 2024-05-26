// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract PiggyLegacy {
    address public owner;
    address public beneficiary;
    uint256 public lastCheckInTime;
    uint256 private withdrawalDelayPeriod;
    
    constructor(address _beneficiary, uint256 _withdrawalDelayPeriod) payable {
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
            // The delay starts at midnight (00:00) on the day after the first missed check-in date,
            // which is the second day following the last check-in date.
            uint256 delayStartTime = (lastCheckInDate + 2) * 1 days;

            // Check if the current timestamp has passed the specified withdrawal delay period since the delay start time.
            return block.timestamp >= delayStartTime + withdrawalDelayPeriod;
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
