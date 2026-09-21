// Pages Function: GET /api/balance?chain=eth|trx&address=0x...|T...
// Runs on Cloudflare's edge. The upstream API key lives in the Pages project
// environment variable ETHERSCAN_API_KEY (never shipped to the browser).

const ETH_USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
const TRX_USDT = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "public, max-age=15",
    },
  });

const isEth = (a) => /^0x[a-fA-F0-9]{40}$/.test(a);
const isTrx = (a) => /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(a);

async function ethBalance(address, key) {
  const u = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=balance&address=${address}&tag=latest&apikey=***}`;
  const d = await (await fetch(u)).json();
  if (d.status !== "1") throw new Error(d.result || "etherscan_error");
  return (Number(d.result) / 1e18).toFixed(4);
}

async function ethUsdtBalance(address, key) {
  const u = `https://api.etherscan.io/v2/api?chainid=1&module=account&action=tokenbalance&contractaddress=${ETH_USDT}&address=${address}&tag=latest&apikey=***}`;
  const d = await (await fetch(u)).json();
  if (d.status !== "1") throw new Error(d.result || "etherscan_error");
  return (Number(d.result) / 1e6).toFixed(2);
}

async function trxBalances(address, key) {
  const headers = { Accept: "application/json" };
  if (key) headers["TRON-PRO-API-KEY"] = key;
  const d = await (await fetch(`https://api.trongrid.io/v1/accounts/${address}`, { headers })).json();
  const acc = (d.data || [])[0] || {};
  const native = ((acc.balance || 0) / 1e6).toFixed(4);
  let usdt = "0.00";
  for (const t of acc.trc20 || []) {
    if (t[TRX_USDT]) { usdt = (Number(t[TRX_USDT]) / 1e6).toFixed(2); break; }
  }
  return { native, usdt };
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const chain = (url.searchParams.get("chain") || "").toLowerCase();
  const address = (url.searchParams.get("address") || "").trim();

  if (chain === "eth") {
    if (!isEth(address)) return json({ error: "invalid_eth_address" }, 400);
    if (!env.ETHERSCAN_API_KEY) return json({ error: "server_misconfigured" }, 500);
    try {
      const [native, usdt] = await Promise.all([
        ethBalance(address, env.ETHERSCAN_API_KEY),
        ethUsdtBalance(address, env.ETHERSCAN_API_KEY),
      ]);
      return json({ chain, address, symbol: "ETH", native, usdt });
    } catch (e) {
      return json({ error: "upstream", detail: String(e.message || e) }, 502);
    }
  }

  if (chain === "trx") {
    if (!isTrx(address)) return json({ error: "invalid_trx_address" }, 400);
    try {
      const { native, usdt } = await trxBalances(address, env.TRON_PRO_API_KEY);
      return json({ chain, address, symbol: "TRX", native, usdt });
    } catch (e) {
      return json({ error: "upstream", detail: String(e.message || e) }, 502);
    }
  }

  return json({ error: "bad_chain", allowed: ["eth", "trx"] }, 400);
}
