require('@nomicfoundation/hardhat-toolbox');
require('@openzeppelin/hardhat-upgrades');
require('dotenv').config();
 
// Rest of your configuration...
// Load environment variables
const PRIVATE_KEY = process.env.PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000';
 
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.28',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Sei testnet configuration
    luksoTestnet: {
      url: "https://rpc.testnet.lukso.network",
      chainId: 4201,
      accounts: [`0x${PRIVATE_KEY}`] // Your private key here
    },
    filecoinCalibration: {
      url: 'https://api.calibration.node.glif.io/rpc/v1',
      accounts: [PRIVATE_KEY],
      chainId: 314159, // Filecoin Calibration Testnet Chain ID
      gasPrice: "auto"
    },
    seitestnet: {
      url: 'https://evm-rpc-testnet.sei-apis.com',
      accounts: [PRIVATE_KEY],
      chainId: 1328, // Sei testnet chain ID
      gasPrice: 2000000000 // 2 gwei = 2 nsei
    },
    seidevnet: {
      url: 'https://evm-rpc-arctic-1.sei-apis.com', // Replace with actual Sei devnet RPC
      accounts: [PRIVATE_KEY],
      chainId: 713715, // Example devnet chain ID (Check actual chain ID)
      gasPrice: 2000000000 // Adjust if needed
    },    
    // Sei mainnet configuration
    seimainnet: {
      url: 'https://evm-rpc.sei-apis.com',
      accounts: [PRIVATE_KEY],
      chainId: 1329, // Sei mainnet chain ID
      gasPrice: 5000000// 5 gwei (5 nsei)// 2 gwei = 2 nsei
    },
    // Local development with Hardhat Network
    hardhat: {
      chainId: 31337
    }
  },
  paths: {
    sources: './contracts',
    tests: './test',
    cache: './cache',
    artifacts: './artifacts'
  },
  mocha: {
    timeout: 40000
  }
};