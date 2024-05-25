const {
    loadFixture,
  } = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { expect } = require("chai");

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

            expect(await legacy.owner()).to.equal(owner.address);
            expect(await legacy.beneficiary()).to.equal(beneficiary.address);
            expect(await legacy.canWithdraw()).to.be.false;
            expect(await ethers.provider.getBalance(legacy.target)).to.equal(initialAmount);
        });
    });

});
