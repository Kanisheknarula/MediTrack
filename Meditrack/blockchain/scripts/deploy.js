const hre = require("hardhat");

async function main() {
  const MediTrackAMU = await hre.ethers.deployContract("MediTrackAMU");
  await MediTrackAMU.waitForDeployment();

  console.log("MediTrackAMU Contract deployed to:", MediTrackAMU.target);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
