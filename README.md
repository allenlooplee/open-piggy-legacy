# Open Piggy Legacy

This smart contract allows a specified beneficiary to withdraw its balance when the owner stops checking in after a specified period of time. This smart contract, as well as its tests, was developed with Hardhat.

## Contract Design

### Use Cases

1. **Lump Sum Legacy**: The owner deploys the smart contract with the initial funds, a beneficiary address, and a daily check-in frequency. They then regularly check in every day. The beneficiary can view the balance and the owner's last check-in time. If the owner misses a check-in, the beneficiary can withdraw the funds.
2. **Regular Savings Legacy**: The owner deploys the smart contract with a beneficiary address and a 7-day check-in frequency on Monday. They deposit funds every Monday. The beneficiary can view the balance and the owner's last check-in time. If the owner fails to check in on Monday, the beneficiary can withdraw the funds.
3. **Legacy with Withdrawal Delay Period**: The owner deploys the smart contract with the initial funds, a beneficiary address, a daily check-in frequency, and a 48-hour withdrawal delay period. They regularly check in every day. One day, they miss a check-in. After 48 hours, the beneficiary can withdraw the funds.

### Contract Members

1. **owner variable**: The person or entity that deploys the smart contract and initially funds it.
2. **beneficiary variable**: The person or entity designated by the owner as eligible to inherit the funds.
3. **checkInFrequency variable**: The days between the owner's check-ins, determining how often the owner checks in. 0 means every day. 1 means every other day. 7 means every 7 days (weekly). The window of every day is less than 48 hours. The window of every other day is less than (48 + 24) hours. The window of every 7 days is less than (48 + 7 * 24) hours.
4. **withdrawalDelayPeriod private variable**: This variable specifies the time period during which the beneficiary must wait before withdrawing the balance after the owner has not checked in once the frequency specified in the checkInFrequency variable. This period allows the owner to re-check in and restore the smart contract to its normal state. Specify 0 during deployment of the smart contract when this time period is not needed.
5. **lastCheckInTime variable**: The timestamp of the last check-in.
6. **checkIn payable function**: This function allows the owner to periodically check in, updating the lastCheckInTime variable and optionally sending additional funds.
7. **canWithdraw view function**: This function returns whether the beneficiary is allowed to withdraw the balance, considering the current time in relation to the checkInFrequency, lastCheckInTime, and the withdrawalDelayPeriod. This is a view function that allows the beneficiary to determine if they can withdraw without incurring gas costs.
8. **withdraw function**: This function allows the beneficiary to retrieve the balance of the smart contract when the owner hasn't checked in if canWithdraw function returns true, indicating that the owner's period of inactivity has exceeded the allowed time.
9. **cancel function**: This function allows the owner to terminate the smart contract at any time, effectively cancelling the beneficiary's eligibility for inheritance. Upon cancellation, the balance of the smart contract is returned to the owner.

## Unit Testing
