const hre = require("hardhat");

async function main() {

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  //Farm

  const MasterShef = await hre.ethers.getContractFactory("MasterShef");
  const mastershef = await MasterShef.deploy(process.env.NRFX, process.env.LPT);
  await mastershef.deployed();
  console.log("MasterShef contract:", mastershef.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });