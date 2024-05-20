# Open Piggy Legacy

This smart contract allows a specified beneficiary to withdraw its balance when the owner stops checking in after a specified period of time. This smart contract, as well as its tests, was developed with Hardhat.

## Contract Design

### Members

1. **owner variable**: The person or entity that deploys the smart contract and initially funds it.
2. **beneficiary variable**: The person or entity designated by the owner as eligible to inherit the funds.
3. **checkInInterval variable**: The time interval between the owner's check-ins, determining how often they interact with the smart contract.
4. **withdrawalDelayWindow private variable**: This variable specifies the time period during which the beneficiary must wait before withdrawing the balance after the owner has not checked in within the checkInInterval. This window allows the owner to re-check in and restore the smart contract to its normal state. This is optional.
5. **lastCheckInTime variable**: The timestamp of the last check-in.
6. **checkIn payable function**: This function allows the owner to periodically interact with the smart contract, updating the lastCheckInTime variable and optionally sending additional funds.
7. **canWithdraw view function**: This function returns whether the beneficiary is allowed to withdraw the balance, considering the current time in relation to the checkInInterval, lastCheckInTime, and the private withdrawalDelayWindow. This is a view function that allows the beneficiary to determine if they can withdraw without incurring gas costs.
8. **withdraw function**: This function allows the beneficiary to retrieve the balance of the smart contract when the owner has not interacted with it (checked in) within the specified checkInInterval, indicating that the owner's period of inactivity has exceeded the allowed time.
9. **cancel function**: This function allows the owner to terminate the smart contract at any time, effectively cancelling the beneficiary's eligibility for inheritance. Upon cancellation, the balance of the smart contract is returned to the owner.

## Unit Testing
