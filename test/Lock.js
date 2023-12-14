const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { ethers } = require("hardhat");
const { expect } = require("chai");

describe("Lock", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployOneYearLockFixture() {
    const ONE_GWEI = ethers.parseEther("1");

    // Contracts are deployed using the first signer/account by default
    const [depositor, beneficiary, arbiter] = await ethers.getSigners();
    console.log(depositor, beneficiary, arbiter, ONE_GWEI);

    const Escrow = await ethers.getContractFactory("Escrow");
    const escrow = await Escrow.deploy(
      arbiter.getAddress(),
      beneficiary.getAddress(),
      {
        value: ONE_GWEI,
      }
    );
    console.log(escrow);

    return { escrow, ONE_GWEI, depositor, beneficiary, arbiter };
  }

  describe("Get the Address", function () {
    it("Should get the address", async function () {
      const { escrow, ONE_GWEI } = await loadFixture(deployOneYearLockFixture);

      expect(await escrow.getAddress()).to.equal(
        "0x5FbDB2315678afecb367f032d93F642f64180aa3"
      );
    });
  });
  describe("Get the balance", function () {
    it("Should get the balance", async function () {
      const { escrow, ONE_GWEI } = await loadFixture(deployOneYearLockFixture);

      const balance = await ethers.provider.getBalance(escrow.getAddress());

      expect(balance).to.equal(ONE_GWEI);
    });
  });
  describe("it should revert if the approver is not the arbiter", function () {
    it("it should revert if the approver is not the arbiter", async function () {
      const { escrow, ONE_GWEI, depositor, beneficiary, arbiter } =
        await loadFixture(deployOneYearLockFixture);

      await expect(escrow.connect(depositor).approve()).to.be.revertedWith(
        "not arbiter"
      );
    });
  });
  describe("it should approve the escrow", function () {
    it("it should approve the escrow", async function () {
      const { escrow, ONE_GWEI, depositor, beneficiary, arbiter } =
        await loadFixture(deployOneYearLockFixture);

      await escrow.connect(arbiter).approve();
      const balance = await ethers.provider.getBalance(escrow.getAddress());

      expect(balance).to.equal(0);
    });
  });
});
