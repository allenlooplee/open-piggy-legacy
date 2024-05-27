const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PiggyLegacy", (m) => {
    const beneficiary = m.getAccount(1);
    const withdrawalPeriod = 24 * 60 * 60; // 24 hours
    const initialAmount = 100_000_000_000n; // 100 gwei

    const legacy = m.contract("PiggyLegacy", [beneficiary, withdrawalPeriod], {
        value: initialAmount, // 100 gwei
    });
  
    return { legacy };
  });