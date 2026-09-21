# DevTools API worker (balance proxy)

Hides the blockchain API keys from the browser. The page calls a same-origin
endpoint (`/api/balance`) and the Worker attaches the secret key server-side.

## Why a backend at all?

Anything shipped to the browser (JS/HTML) is public — anyone can read an API
key embedded in the page and drain your quota or impersonate you. Keys must
live on a server/edge and only a narrow, validated endpoint is exposed.

## Endpoint

```
GET /api/balance?chain=eth&address=0x...   -> { chain, address, symbol, native, usdt }
GET /api/balance?chain=trx&address=T...    -> { chain, address, symbol, native, usdt }
GET /api/health                            -> { ok: true }
```

## Prerequisites

- Free Etherscan API key: https://etherscan.io/myapikey  (required for ETH/ERC-20)
- Optional TronGrid key (higher rate limits): https://www.trongrid.io/

## Deploy (dashboard)

1. Cloudflare dashboard → **Workers & Pages** → **Create** → Worker → name it `devtools-api`.
2. Paste `index.js`, **Deploy**.
3. Worker → **Settings → Variables and Secrets** → add **Encrypted** vars:
   - `ETHERSCAN_API_KEY` = your key
   - `TRON_PRO_API_KEY` = your TronGrid key (optional)
4. Worker → **Settings → Domains & Routes** → **Add route**:
   - Route: `tools.vexum.top/api/*`
   - Zone: `vexum.top`
   (Same origin ⇒ no CORS, no extra hostname.)

## Deploy (wrangler CLI)

```bash
cd worker
npm i -g wrangler
wrangler login
wrangler secret put ETHERSCAN_API_KEY
wrangler secret put TRON_PRO_API_KEY   # optional
wrangler deploy
```

## Abuse protection (recommended)

Your key is shared by every visitor, so add limits at the edge:

- Cloudflare → **Security → WAF → Rate limiting rules**: limit `/api/*` per IP
  (e.g. 30 requests / minute).
- Optionally require a **Turnstile** token on `/api/balance`.
- Responses are cached 15s (`CACHE_TTL`) to cut upstream calls.

## Verify

```bash
curl "https://tools.vexum.top/api/health"
curl "https://tools.vexum.top/api/balance?chain=eth&address=0xdAC17F958D2ee523a2206206994597C13D831ec7"
```
