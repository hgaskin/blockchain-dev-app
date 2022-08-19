const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

describe("Token Contract Test", () => {
  let token,
    accounts,
    deployer,
    receiver,
    exchange,
    deployerAddress,
    receiverAddress,
    exchangeAddress;

  beforeEach(async () => {
    const Token = await ethers.getContractFactory("Token");
    token = await Token.deploy("Dapp University", "DAPP", 500);

    accounts = await ethers.getSigners();
    deployer = accounts[0];
    receiver = accounts[1];
    exchange = accounts[2];
    deployerAddress = deployer.address;
    receiverAddress = receiver.address;
    exchangeAddress = exchange.address;
  });

  describe("Deployment", () => {
    const name = "Dapp University";
    const symbol = "DAPP";
    const decimals = 18;
    const totalSupply = tokens("500");

    it("Has correct name", async () => {
      expect(await token.name()).to.equal(name);
    });

    it("Has correct symbol", async () => {
      expect(await token.symbol()).to.equal(symbol);
    });

    it("Has correct decimals", async () => {
      expect(await token.decimals()).to.equal(decimals);
    });

    it("Has correct total supply", async () => {
      expect(await token.totalSupply()).to.equal(totalSupply);
    });

    it("Assigns total supply to deployer", async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(totalSupply);
    });
  });

  describe("Sending Tokens", () => {
    let amount, transaction, result;

    describe("Success", () => {
      beforeEach(async () => {
        amount = tokens("100");
        transaction = await token
          .connect(deployer)
          .transfer(receiverAddress, amount);
        result = await transaction.wait();
      });

      it("Transfers Token balances", async () => {
        // Log balance before transfer
        expect(await token.balanceOf(deployerAddress)).to.equal(tokens("400"));
        expect(await token.balanceOf(receiverAddress)).to.equal(amount);
      });

      it("Emits a transfer event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("Transfer");

        const args = event.args;
        expect(args.from).to.equal(deployerAddress);
        expect(args.to).to.equal(receiverAddress);
        expect(args.value).to.equal(amount);
      });
    });

    describe("Failure", () => {
      it("rejects insufficient balances", async () => {
        const invalidAmount = tokens("1000000");
        await expect(
          token.connect(deployer).transfer(receiverAddress, invalidAmount)
        ).to.be.reverted;
      });

      it("rejects invalid recipient", async () => {
        const recipient = "0x0000000000000000000000000000000000000000";
        const amount = tokens("100");
        await expect(token.connect(deployer).transfer(recipient, amount)).to.be
          .reverted;
      });
    });
  });

  describe("Approving Tokens", () => {
    let amount, transaction, result;

    beforeEach(async () => {
      amount = tokens("100");
      transaction = await token
        .connect(deployer)
        .approve(exchangeAddress, amount);
      result = await transaction.wait();
    });

    describe("Success", () => {
      it("allows spender to withdraw tokens", async () => {
        expect(
          await token.allowance(deployerAddress, exchangeAddress)
        ).to.equal(amount);
      });

      it("emits an Approval event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("Approval");

        const args = event.args;
        expect(args.owner).to.equal(deployerAddress);
        expect(args.spender).to.equal(exchangeAddress);
        expect(args.value).to.equal(amount);
      });
    });
    describe("Failure", () => {
      it("rejects invalid spenders", async () => {
        const spender = "0x0000000000000000000000000000000000000000";
        await expect(token.connect(deployer).approve(spender, amount)).to.be
          .reverted;
      });
    });
  });

  describe("Delegated Token Transfers", () => {
    let amount, transaction, result;

    beforeEach(async () => {
      amount = tokens("100");
      transaction = await token
        .connect(deployer)
        .approve(exchangeAddress, amount);
      result = await transaction.wait();
    });

    describe("Success", () => {
      beforeEach(async () => {
        transaction = await token
          .connect(exchange)
          .transferFrom(deployerAddress, receiverAddress, amount);
        result = await transaction.wait();
      });

      it("transfers token balances", async () => {
        // Log balance before transfer
        expect(await token.balanceOf(deployerAddress)).to.equal(tokens("400"));
        expect(await token.balanceOf(receiverAddress)).to.equal(amount);
      });

      it("resets the allowance to prevent reentrancy attacks", async () => {
        expect(
          await token.allowance(deployerAddress, exchangeAddress)
        ).to.equal(tokens("0"));
      });

      it("emits transfer event", async () => {
        const event = result.events[0];
        expect(event.event).to.equal("Transfer");

        const args = event.args;
        expect(args.from).to.equal(deployerAddress);
        expect(args.to).to.equal(receiverAddress);
        expect(args.value).to.equal(amount);
      });
    });

    describe("Failure", () => {
      const invalidAmount = tokens("1000000");
      it("reverts the attempt to transfer value that exceeds approval", async () => {
        await expect(
          token
            .connect(exchange)
            .transferFrom(deployerAddress, receiverAddress, invalidAmount)
        ).to.be.reverted;
      });
    });
  });
});
