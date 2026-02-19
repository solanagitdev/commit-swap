(() => {
  const CONFIG = {
    outputMint: "REPLACE_WITH_COMMIT_COIN_MINT",
    feeBps: 30,
    feeAccount: "REPLACE_WITH_FEE_ACCOUNT",
    rpcUrl: "https://api.mainnet-beta.solana.com",
    quoteApi: "https://lite-api.jup.ag/swap/v1/quote",
    swapApi: "https://lite-api.jup.ag/swap/v1/swap"
  };

  const TOKENS = {
    So11111111111111111111111111111111111111112: { symbol: "SOL", decimals: 9 },
    EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v: { symbol: "USDC", decimals: 6 }
  };

  const els = {
    inputMint: document.getElementById("inputMint"),
    amount: document.getElementById("amount"),
    slippage: document.getElementById("slippage"),
    outputMint: document.getElementById("outputMint"),
    connectBtn: document.getElementById("connectBtn"),
    quoteBtn: document.getElementById("quoteBtn"),
    swapBtn: document.getElementById("swapBtn"),
    status: document.getElementById("status"),
    feeReadout: document.getElementById("feeReadout"),
    feeAccount: document.getElementById("feeAccount")
  };

  let wallet = null;
  let lastQuote = null;

  function setStatus(message, type = "info") {
    els.status.textContent = message;
    els.status.className = `status ${type}`;
  }

  function formatBpsToPercent(bps) {
    return (bps / 100).toFixed(2);
  }

  function toAtomicAmount(amount, decimals) {
    const scaled = Number(amount) * 10 ** decimals;
    return Math.floor(scaled);
  }

  function detectWallet() {
    const providers = [
      window.phantom?.solana,
      window.backpack,
      window.solflare,
      window.solana
    ].filter(Boolean);

    return providers[0] || null;
  }

  async function connectWallet() {
    wallet = detectWallet();

    if (!wallet) {
      throw new Error("No Solana wallet found. Install Phantom, Solflare, or Backpack.");
    }

    const resp = await wallet.connect();
    const pubkey = resp?.publicKey?.toBase58?.() || wallet.publicKey?.toBase58?.();

    if (!pubkey) {
      throw new Error("Wallet connected, but no public key was returned.");
    }

    els.connectBtn.textContent = `${pubkey.slice(0, 4)}...${pubkey.slice(-4)}`;
    setStatus("Wallet connected.", "success");
    return pubkey;
  }

  function validateConfig() {
    if (CONFIG.outputMint.includes("REPLACE_WITH")) {
      throw new Error("Set CONFIG.outputMint to the live commit-coin mint in js/app.js.");
    }

    if (CONFIG.feeBps > 0 && CONFIG.feeAccount.includes("REPLACE_WITH")) {
      throw new Error("Set CONFIG.feeAccount or set feeBps to 0.");
    }
  }

  function validateInputs() {
    const inputMint = els.inputMint.value;
    const tokenMeta = TOKENS[inputMint];

    if (!tokenMeta) {
      throw new Error("Unsupported input token.");
    }

    const amount = Number(els.amount.value);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Enter a valid amount greater than 0.");
    }

    const slippagePct = Number(els.slippage.value);

    if (!Number.isFinite(slippagePct) || slippagePct <= 0) {
      throw new Error("Enter a valid slippage value.");
    }

    const atomicAmount = toAtomicAmount(amount, tokenMeta.decimals);

    if (!Number.isFinite(atomicAmount) || atomicAmount <= 0) {
      throw new Error("Amount is too small after token decimals conversion.");
    }

    return {
      inputMint,
      atomicAmount,
      slippageBps: Math.round(slippagePct * 100),
      decimals: tokenMeta.decimals,
      symbol: tokenMeta.symbol
    };
  }

  async function fetchQuote() {
    validateConfig();
    const params = validateInputs();

    const query = new URLSearchParams({
      inputMint: params.inputMint,
      outputMint: CONFIG.outputMint,
      amount: String(params.atomicAmount),
      slippageBps: String(params.slippageBps)
    });

    if (CONFIG.feeBps > 0) {
      query.set("platformFeeBps", String(CONFIG.feeBps));
    }

    const res = await fetch(`${CONFIG.quoteApi}?${query.toString()}`);
    if (!res.ok) {
      throw new Error(`Quote request failed (${res.status}).`);
    }

    const quote = await res.json();

    if (!quote?.outAmount) {
      throw new Error("No route found. Try a different amount or token.");
    }

    lastQuote = quote;

    const outUi = Number(quote.outAmount) / 1e6;
    setStatus(
      `Quote: ~${outUi.toFixed(6)} commit-coin. Price impact: ${quote.priceImpactPct || "0"}%`,
      "success"
    );

    return quote;
  }

  async function executeSwap() {
    validateConfig();

    if (!wallet?.publicKey) {
      await connectWallet();
    }

    const quote = lastQuote || (await fetchQuote());

    const body = {
      quoteResponse: quote,
      userPublicKey: wallet.publicKey.toString(),
      wrapAndUnwrapSol: true,
      dynamicComputeUnitLimit: true,
      prioritizationFeeLamports: "auto"
    };

    if (CONFIG.feeBps > 0) {
      body.feeAccount = CONFIG.feeAccount;
    }

    const swapRes = await fetch(CONFIG.swapApi, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!swapRes.ok) {
      throw new Error(`Swap transaction build failed (${swapRes.status}).`);
    }

    const swapData = await swapRes.json();
    if (!swapData?.swapTransaction) {
      throw new Error("Missing swap transaction in Jupiter response.");
    }

    const txBytes = Uint8Array.from(atob(swapData.swapTransaction), (c) => c.charCodeAt(0));
    const tx = solanaWeb3.VersionedTransaction.deserialize(txBytes);
    const signedTx = await wallet.signTransaction(tx);

    const connection = new solanaWeb3.Connection(CONFIG.rpcUrl, "confirmed");
    const signature = await connection.sendRawTransaction(signedTx.serialize(), {
      skipPreflight: false,
      maxRetries: 3
    });

    setStatus(`Swap sent. Waiting for confirmation: ${signature}`, "info");

    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction(
      {
        signature,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
      },
      "confirmed"
    );

    setStatus(`Swap confirmed. Tx: ${signature}`, "success");
  }

  async function withUiLock(task) {
    els.quoteBtn.disabled = true;
    els.swapBtn.disabled = true;
    els.connectBtn.disabled = true;

    try {
      await task();
    } catch (err) {
      setStatus(err.message || "Unexpected error.", "error");
    } finally {
      els.quoteBtn.disabled = false;
      els.swapBtn.disabled = false;
      els.connectBtn.disabled = false;
    }
  }

  function init() {
    els.outputMint.value = CONFIG.outputMint;
    els.feeReadout.textContent = `${formatBpsToPercent(CONFIG.feeBps)}%`;
    els.feeAccount.textContent = CONFIG.feeAccount;

    els.connectBtn.addEventListener("click", () => withUiLock(connectWallet));
    els.quoteBtn.addEventListener("click", () => withUiLock(fetchQuote));
    els.swapBtn.addEventListener("click", () => withUiLock(executeSwap));

    if (CONFIG.outputMint.includes("REPLACE_WITH")) {
      setStatus("Set commit-coin mint in js/app.js before using in production.", "error");
    }
  }

  init();
})();
