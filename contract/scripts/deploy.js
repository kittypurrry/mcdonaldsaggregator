const hre = require("hardhat");

async function main() {
  const worldIdAddress = "0x469449f251692e0779667583026b5a1e99512157"; // Sepolia testnet address
  const appId = "app_staging_e9c07649b1a24f46afc4a496a86653ee"; // Replace with your app ID

  const WorldIdVerifier = await hre.ethers.getContractFactory("WorldIdVerifier");
  const verifier = await WorldIdVerifier.deploy(worldIdAddress, appId);

  // You do not need to call `deployed()` after `deploy`
  console.log("WorldIdVerifier deployed to:", await verifier.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
