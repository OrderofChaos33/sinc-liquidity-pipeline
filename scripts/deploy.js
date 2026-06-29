// Hardhat deployment script for SINC Liquidity Pipeline - Base Mainnet Ready
// Addresses verified as of June 2026 for Base (chainId 8453)
// Run: npx hardhat run scripts/deploy.js --network base

const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    console.log("Network: Base Mainnet (8453)");

    // REAL BASE ADDRESSES (Verified)
    const BASE_USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
    const UNISWAP_V3_SWAP_ROUTER_02 = "0x2626664c2603336E57B271c5C0b26F421741e481";
    const UNISWAP_V3_POSITION_MANAGER = "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1";
    const CHAINLINK_ETH_USD_BASE = "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70";
    const EXISTING_SINC = "0x9C8cd8d3961F445D653713dE65C6578bE11668e7";

    console.log("Using Base addresses:");
    console.log("USDC:", BASE_USDC);
    console.log("Uniswap SwapRouter02:", UNISWAP_V3_SWAP_ROUTER_02);
    console.log("Uniswap PositionManager:", UNISWAP_V3_POSITION_MANAGER);
    console.log("Chainlink ETH/USD:", CHAINLINK_ETH_USD_BASE);

    const SINCToken = await ethers.getContractFactory("SINCToken");
    const sincToken = await SINCToken.deploy(deployer.address);
    await sincToken.deployed();
    console.log("SINCToken deployed to:", sincToken.address);

    const MultiSigConfig = await ethers.getContractFactory("MultiSigConfig");
    const multiSig = await MultiSigConfig.deploy([deployer.address], 2);
    await multiSig.deployed();
    console.log("MultiSigConfig deployed to:", multiSig.address);

    const OracleRouter = await ethers.getContractFactory("OracleRouter");
    const oracleRouter = await OracleRouter.deploy(deployer.address);
    await oracleRouter.deployed();
    console.log("OracleRouter deployed to:", oracleRouter.address);

    const ETH_USD_PAIR = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ETH/USD"));
    await oracleRouter.setFeed(ETH_USD_PAIR, CHAINLINK_ETH_USD_BASE, 86400, 8);

    const EcosystemTreasury = await ethers.getContractFactory("EcosystemTreasury");
    const treasury = await EcosystemTreasury.deploy(sincToken.address, BASE_USDC, UNISWAP_V3_SWAP_ROUTER_02, deployer.address);
    await treasury.deployed();
    console.log("EcosystemTreasury deployed to:", treasury.address);

    await sincToken.setEcosystemTreasury(treasury.address);

    const AMMController = await ethers.getContractFactory("AMMController");
    const ammController = await AMMController.deploy(sincToken.address, oracleRouter.address, treasury.address, UNISWAP_V3_SWAP_ROUTER_02, deployer.address);
    await ammController.deployed();
    console.log("AMMController deployed to:", ammController.address);

    const CONTROLLER_ROLE = await treasury.CONTROLLER_ROLE();
    await treasury.grantRole(CONTROLLER_ROLE, ammController.address);

    console.log("\n=== DEPLOYMENT COMPLETE - BASE MAINNET ===");
    console.log("SINCToken:", sincToken.address);
    console.log("MultiSigConfig:", multiSig.address);
    console.log("OracleRouter:", oracleRouter.address);
    console.log("EcosystemTreasury:", treasury.address);
    console.log("AMMController:", ammController.address);
}