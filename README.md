# commit-swap

`commit-swap` is a GitHub-native Solana swap page for buying **commit-coin** directly from a static site (GitHub Pages compatible).

Prominent message:

> Buy commit-coin through commit-swap and earn daily fee redistribution.

## What is commit-coin?

`commit-coin` is the target token minted on Solana that this page swaps into. The output mint is fixed in app config so users always receive commit-coin.

## 90% Redistribution Model

This project communicates a fee-sharing model where **90% of swap fees generated through this page are redistributed daily**.

- This repository contains messaging/UI only for redistribution.
- No backend redistribution logic is included in this static project.

## Features

- Static HTML + vanilla JS (no React, no backend)
- Jupiter Swap API integration (`quote` + `swap`)
- Input tokens limited to `SOL` and `USDC`
- Fixed output token: `commit-coin` mint
- Configurable slippage
- Optional platform fee support:
  - `feeBps` (default `30` = 0.30%)
  - `feeAccount` (placeholder to set before production)
- Dark GitHub-like responsive UI
- Non-custodial wallet flow

## Configuration

Edit `js/app.js`:

- Set `CONFIG.outputMint` to your live commit-coin mint address.
- Set `CONFIG.feeAccount` to your valid Solana fee account if `feeBps > 0`.
- Optionally set `CONFIG.feeBps = 0` to disable platform fees.
- Optionally change `CONFIG.rpcUrl` if you want a different Solana RPC endpoint.

## Local Preview

Any static server works:

```bash
cd commit-swap
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploy to GitHub Pages

1. Push this project to a GitHub repository named `commit-swap` (or any repo name).
2. In GitHub, go to **Settings -> Pages**.
3. Under **Build and deployment**, choose:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/ (root)`
4. Save and wait for Pages deployment.
5. Visit your Pages URL and verify wallet connection + quote/swap flow.

## Disclaimer

- This software is provided as-is, without warranty.
- Swaps are irreversible and involve market and smart contract risk.
- Always verify mint addresses and transaction details before signing.
- Not financial, tax, or legal advice.

## License

MIT (see `LICENSE`).
