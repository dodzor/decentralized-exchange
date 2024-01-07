const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether');
}

async function main() {
  console.log("Deploying contracts...");

  const Token = await hre.ethers.getContractFactory("Token");
  const Exchange = await hre.ethers.getContractFactory("Exchange");

  const accounts = await hre.ethers.getSigners();
  console.log(`Accounts fetched:\n${accounts[0].address}, \n${accounts[1].address}`);

  const dext = await Token.deploy('Decentralized Exchange Token', 'DEXT', tokens(1000000));
  await dext.deployed();
  console.log("DEXT deployed to: ", dext.address);

  const pir = await Token.deploy('Pirate Dolars', 'PIR', tokens(1000000));
  await pir.deployed();
  console.log("PIR deployed to: ", pir.address);

  const mETH = await Token.deploy('Mock Ethereum', 'mETH', tokens(1000000));
  await mETH.deployed();
  console.log("mETH deployed to: ", mETH.address);

  const exchange = await Exchange.deploy(accounts[1].address, 10);
  await exchange.deployed();
  console.log("Exchange deployed to: ", exchange.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
