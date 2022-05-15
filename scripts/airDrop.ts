import { ethers } from "hardhat";
import { utils, BigNumber, Wallet, providers } from "ethers";
import ABI from "../static/ccb.json";
import artifacts from "../artifacts/contracts/NanQuotations.sol/NanQuotations.json";

async function main() {
  const provider = new providers.AlchemyProvider(
    undefined,
    process.env.MAINNER_KEY as string
  );
  const wallet = new Wallet(process.env.PRIVATE_KEY as string, provider);
  const contract = await ethers.getContractAt(
    ABI,
    "0x81ca1f6608747285c9c001ba4f5ff6ff2b5f36f8",
    wallet
  ); // robot 合约
  const totoalSupply = (await contract.totalSupply()).toNumber();
  const tokenIds = (
    await Promise.all(
      Array(totoalSupply)
        .fill(null)
        .map((value, index) => index)
        .map((index) => contract.tokenByIndex(index))
    )
  )
    .map((id) => id.toNumber())
    .filter(Boolean); // 0号tonken不空投
  const address = await Promise.all(
    tokenIds.map((id) => contract.ownerOf(BigNumber.from(id)))
  );

  console.log("address length", address.length, address.slice(0, 10));

  const Nft = await ethers.getContractAtFromArtifact(
    artifacts,
    "0x5FbDB2315678afecb367f032d93F642f64180aa3"
  );
  const tx = await Nft.airDropMint(
    address,
    BigNumber.from(2),
    utils.toUtf8Bytes("")
  );
  const receipt = (await tx.wait()).getTransactionReceipt();
  console.log("空投成功", `gas used${receipt.gasUsed}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
