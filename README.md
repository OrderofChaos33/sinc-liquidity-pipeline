# SINC Liquidity Pipeline - SIMPLE DEPLOY (Fixed for your error)

I fixed the ESM error for you. Just run these exact commands in order.

## 1. Make sure you're in the right folder
You are already in: `~/OneDrive/Desktop/RAIN/0-$/SINCOR2/sinc-liquidity-pipeline/sinc-liquidity-pipeline`

## 2. Run these commands one by one

```bash
npm pkg set type="module"

npm install

npx hardhat run scripts/deploy-simple.js --network base
```

That's it. It should now deploy using your wallet `0x09E2891432827D8835d2E9b83B25e2a5ba9612Ac` as admin.

If it still complains, delete `node_modules` and `package-lock.json` then run `npm install` again.

After it finishes, it will print the new contract addresses. Paste them here and I'll give you the next exact steps (verify on Basescan, add liquidity, wire to your agents, etc.).

I handled the code fixes. You just run the 3 lines above.