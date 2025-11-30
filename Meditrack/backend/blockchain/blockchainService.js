require("dotenv").config({ path: "../.env" }); // Load env vars from parent folder
const { ethers } = require("ethers");
const artifact = require("./MediTrackAMU-ABI.json");
const { MediTrackAMU: contractAddress } = require("./contractAddress.json");

const ABI = artifact.abi;

let wallet;
let contract;

async function initBlockchain() {
  try {
    console.log("⛓ Initializing Blockchain...");

    // 1. Get the RPC URL (Sepolia or Local)
    const rpcUrl = process.env.RPC_URL || process.env.SEPOLIA_RPC_URL;
    if (!rpcUrl) {
      throw new Error("RPC_URL is missing in .env file");
    }

    // 2. Setup Provider (Handles both Ethers V5 and V6)
    let provider;
    if (ethers.JsonRpcProvider) {
      // Ethers V6 syntax
      provider = new ethers.JsonRpcProvider(rpcUrl);
    } else {
      // Ethers V5 syntax
      provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    }

    // 3. Setup Wallet (Uses your REAL Private Key)
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("PRIVATE_KEY is missing in .env file");
    }
    wallet = new ethers.Wallet(privateKey, provider);

    // 4. Connect to Contract
    contract = new ethers.Contract(contractAddress, ABI, wallet);

    console.log(`✅ Blockchain Connected! (Contract: ${contractAddress})`);
  } catch (err) {
    console.error("❌ Blockchain Init Error:", err.message);
  }
}

// WRITE FUNCTION
async function addEvent(actionType, animalId, recordHash) {
  try {
    if (!contract) await initBlockchain();

    console.log(`📝 Writing to Blockchain: ${actionType} for ${animalId}`);

    // Create Hash (Handles both V5 and V6)
    let hashBytes32;
    if (ethers.id) {
        hashBytes32 = ethers.id(recordHash); // V6
    } else {
        hashBytes32 = ethers.utils.id(recordHash); // V5
    }

    // Send Transaction
    const tx = await contract.addEvent(actionType, animalId, hashBytes32);
    console.log("🔗 TX Sent:", tx.hash);

    // Wait for confirmation
    const receipt = await tx.wait();
    console.log("✨ TX Confirmed in Block:", receipt.blockNumber);
    
    return receipt.hash;
  } catch (err) {
    console.error("❌ addEvent Error:", err.message || err);
    return null;
  }
}

module.exports = { initBlockchain, addEvent };