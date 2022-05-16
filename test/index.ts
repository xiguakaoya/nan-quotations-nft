import { expect } from "chai";
import { ethers } from "hardhat";
import { utils, BigNumber, Contract, Signer } from "ethers";

describe("NanQuotations", function () {
  let Nft;
  let nft: Contract;
  let owner: any;
  let account2: any;
  const COINT_TYPE = 0;
  const ORIGIN_URI =
    "https://gateway.pinata.cloud/ipfs/QmNPAmwWrsureXRCGQ2zwgG9qdgc9mGXxfmyhuuCF39dNB";

  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    Nft = await ethers.getContractFactory("NanQuotations");
    nft = await Nft.deploy(ORIGIN_URI);
    await nft.deployed();
    [owner, account2] = await ethers.getSigners();
  });

  describe("airDrop gas", () => {
    it("get gas", async () => {
      const addresses = Array(500)
        .fill(null)
        .map((item) => owner.address);
      const tx = await nft.airDropMint(addresses, 2, utils.toUtf8Bytes(""));
      const receipt = await tx.wait();
      console.log(`空投花费gas: ${receipt.gasUsed.toNumber()}`);
    });
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });

    it("Should set the right maxSupply", async function () {
      expect(await nft.maxSupply()).to.equal(1000);
    });

    it("Should set the right URI", async function () {
      expect(await nft.uri(BigNumber.from(COINT_TYPE))).to.equal(ORIGIN_URI);
    });
  });

  describe("Reset URI", function () {
    it("Should return the right url once it's changed", async () => {
      const NEW_URI =
        "https://gateway.pinata.cloud/ipfs/QmVXERvUK1btirMRGd2JS9dAr1yddxQTnY9FmXuPZSqk8P";
      const tx = await nft.setURI(NEW_URI);

      // wait until the transaction is mined
      await tx.wait();

      expect(await nft.uri(BigNumber.from(COINT_TYPE))).to.equal(NEW_URI);
    });
  });

  describe("Reset maxSupply", function () {
    it("Should return the right maxSupply once it's changed", async () => {
      const NEW_SUPPLY = 100;
      const tx = await nft.setMaxSupply(NEW_SUPPLY);

      // wait until the transaction is mined
      await tx.wait();

      expect(await nft.maxSupply()).to.equal(NEW_SUPPLY);
    });
  });

  describe("pause&unpause all token transfers", function () {
    it("pause token transfers", async () => {
      const tx = await nft.airDropMint(
        [owner.address],
        2,
        utils.toUtf8Bytes("")
      );
      await tx.wait();
      await await nft.pause();
      await expect(
        nft.safeTransferFrom(
          owner.address,
          account2.address,
          BigNumber.from(COINT_TYPE),
          BigNumber.from(1),
          utils.toUtf8Bytes("")
        )
      ).to.be.reverted;

      const balance = await nft
        .connect(account2)
        .balanceOf(account2.address, BigNumber.from(COINT_TYPE));
      expect(balance).to.equal(0);
    });

    it("unpause token transfers", async () => {
      // 每一个测试用例都对应着不同的合约实例
      const tx = await nft.airDropMint(
        [owner.address],
        2,
        utils.toUtf8Bytes("")
      );
      await tx.wait();
      const transeTx = await nft.safeTransferFrom(
        owner.address,
        account2.address,
        BigNumber.from(COINT_TYPE),
        BigNumber.from(1),
        utils.toUtf8Bytes("")
      );

      await transeTx.wait();
      const balabnce = await nft
        .connect(account2)
        .balanceOf(account2.address, BigNumber.from(COINT_TYPE));
      expect(balabnce).to.equal(1);
    });
  });

  describe("air drop mint", () => {
    it("should have token after minted", async () => {
      const tx = await nft.airDropMint(
        [owner.address, account2.address],
        2,
        utils.toUtf8Bytes("")
      );
      await tx.wait();

      expect(
        await nft.balanceOf(account2.address, BigNumber.from(COINT_TYPE))
      ).to.equal(2);

      expect(
        await nft.balanceOf(owner.address, BigNumber.from(COINT_TYPE))
      ).to.equal(2);
    });

    it("should not mint token over 1000", async () => {
      await expect(
        nft.airDropMint(
          [owner.address, account2.address],
          502,
          utils.toUtf8Bytes("")
        )
      ).to.be.reverted;
    });

    it("only owner can mint token", async () => {
      await expect(
        nft
          .connect(account2)
          .airDropMint(
            [owner.address, account2.address],
            10,
            utils.toUtf8Bytes("")
          )
      );
      await expect(
        nft.connect(account2).mint(owner.address, 10, utils.toUtf8Bytes(""))
      );
    });
  });
});
