import type { holding } from "@/db/schema";

export type AssetType = "crypto" | "stock" | "cash";

export interface Ticker {
    symbol: string;
    name: string;
    price: string;
    change: number;
    type: AssetType;
    data: number[];
}

export interface Feature {
    icon: string;
    title: string;
    desc: string;
}

export interface User{
    name: string;
    email: string;
}

/** A holding row as stored in the database (Drizzle-inferred). */
export type Holding = typeof holding.$inferSelect;

/** A holding prepared for the dashboard: numbers parsed, value computed. */
export interface HoldingView {
  id: string;
  symbol: string;
  type: AssetType;
  display: string; // friendly label, e.g. "BTC"
  quantity: number;
  lastPrice: number | null; // last fetched USD price per unit
  value: number | null; // quantity * lastPrice, or null if not yet priced
  priceUpdatedAt: string | null; // ISO timestamp of lastPrice
}

/** Aggregated portfolio numbers shown in the summary cards. */
export interface PortfolioTotals {
  total: number;
  crypto: number;
  stock: number;
  cash: number;
  pricedCount: number;
  unpricedCount: number;
  asOf: string | null; // most recent priceUpdatedAt across holdings (ISO)
}

/** Result returned by the holding mutation server actions. */
export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Result returned by the refreshPrices server action. */
export type RefreshResult =
  | { ok: true; updated: number; missing: number }
  | { ok: false; error: string };