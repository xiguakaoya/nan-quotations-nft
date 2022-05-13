// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
import { ethers } from "hardhat";
import artifacts from "../artifacts/contracts/NanQuotations.sol/NanQuotations.json";
import { utils, BigNumber } from "ethers";

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  const Nft = await ethers.getContractAtFromArtifact(
    artifacts,
    "0x33a8f550e42Ed0F3039E52ff8B9c2A115900Df68"
  );
  const tx = await Nft.airDropMint(
    ["0x73EdBD7277C7222bC432c09F29E47E3F3516C7D2"].map(utils.getAddress),
    BigNumber.from(1),
    utils.toUtf8Bytes("")
  );
  const receipt = await tx;

  console.log("receipt", receipt);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
