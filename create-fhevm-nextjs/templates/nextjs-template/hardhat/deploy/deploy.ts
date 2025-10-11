// @ts-ignore
import { ethers } from "hardhat";

async function main() {
  console.log("Deploying FHECounter contract...");
  
  // Get the contract factory
  const FHECounter = await ethers.getContractFactory("FHECounter");
  
  // Deploy the contract
  const fheCounter = await FHECounter.deploy();
  
  // Wait for deployment
  await fheCounter.waitForDeployment();
  
  // Get the contract address
  const address = await fheCounter.getAddress();
  console.log(`FHECounter contract deployed to: ${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});