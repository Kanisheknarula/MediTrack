const { ethers } = require("ethers");

// LOAD FULL HARDHAT ARTIFACT
const artifact = require("./MediTrackAMU-ABI.json");

// USE artifact.abi ONLY
const ABI = artifact.abi;

// LOAD ADDRESS
const { MediTrackAMU: contractAddress } = require("./contractAddress.json");
let provider;
let wallet;
let contract;

async function initBlockchain() {
  try {
    // 1) Connect to local Hardhat node
    provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");

    // 2) Use Hardhat Account #0 PRIVATE KEY (not address!)
    const privateKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80".trim();

    wallet = new ethers.Wallet(privateKey, provider);

    // 3) Connect contract with signer
    contract = new ethers.Contract(contractAddress, ABI, wallet);

    console.log("✅ Blockchain Connected Successfully!");
  } catch (err) {
    console.error("❌ Error initializing blockchain:", err);
  }
}

async function addEvent(actionType, animalId, recordHash) {
  // 1. Convert the string to bytes32 (keccak256 of utf8 string)
  //    This matches the Solidity `bytes32 recordHash` type
  const hashBytes32 = ethers.id(recordHash);           // same as keccak256(toUtf8Bytes(recordHash))

  // 2. Call the contract with bytes32 value
  const tx = await contract.addEvent(actionType, animalId, hashBytes32);

  // 3. Wait for transaction to be mined
  const receipt = await tx.wait();

  // 4. Return transaction hash
  return receipt.hash;
}

module.exports = { initBlockchain, addEvent };
