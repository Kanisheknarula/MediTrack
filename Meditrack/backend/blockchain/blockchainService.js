const { ethers } = require("ethers");
const artifact = require("./MediTrackAMU-ABI.json");
const { MediTrackAMU: contractAddress } = require("./contractAddress.json");

const ABI = artifact.abi;

let provider;
let wallet;
let contract;

async function initBlockchain() {
  try {
    console.log("⛓ Initializing Blockchain (ethers v6)...");

    // Hardhat local node
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL || "http://127.0.0.1:8545");

    // Hardhat default private key #0
    const privateKey =
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

    wallet = new ethers.Wallet(privateKey, provider);

    contract = new ethers.Contract(contractAddress, ABI, wallet);

    console.log("✅ Blockchain Connected Successfully!");
  } catch (err) {
    console.error("❌ Blockchain Init Error:", err.message);
  }
}

// WRITE FUNCTION
async function addEvent(actionType, animalId, recordHash) {
  try {
    const hashBytes32 = ethers.id(recordHash); // keccak256

    const tx = await contract.addEvent(actionType, animalId, hashBytes32);

    console.log("🔗 TX Sent:", tx.hash);

    const receipt = await tx.wait();

    console.log("✨ TX Confirmed");
    return receipt.hash;
  } catch (err) {
    console.error("❌ addEvent Error:", err.message);
    return null;
  }
}

module.exports = { initBlockchain, addEvent };
