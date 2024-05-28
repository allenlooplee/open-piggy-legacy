const { loadFixture, time } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const chai = require('chai');
chai.use(require('chai-luxon'));
const { expect } = chai;
const { DateTime } = require('luxon');

describe("PiggyLegacy", function() {
    async function deployLegacyFixture() {
        const [owner, beneficiary] = await ethers.getSigners();
        const initialAmount = 10_000_000_000;
        const oneDayDelay = 24 * 60 * 60; // 1 day in seconds

        const Legacy = await ethers.getContractFactory("PiggyLegacy");
        const legacy = await Legacy.deploy(beneficiary, 0, { value: initialAmount });
        const legacyWithDelay = await Legacy.deploy(beneficiary, oneDayDelay, { value: initialAmount });

        return { legacy, legacyWithDelay, initialAmount, owner, beneficiary };
    }
    
    describe("Deployment", () => {
        it("should deploy and set the state when the owner deploys the smart contract", async function() {
            const { legacy, initialAmount, owner, beneficiary } = await loadFixture(deployLegacyFixture);

            const lastCheckInUTC = DateTime.fromSeconds(Number(await legacy.lastCheckInTime())).setZone("UTC");
            const todayUTC = DateTime.utc();

            expect(await legacy.owner()).to.equal(owner.address);
            expect(await legacy.beneficiary()).to.equal(beneficiary.address);
            expect(lastCheckInUTC).to.be.sameDate(todayUTC);
            expect(await legacy.canWithdraw()).to.be.false;
            expect(await ethers.provider.getBalance(legacy.target)).to.equal(initialAmount);
        });
    });

    describe("Checking in", () => {
        it("should check in tomorrow when the owner calls the checkIn function tomorrow (T + 1)", async function() {
            const { legacy, initialAmount } = await loadFixture(deployLegacyFixture);

            const tomorrowUTC = DateTime.utc().plus({ days: 1 });
            await time.increaseTo(Math.round(tomorrowUTC.toSeconds()));
            await legacy.checkIn();
            const lastCheckInUTC = DateTime.fromSeconds(Number(await legacy.lastCheckInTime())).setZone("UTC");
            
            expect(lastCheckInUTC).to.be.sameDate(tomorrowUTC);
            expect(await legacy.canWithdraw()).to.be.false;
            expect(await ethers.provider.getBalance(legacy.target)).to.equal(initialAmount);
        });

        it("should check in and receive the funds tomorrow when the owner calls the checkIn function with new funds tomorrow (T + 1)", async function() {
            const { legacy, initialAmount } = await loadFixture(deployLegacyFixture);

            const tomorrowUTC = DateTime.utc().plus({ days: 1 });
            await time.increaseTo(Math.round(tomorrowUTC.toSeconds()));
            const additionalAmount = 2_000_000_000;
            await legacy.checkIn({value: additionalAmount});
            const lastCheckInUTC = DateTime.fromSeconds(Number(await legacy.lastCheckInTime())).setZone("UTC");
            
            expect(lastCheckInUTC).to.be.sameDate(tomorrowUTC);
            expect(await legacy.canWithdraw()).to.be.false;
            expect(await ethers.provider.getBalance(legacy.target)).to.equal(initialAmount + additionalAmount);
        });

        it("should revert when non-owner checks in", async function() {
            const { legacy, beneficiary } = await loadFixture(deployLegacyFixture);

            const lastCheckInTime = await legacy.lastCheckInTime();
            const contractBalance = await ethers.provider.getBalance(legacy.target);

            await expect(legacy.connect(beneficiary).checkIn()).to.be.revertedWith("Owner only");
            expect(await legacy.lastCheckInTime()).to.equal(lastCheckInTime);
            expect(await ethers.provider.getBalance(legacy.target)).to.equal(contractBalance);
        });
    });

    describe("Withdrawal", () => {
        it("should withdraw the balance of the smart contract the day after tomorrow (T + 2) when the owner misses a check-in tomorrow (T + 1)", async function() {
            const { legacy, beneficiary, initialAmount } = await loadFixture(deployLegacyFixture);

            const todayUTC = DateTime.utc();
            const lastCheckInUTC = DateTime.fromSeconds(Number(await legacy.lastCheckInTime())).setZone("UTC");
            const withdrawalUTC = todayUTC.plus({days: 2});
            await time.increaseTo(Math.round(withdrawalUTC.toSeconds()));

            expect(lastCheckInUTC).to.be.sameDate(todayUTC);
            expect(await legacy.connect(beneficiary).canWithdraw()).to.be.true;
            await expect(legacy.connect(beneficiary).withdraw()).to.changeEtherBalance(beneficiary, initialAmount);
            expect(await ethers.provider.getBalance(legacy.target)).to.equal(0);
        });

        it("should revert the withdrawal tomorrow (T + 1) when the owner checks in today (T)", async function() {
            const { legacy, beneficiary, initialAmount } = await loadFixture(deployLegacyFixture);

            const todayUTC = DateTime.utc();
            const lastCheckInUTC = DateTime.fromSeconds(Number(await legacy.lastCheckInTime())).setZone("UTC");
            const withdrawalUTC = todayUTC.plus({days: 1});
            await time.increaseTo(Math.round(withdrawalUTC.toSeconds()));

            expect(lastCheckInUTC).to.be.sameDate(todayUTC);
            expect(await legacy.connect(beneficiary).canWithdraw()).to.be.false;
            await expect(legacy.connect(beneficiary).withdraw()).to.be.revertedWith("Withdrawal not allowed");
            expect(await ethers.provider.getBalance(legacy.target)).to.equal(initialAmount);
        });

        it("should withdraw the balance of the smart contract two days after tomorrow (T + 3) when the owner misses a check-in tomorrow (T + 1) with a one-day withdrawal delay period", async function() {
            const { legacyWithDelay, beneficiary, initialAmount } = await loadFixture(deployLegacyFixture);
            
            const todayUTC = DateTime.utc();
            const lastCheckInUTC = DateTime.fromSeconds(Number(await legacyWithDelay.lastCheckInTime())).setZone("UTC");
            const withdrawalUTC = todayUTC.plus({days: 3});
            await time.increaseTo(Math.round(withdrawalUTC.toSeconds()));

            expect(lastCheckInUTC).to.be.sameDate(todayUTC);
            expect(await legacyWithDelay.connect(beneficiary).canWithdraw()).to.be.true;
            await expect(legacyWithDelay.connect(beneficiary).withdraw()).to.changeEtherBalance(beneficiary, initialAmount);
            expect(await ethers.provider.getBalance(legacyWithDelay.target)).to.equal(0);
        });

        it("should revert the withdrawal the day after tomorrow (T + 2) when the owner misses a check-in tomorrow (T + 1) with a one-day withdrawal delay period", async function() {
            const { legacyWithDelay, beneficiary, initialAmount } = await loadFixture(deployLegacyFixture);
            
            const todayUTC = DateTime.utc();
            const lastCheckInUTC = DateTime.fromSeconds(Number(await legacyWithDelay.lastCheckInTime())).setZone("UTC");
            const withdrawalUTC = todayUTC.plus({days: 2});
            await time.increaseTo(Math.round(withdrawalUTC.toSeconds()));

            expect(lastCheckInUTC).to.be.sameDate(todayUTC);
            expect(await legacyWithDelay.connect(beneficiary).canWithdraw()).to.be.false;
            await expect(legacyWithDelay.connect(beneficiary).withdraw()).to.be.revertedWith("Withdrawal not allowed");
            expect(await ethers.provider.getBalance(legacyWithDelay.target)).to.equal(initialAmount);
        });

        it("should revert the withdrawal two days after tomorrow (T + 3) when the owner misses a check-in tomorrow (T + 1) but re-checks in the day after tomorrow (T + 2) with a one-day withdrawal delay period", async function() {
            const { legacyWithDelay, beneficiary, initialAmount } = await loadFixture(deployLegacyFixture);
            
            const todayUTC = DateTime.utc();
            let lastCheckInUTC = DateTime.fromSeconds(Number(await legacyWithDelay.lastCheckInTime())).setZone("UTC");
            const reCheckInUTC = todayUTC.plus({days: 2});
            const withdrawalUTC = todayUTC.plus({days: 3});

            expect(lastCheckInUTC).to.be.sameDate(todayUTC);

            await time.increaseTo(Math.round(reCheckInUTC.toSeconds()));
            await legacyWithDelay.checkIn();
            lastCheckInUTC = DateTime.fromSeconds(Number(await legacyWithDelay.lastCheckInTime())).setZone("UTC");
            await time.increaseTo(Math.round(withdrawalUTC.toSeconds()));

            expect(lastCheckInUTC).to.be.sameDate(reCheckInUTC);
            expect(await legacyWithDelay.connect(beneficiary).canWithdraw()).to.be.false;
            await expect(legacyWithDelay.connect(beneficiary).withdraw()).to.be.revertedWith("Withdrawal not allowed");
            expect(await ethers.provider.getBalance(legacyWithDelay.target)).to.equal(initialAmount);
        });

        it("should revert when non-beneficiary withdraws", async function() {
            const { legacy, owner, initialAmount } = await loadFixture(deployLegacyFixture);

            await expect(legacy.withdraw()).to.be.revertedWith("Beneficiary only");
            expect(await ethers.provider.getBalance(legacy.target)).to.equal(initialAmount);
        });
    });

    describe("Termination", function() {
        it("should revoke the smart contract when the owner terminate it", async function() {
            const { legacy, owner, beneficiary, initialAmount } = await loadFixture(deployLegacyFixture);

            await expect(legacy.terminate()).to.changeEtherBalance(owner, initialAmount);
            expect(await legacy.isActive()).to.be.false;
            expect(await ethers.provider.getBalance(legacy.target)).to.equal(0);
            await expect(legacy.checkIn()).to.be.revertedWith("Contract already terminated");
            await expect(legacy.terminate()).to.be.revertedWith("Contract already terminated");
            await expect(legacy.connect(beneficiary).canWithdraw()).to.be.revertedWith("Contract already terminated");
            await expect(legacy.connect(beneficiary).withdraw()).to.be.revertedWith("Contract already terminated");
        });

        it("should revert when non-owner terminates it", async function() {
            const { legacy, beneficiary, initialAmount } = await loadFixture(deployLegacyFixture);

            await expect(legacy.connect(beneficiary).terminate()).to.be.revertedWith("Owner only");
            expect(await legacy.isActive()).to.be.true;
            expect(await ethers.provider.getBalance(legacy.target)).to.equal(initialAmount);
        });
    });
});
