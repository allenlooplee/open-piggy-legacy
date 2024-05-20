# Open Piggy Legacy

This smart contract allows a specified beneficiary to withdraw its balance when the owner stops checking in after a specified period of time. This smart contract, as well as its tests, was developed with Hardhat.

## Contract Design

### Use Cases

1. **Lump Sum Legacy**: The owner deploys the smart contract with the initial funds, a beneficiary address, and a daily check-in interval. Then the owner checks in every day. The beneficiary can view the balance of the smart contract and the owner's last check-in time. If the owner doesn't check in some day, the beneficiary will be able to withdraw the balance of the smart contract.
2. **Regular Savings Legacy**: The owner deploys the smart contract with a beneficiary address and a weekly check-in interval. Then the owner checks in every week with some funds. The beneficiary can view the balance of the smart contract and the owner's last check-in time. If the owner doesn't check in some day within the check-in interval, the beneficiary will be able to withdraw the balance of the smart contract.
3. **Legacy with Withdrawal Delay Period**: The owner deploys the smart contract with the initial funds, a beneficiary address, a daily check-in interval, and a 48-hour withdrawal delay period. Then the owner checks in every day. One day the beneficiary notices that the owner doesn't check in as expected. Then the beneficiary waits for 48 hours and withdraws the balance of the smart contract.

### Members

1. **owner variable**: The person or entity that deploys the smart contract and initially funds it.
2. **beneficiary variable**: The person or entity designated by the owner as eligible to inherit the funds.
3. **checkInInterval variable**: The time interval between the owner's check-ins, determining how often the owner checks in.
4. **withdrawalDelayPeriod private variable**: This variable specifies the time period during which the beneficiary must wait before withdrawing the balance after the owner has not checked in within the checkInInterval. This period allows the owner to re-check in and restore the smart contract to its normal state. Specify 0 during deployment of the smart contract when this time period is not needed.
5. **lastCheckInTime variable**: The timestamp of the last check-in.
6. **checkIn payable function**: This function allows the owner to periodically interact with the smart contract, updating the lastCheckInTime variable and optionally sending additional funds.
7. **canWithdraw view function**: This function returns whether the beneficiary is allowed to withdraw the balance, considering the current time in relation to the checkInInterval, lastCheckInTime, and the private withdrawalDelayWindow. This is a view function that allows the beneficiary to determine if they can withdraw without incurring gas costs.
8. **withdraw function**: This function allows the beneficiary to retrieve the balance of the smart contract when the owner has not interacted with it (checked in) within the specified checkInInterval, indicating that the owner's period of inactivity has exceeded the allowed time.
9. **cancel function**: This function allows the owner to terminate the smart contract at any time, effectively cancelling the beneficiary's eligibility for inheritance. Upon cancellation, the balance of the smart contract is returned to the owner.

## Unit Testing
