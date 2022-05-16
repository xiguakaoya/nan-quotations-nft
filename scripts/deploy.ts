// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import { utils, BigNumber, Contract, Signer } from "ethers";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const [owner, account2] = await ethers.getSigners();
  const Nft = await ethers.getContractFactory("NanQuotations");
  const nft = await Nft.deploy(
    "https://gateway.pinata.cloud/ipfs/QmNPAmwWrsureXRCGQ2zwgG9qdgc9mGXxfmyhuuCF39dNB"
  );
  await nft.deployed();

  console.log("Greeter deployed to:", nft.address);
  const tx = await nft.airDropMint(
    [owner.address, account2.address],
    2,
    utils.toUtf8Bytes("")
  );
  await tx.wait();
  console.log("空投完成");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
