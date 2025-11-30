require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // This loads your .env file

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL, // Reads from .env
      accounts: [process.env.PRIVATE_KEY], // Reads from .env
    },
  },
};