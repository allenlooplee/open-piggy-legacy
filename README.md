# Open Piggy Legacy

This smart contract allows a specified beneficiary to withdraw its balance when the owner stops checking in after a specified period of time. This smart contract, as well as its tests, was developed with Hardhat.

## Contract Design

### Use Cases

1. **Lump Sum Legacy**: The owner deploys the smart contract with the initial funds and a beneficiary address. They then regularly check in every day. The beneficiary can view the balance and the owner's last check-in time. If the owner misses a check-in, the beneficiary can withdraw the funds the next day.
2. **Regular Savings Legacy**: The owner deploys the smart contract with a beneficiary address. They regularly check in daily, with an additional fund transfer on Mondays. The beneficiary can view the balance and the owner's last check-in time. If the owner misses a check-in, the beneficiary can withdraw the funds the next day.
3. **Legacy with Withdrawal Delay Period**: The owner deploys the smart contract with the initial funds, a beneficiary address, and a one-day withdrawal delay period. They regularly check in every day. One day, they miss a check-in. The beneficiary can withdraw the funds the day after the next day.

### Contract Members

1. **owner variable**: The person or entity that deploys the smart contract and initially funds it.
2. **beneficiary variable**: The person or entity designated by the owner as eligible to inherit the funds.
3. **withdrawalDelayPeriod private variable**: This variable specifies the time period (in seconds) that the beneficiary must wait before withdrawing the balance after the owner has not checked in within a day. If set to 0, the beneficiary can withdraw at 00:00:00 the next day. Otherwise, the beneficiary must wait for the specified number of seconds starting from 00:00:00 the next day.
4. **lastCheckInTime variable**: The timestamp of the last check-in.
5. **checkIn payable function**: This function allows the owner to check in every day, updating the lastCheckInTime variable and optionally sending additional funds.
6. **canWithdraw view function**: This function returns whether the beneficiary is allowed to withdraw the balance, considering the current time in relation to the lastCheckInTime and the withdrawalDelayPeriod. This is a view function that allows the beneficiary to determine if they can withdraw without incurring gas costs.
7. **withdraw function**: This function allows the beneficiary to retrieve the balance of the smart contract when the owner hasn't checked in if canWithdraw function returns true, indicating that the owner's period of inactivity has exceeded the allowed time.
8. **terminate function**: This function allows the owner to terminate the contract at any time, revoking the beneficiary's inheritance eligibility and returning the remaining balance to the owner.

### Implementation Considerations

1. [`external` vs `public` best practices](https://ethereum.stackexchange.com/questions/19380/external-vs-public-best-practices)
2. [What is the time zone of the Ethereum block chain?](https://ethereum.stackexchange.com/questions/68064/what-is-the-time-zone-of-the-ethereum-block-chain)
3. [How do you work with Date and time on Ethereum platform](https://ethereum.stackexchange.com/questions/18192/how-do-you-work-with-date-and-time-on-ethereum-platform)

## Unit Testing

### Test Cases

1. **Deployment**
   - It should deploy and set the state when the owner deploys the smart contract.
     - Expect the owner variable to be the address of the owner.
     - Expect the beneficiary variable to be the address of the beneficiary.
     - Expect the lastCheckInTime variable to match today's date.
     - Expect the canWithdraw function to return false.
     - Expect the balance of the smart contract to be the amount sent by the owner initially.
2. **Checking in**
   - It should check in when the owner calls the checkIn function.
     - Expect the lastCheckInTime variable to match today's date.
     - Expect the canWithdraw function to return false.
     - Expect the balance of the smart contract to be the same as what was there beforehand.
   - It should check in and receive the funds when the owner calls the checkIn function with new funds.
     - Expect the lastCheckInTime variable to match today's date.
     - Expect the canWithdraw function to return false.
     - Expect the balance of the smart contract to be the same as what was there beforehand plus any new funds that have 
been received.
   - It should revert when non-owner checks in.
     - Expect the call to the checkIn function to be reverted.
     - Expect the lastCheckInTime variable to be unchanged.
     - Expect the balance of the smart contract to be unchanged.
3. **Withdrawal**
   - It should withdraw the balance of the smart contract the day after tomorrow (T + 2) when the owner misses a check-in tomorrow (T + 1).
     - Expect the lastCheckInTime variable to match today's date (T).
     - Expect the current time to match the day after tomorrow's date (T + 2).
     - Expect the canWithdraw function to return true.
     - Expect the balance of the smart contract to be zero.
     - Expect the balance of the be beneficiary to be the same as what was there beforehand plus the balance of the smart contract.
   - It should revert the withdrawal tomorrow (T + 1) when the owner checks in today (T).
     - Expect the lastCheckInTime variable to match today's date (T).
     - Expect the current time to match tomorrow's date (T + 1).
     - Expect the canWithdraw function to return false.
     - Expect the call to the withdraw function to be reverted.
     - Expect the balance of the smart contract to be unchanged.
   - It should withdraw the balance of the smart contract two days after tomorrow (T + 3) when the owner misses a check-in tomorrow (T + 1) with a one-day withdrawal delay period.
     - Expect the lastCheckInTime variable to match today's date (T).
     - Expect the current time to match two day after tomorrow's date (T + 3).
     - Expect the canWithdraw function to return true.
     - Expect the balance of the smart contract to be zero.
     - Expect the balance of the be beneficiary to be the same as what was there beforehand plus the balance of the smart contract.
   - It should revert the withdrawal the day after tomorrow (T + 2) when the owner misses a check-in tomorrow (T + 1) with a one-day withdrawal delay period.
     - Expect the lastCheckInTime variable to match today's date (T).
     - Expect the current time to match the day after tomorrow's date (T + 2).
     - Expect the canWithdraw function to return false.
     - Expect the call to the withdraw function to be reverted.
     - Expect the balance of the smart contract to be unchanged.
   - It should revert the withdrawal two days after tomorrow (T + 3) when the owner misses a check-in tomorrow (T + 1) but re-checks in the day after tomorrow (T + 2) with a one-day withdrawal delay period.
     - Expect the lastCheckInTime variable to match today's date (T).
     - Expect the lastCheckInTime variable after re-checking in to match the day after tomorrow's date (T + 2).
     - Expect the current time to match two day after tomorrow's date (T + 3).
     - Expect the canWithdraw function to return false.
     - Expect the call to the withdraw function to be reverted.
     - Expect the balance of the smart contract to be unchanged.
   - It should revert when non-beneficiary withdraws.
     - Expect the call to the withdraw function to be reverted.
     - Expect the balance of the smart contract to be unchanged.
4. **Termination**
   - It should revoke the smart contract when the owner terminate it.
     - Expect the beneficiary variable to be zero.
     - Expect the balance of the owner to be the same as what was there beforehand plus the balance of the smart contract.
     - Expect the balance of the smart contract to be zero.

### References

1. [Time-dependent tests with Hardhat?](https://ethereum.stackexchange.com/questions/86633/time-dependent-tests-with-hardhat/92906)
