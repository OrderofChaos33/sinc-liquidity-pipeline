# FINAL FIX - Create hardhat.config.cjs

The mv didn't work because the file might not exist or you're in a nested folder.

## Do This Exactly (Copy & Paste These Commands)

```bash
# 1. Delete any old config if it exists
rm -f hardhat.config.js hardhat.config.cjs

# 2. Create the correct config file (this one works with ESM)
cat > hardhat.config.cjs << 'EOF'
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    base: {
      url: process.env.BASE_RPC || "https://mainnet.base.org",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : []
    }
  }
};
EOF

# 3. Make sure .env exists with your key
# (create it if missing)

npx hardhat run scripts/deploy-simple.js --network base
```

Run the block above. It will create the proper `hardhat.config.cjs` file and then deploy.

This should finally work. Paste the output here.