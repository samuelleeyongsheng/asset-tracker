/**
 * Server-only price fetching. Imported only by server actions (server/holdings.ts).
 *   - crypto -> CoinGecko (free, no API key)
 *   - stock  -> yahoo-finance2 (no API key, unofficial)
 *
 * Prices are fetched only when the user writes an asset or hits Refresh, so a
 * small in-memory TTL cache absorbs bursts (e.g. quick double-clicks) and keeps
 * us well under the CoinGecko free-tier rate limit.
 */
import yahooFinance from "yahoo-finance2";

import type { AssetType } from "@/types";

// yahoo-finance2 prints a one-time survey notice to the console; silence it.
try {
  (yahooFinance as unknown as { suppressNotices?: (n: string[]) => void }).suppressNotices?.([
    "yahooSurvey",
  ]);
} catch {
  // some versions don't expose this — safe to ignore
}

const TTL_MS = 60_000;
type CacheEntry = { price: number; at: number };
const cache = new Map<string, CacheEntry>(); // key: `${type}:${symbol}`

const key = (type: AssetType, symbol: string) => `${type}:${symbol}`;

function getCached(type: AssetType, symbol: string): number | undefined {
  const hit = cache.get(key(type, symbol));
  return hit && Date.now() - hit.at < TTL_MS ? hit.price : undefined;
}

function setCached(type: AssetType, symbol: string, price: number) {
  cache.set(key(type, symbol), { price, at: Date.now() });
}

async function fetchCryptoPrices(ids: string[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (ids.length === 0) return out;
  const url =
    "https://api.coingecko.com/api/v3/simple/price?ids=" +
    encodeURIComponent(ids.join(",")) +
    "&vs_currencies=usd";
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`CoinGecko responded ${res.status}`);
  const data = (await res.json()) as Record<string, { usd?: number }>;
  for (const id of ids) {
    const usd = data[id]?.usd;
    if (typeof usd === "number") out.set(id, usd);
  }
  return out;
}

// The fields we read off a yahoo-finance2 quote. The library's overloaded
// return type is awkward to narrow, so we treat the result as this minimal shape.
type YahooQuote = { symbol?: string; regularMarketPrice?: number };

async function fetchStockPrices(tickers: string[]): Promise<Map<string, number>> {
  const out = new Map<string, number>();
  if (tickers.length === 0) return out;
  const result = (await yahooFinance.quote(tickers)) as unknown;
  const list = (Array.isArray(result) ? result : [result]) as YahooQuote[];
  for (const q of list) {
    const price = q?.regularMarketPrice;
    if (q?.symbol && typeof price === "number") out.set(q.symbol, price);
  }
  return out;
}

export interface PriceResult {
  prices: Map<string, number>; // key `${type}:${symbol}` -> USD per unit
  missing: { symbol: string; type: AssetType }[]; // assets with no price
}

/** Fetch USD prices for a batch of assets, using the TTL cache where possible. */
export async function getPrices(
  items: { symbol: string; type: AssetType }[],
): Promise<PriceResult> {
  // de-dupe by type:symbol
  const unique = new Map<string, { symbol: string; type: AssetType }>();
  for (const it of items) unique.set(key(it.type, it.symbol), it);

  const prices = new Map<string, number>();
  const needCrypto: string[] = [];
  const needStock: string[] = [];

  for (const { symbol, type } of unique.values()) {
    const cached = getCached(type, symbol);
    if (cached !== undefined) prices.set(key(type, symbol), cached);
    else if (type === "crypto") needCrypto.push(symbol);
    else needStock.push(symbol);
  }

  // One batched call per source; a failure in one degrades only its assets.
  const [crypto, stock] = await Promise.all([
    fetchCryptoPrices(needCrypto).catch((e) => {
      console.error("[prices] crypto fetch failed:", e);
      return new Map<string, number>();
    }),
    fetchStockPrices(needStock).catch((e) => {
      console.error("[prices] stock fetch failed:", e);
      return new Map<string, number>();
    }),
  ]);

  for (const [id, usd] of crypto) {
    prices.set(key("crypto", id), usd);
    setCached("crypto", id, usd);
  }
  for (const [ticker, usd] of stock) {
    prices.set(key("stock", ticker), usd);
    setCached("stock", ticker, usd);
  }

  const missing: { symbol: string; type: AssetType }[] = [];
  for (const { symbol, type } of unique.values()) {
    if (!prices.has(key(type, symbol))) missing.push({ symbol, type });
  }
  return { prices, missing };
}

/** Fetch a single asset's USD price (used on add/edit). null if unavailable. */
export async function getPrice(symbol: string, type: AssetType): Promise<number | null> {
  const { prices } = await getPrices([{ symbol, type }]);
  return prices.get(key(type, symbol)) ?? null;
}
