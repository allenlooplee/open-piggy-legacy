# Open Piggy Legacy

This smart contract allows a specified beneficiary to withdraw its balance when the owner stops checking in after a specified period of time. This smart contract, as well as its tests, was developed with Hardhat.

## Contract Design

### Use Cases

1. **Lump Sum Legacy**: The owner deploys the smart contract with the initial funds and a beneficiary address. They then regularly check in every day. The beneficiary can view the balance and the owner's last check-in time. If the owner misses a check-in, the beneficiary can withdraw the funds.
2. **Regular Savings Legacy**: The owner deploys the smart contract with a beneficiary address. They regularly check in daily, with an additional fund transfer on Mondays. The beneficiary can view the balance and the owner's last check-in time. If the owner misses a day of checking in, the beneficiary can withdraw the funds.
3. **Legacy with Withdrawal Delay Period**: The owner deploys the smart contract with the initial funds, a beneficiary address, and a 48-hour withdrawal delay period. They regularly check in every day. One day, they miss a check-in. After 48 hours, the beneficiary can withdraw the funds.

### Contract Members

1. **owner variable**: The person or entity that deploys the smart contract and initially funds it.
2. **beneficiary variable**: The person or entity designated by the owner as eligible to inherit the funds.
3. **withdrawalDelayPeriod private variable**: This variable specifies the time period (in seconds) that the beneficiary must wait before withdrawing the balance after the owner has not checked in within a day. If set to 0, the beneficiary can withdraw at 00:00:00 the next day. Otherwise, the beneficiary must wait for the specified number of seconds starting from 00:00:00 the next day.
4. **lastCheckInTime variable**: The timestamp of the last check-in.
5. **checkIn payable function**: This function allows the owner to check in every day, updating the lastCheckInTime variable and optionally sending additional funds.
6. **canWithdraw view function**: This function returns whether the beneficiary is allowed to withdraw the balance, considering the current time in relation to the lastCheckInTime and the withdrawalDelayPeriod. This is a view function that allows the beneficiary to determine if they can withdraw without incurring gas costs.
7. **withdraw function**: This function allows the beneficiary to retrieve the balance of the smart contract when the owner hasn't checked in if canWithdraw function returns true, indicating that the owner's period of inactivity has exceeded the allowed time.
8. **cancel function**: This function allows the owner to terminate the smart contract at any time, effectively cancelling the beneficiary's eligibility for inheritance. Upon cancellation, the balance of the smart contract is returned to the owner.

## Unit Testing

### Test Cases

1. **Deployment**
2. **Checking in**
3. **Withdrawal**
4. **Cancellation**
