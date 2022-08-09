async function main() {
  // Fetch Contract to Deploy
  const Token = await ethers.getContractFactory("Token");

  // Deploy Contract
  const token = await Token.deploy();
  await token.deployed();
  console.log(`Token deployed to: ${token.address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
