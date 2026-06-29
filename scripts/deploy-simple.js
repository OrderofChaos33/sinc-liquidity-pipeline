import hardhat from "hardhat";
const { ethers } = hardhat;

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const YOUR_ADMIN = "0x09E2891432827D8835d2E9b83B25e2a5ba9612Ac";

  const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
  const UNISWAP_V3_SWAP_ROUTER_02 = "0x2626664c2603336E57B271c5C0b26F421741e481";
  const CHAINLINK_ETH_USD_BASE = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";

  const SINCToken = await ethers.getContractFactory("SINCToken");
  const sinc = await SINCToken.deploy(YOUR_ADMIN);
  await sinc.deployed();
  console.log("SINCToken:", sinc.address);

  const OracleRouter = await ethers.getContractFactory("OracleRouter");
  const oracle = await OracleRouter.deploy(YOUR_ADMIN);
  await oracle.deployed();
  console.log("OracleRouter:", oracle.address);

  const ETH_USD = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ETH/USD"));
  await oracle.setFeed(ETH_USD, CHAINLINK_ETH_USD_BASE, 86400, 8);

  const Treasury = await ethers.getContractFactory("EcosystemTreasury");
  const treasury = await Treasury.deploy(sinc.address, BASE_USDC, UNISWAP_V3_SWAP_ROUTER_02, YOUR_ADMIN);
  await treasury.deployed();
  console.log("EcosystemTreasury:", treasury.address);

  await sinc.setEcosystemTreasury(treasury.address);

  const AMM = await ethers.getContractFactory("AMMController");
  const amm = await AMM.deploy(sinc.address, oracle.address, treasury.address, UNISWAP_V3_SWAP_ROUTER_02, YOUR_ADMIN);
  await amm.deployed();
  console.log("AMMController:", amm.address);

  await treasury.grantRole(await treasury.CONTROLLER_ROLE(), amm.address);

  console.log("\n=== DEPLOYED SUCCESSFULLY ===");
  console.log("Copy these addresses and use them in your SINCOR integration");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});