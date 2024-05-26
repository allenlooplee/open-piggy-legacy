const {
    loadFixture,
    time,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const chai = require('chai');
chai.use(require('chai-luxon'));
const { expect } = chai;
const { DateTime } = require('luxon');

describe("PiggyLegacy", function() {
    async function deployLegacyFixture() {
        const [owner, beneficiary] = await ethers.getSigners();
        const initialAmount = 10_000_000_000;

        const Legacy = await ethers.getContractFactory("PiggyLegacy");
        const legacy = await Legacy.deploy(beneficiary, 0, { value: initialAmount });

        return { legacy, initialAmount, owner, beneficiary };
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
});
