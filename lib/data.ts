import type { Ticker, Feature } from "@/types";

export const TICKERS: Ticker[] = [
  { symbol: "BTC",  name: "Bitcoin",      price: "88,240", change:  2.4,  type: "crypto", data: [60,58,65,63,70,68,75,72,80,78,85,83] },
  { symbol: "ETH",  name: "Ethereum",     price: "3,512",  change:  1.8,  type: "crypto", data: [30,32,28,35,33,40,38,42,40,45,43,48] },
  { symbol: "AAPL", name: "Apple Inc.",   price: "309.30", change: -0.6,  type: "stock",  data: [50,52,49,48,51,47,45,48,44,43,42,41] },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: "211.40", change:  3.2,  type: "stock",  data: [40,42,45,48,50,55,53,58,60,65,63,70] },
  { symbol: "SOL",  name: "Solana",       price: "81.80", change: -1.2,  type: "crypto", data: [55,53,50,48,45,47,43,41,44,40,38,36] },
  { symbol: "TSLA", name: "Tesla Inc.",   price: "402.10", change:  0.9,  type: "stock",  data: [40,41,43,42,44,46,45,47,48,50,49,51] },
];

export const FEATURES: Feature[] = [
  {
    icon: "₿",
    title: "Crypto tracking",
    desc: "Monitor Bitcoin, Ethereum, Solana and 1,000+ tokens in real time.",
  },
  {
    icon: "📈",
    title: "Stock portfolio",
    desc: "Track NYSE & NASDAQ stocks alongside your crypto for a complete picture.",
  },
  {
    icon: "📊",
    title: "All-in-one dashboard",
    desc: "See exactly how your wealth is split between crypto and stocks.",
  },
  {
    icon: "🌙",
    title: "Light & dark mode",
    desc: "Comfortable viewing any time of day with one-click theme switching.",
  },
];