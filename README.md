# commit-swap

Buy commit-coin through a clean, non-custodial Solana swap interface.

## Official Swap Link

**https://solanagitdev.github.io/commit-swap/**

Buy commit-coin through commit-swap and earn daily fee redistribution.

## What is commit-swap?

`commit-swap` is a GitHub-native Solana swap page deployed on GitHub Pages.  
It is designed to let users swap into commit-coin directly from a static, transparent frontend.

## What is commit-coin?

`commit-coin` is the fixed output token on this interface.  
Swaps on commit-swap are routed so the destination asset is always commit-coin.

Token address:
`AV6oUgDdgPMW1UKwPM8RtRwmaNE93XJFmmkAt8uwpump`

Solscan:
https://solscan.io/token/AV6oUgDdgPMW1UKwPM8RtRwmaNE93XJFmmkAt8uwpump

## 90% Daily Redistribution Messaging

commit-swap communicates a model where **90% of swap fees generated through this page are redistributed daily**.

Transparency note:
- This repository contains frontend messaging only.
- No backend redistribution automation or payout logic is included in this repo.

## Fee Wallet

Platform fee wallet:
`3Yrjc2faTdEvgxxtnnNCixKScufZZcTCaqrxP9dNra4J`

Solscan:
https://solscan.io/account/3Yrjc2faTdEvgxxtnnNCixKScufZZcTCaqrxP9dNra4J

## Key Features

- GitHub-native static site (HTML + vanilla JS)
- Jupiter-powered swap routing
- Input tokens: `SOL` and `USDC`
- Fixed output mint: commit-coin
- Configurable slippage
- Optional platform fee parameters (`feeBps`, `feeAccount`)
- Fully non-custodial wallet flow
- Responsive dark UI

## Disclaimer

- This software is provided as-is, without warranties.
- All swaps are executed on-chain and are irreversible.
- Always verify token mints and transaction details before signing.
- Nothing in this repository is financial, legal, or tax advice.

## License

MIT. See `LICENSE`.
