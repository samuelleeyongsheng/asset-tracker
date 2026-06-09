import type { AssetType } from "@/types";

/**
 * The assets a user can add. Each entry maps a friendly display ticker to the
 * exact symbol the pricing API expects:
 *   - crypto -> the CoinGecko coin id ("bitcoin"), used by /simple/price
 *   - stock  -> the Yahoo Finance ticker ("AAPL"), used by quote()
 *
 * Using a fixed catalog guarantees every stored symbol resolves to a real price,
 * which keeps the prototype simple (no symbol-search / fuzzy lookups). Extend
 * this list to support more assets.
 */
export interface CatalogAsset {
  display: string; // shown to the user, e.g. "BTC"
  name: string; // full name, e.g. "Bitcoin"
  symbol: string; // API symbol: CoinGecko id (crypto) or Yahoo ticker (stock)
  type: AssetType;
}

export const ASSET_CATALOG: CatalogAsset[] = [
  { display: "BTC", name: "Bitcoin", symbol: "bitcoin", type: "crypto" },
  { display: "ETH", name: "Ethereum", symbol: "ethereum", type: "crypto" },
  { display: "SOL", name: "Solana", symbol: "solana", type: "crypto" },
  { display: "XRP", name: "XRP", symbol: "ripple", type: "crypto" },
  { display: "ADA", name: "Cardano", symbol: "cardano", type: "crypto" },
  { display: "DOGE", name: "Dogecoin", symbol: "dogecoin", type: "crypto" },
  { display: "AAPL", name: "Apple", symbol: "AAPL", type: "stock" },
  { display: "NVDA", name: "NVIDIA", symbol: "NVDA", type: "stock" },
  { display: "TSLA", name: "Tesla", symbol: "TSLA", type: "stock" },
  { display: "MSFT", name: "Microsoft", symbol: "MSFT", type: "stock" },
  { display: "AMZN", name: "Amazon", symbol: "AMZN", type: "stock" },
  { display: "GOOGL", name: "Alphabet", symbol: "GOOGL", type: "stock" },
];

/** Catalog grouped by type, for rendering grouped <optgroup>s in the form. */
export const CATALOG_BY_TYPE: Record<AssetType, CatalogAsset[]> = {
  crypto: ASSET_CATALOG.filter((a) => a.type === "crypto"),
  stock: ASSET_CATALOG.filter((a) => a.type === "stock"),
};

/** Find a catalog entry by its stored symbol + type. */
export function findAsset(symbol: string, type: AssetType): CatalogAsset | undefined {
  return ASSET_CATALOG.find((a) => a.symbol === symbol && a.type === type);
}

/** Is this (symbol, type) pair one we support? */
export function isSupportedAsset(symbol: string, type: AssetType): boolean {
  return findAsset(symbol, type) !== undefined;
}

/** Human label for a stored holding, falling back to the raw symbol. */
export function assetLabel(symbol: string, type: AssetType): string {
  return findAsset(symbol, type)?.display ?? symbol.toUpperCase();
}

/**
 * The <select> in the form uses a single "type:symbol" string as its value so
 * one control captures both fields via FormData. These two helpers build and
 * parse that string and are shared by the form and the validation schema.
 */
export function assetValue(a: { type: AssetType; symbol: string }): string {
  return `${a.type}:${a.symbol}`;
}

export function splitAssetValue(value: string): { type: AssetType | null; symbol: string } {
  const idx = value.indexOf(":");
  if (idx === -1) return { type: null, symbol: "" };
  const rawType = value.slice(0, idx);
  const symbol = value.slice(idx + 1);
  const type = rawType === "crypto" || rawType === "stock" ? rawType : null;
  return { type, symbol };
}
