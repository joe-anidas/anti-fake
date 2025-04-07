const { ethers } = require('hardhat');

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('Deploying contracts with the account:', deployer.address);

  // Get the contract factory
  const CertificateRegistry = await ethers.getContractFactory('CertificateNFT');

  // Set gas price and gas limit
  const gasPrice = ethers.parseUnits('10', 'gwei'); // Adjust as needed

  
  const gasLimit = 5000000; // Adjust based on contract complexity

  // Deploy the contract without constructor arguments
  const certificateRegistry = await CertificateRegistry.deploy({ gasPrice, gasLimit });
  await certificateRegistry.waitForDeployment();

  // Retrieve the contract address
  const contractAddress = await certificateRegistry.getAddress();
  console.log('CertificateRegistry deployed to:', contractAddress);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
