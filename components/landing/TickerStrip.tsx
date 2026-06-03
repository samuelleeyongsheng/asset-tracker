import { TICKERS } from "@/lib/data";
import type { Ticker } from "@/types";
import Badge from "@/components/ui/badge";

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const W = 80, H = 28, P = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const points = data
    .map((v, i) => {
      const x = P + (i / (data.length - 1)) * (W - P * 2);
      const y = H - P - ((v - min) / range) * (H - P * 2);
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={W} height={H} className="block shrink-0">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TickerCard({ symbol, name, price, change, type, data }: Ticker) {
  const positive = change >= 0;
  const strokeColor = positive ? "#16a34a" : "#dc2626";

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl border min-w-[190px]
                    bg-card border-border shadow-sm shrink-0">
      <div className="flex-1 min-w-0">
        {/* Symbol + asset type badge */}
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-semibold text-[13px] font-mono text-card-foreground">
            {symbol}
          </span>
          <Badge variant={type === "crypto" ? "crypto" : "stock"} size="sm">
            {type}
          </Badge>
        </div>

        <div className="text-[10px] text-muted-foreground mb-1">{name}</div>

        <div className="font-semibold text-[13px] font-mono text-card-foreground">
          ${price}
        </div>

        <div className={[
          "text-[11px] font-medium",
          positive
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400",
        ].join(" ")}>
          {positive ? "▲" : "▼"} {Math.abs(change)}%
        </div>
      </div>

      <Sparkline data={data} color={strokeColor} />
    </div>
  );
}

export default function TickerStrip() {
  const doubled = [...TICKERS, ...TICKERS];

  return (
    <div className="overflow-hidden border-y border-border bg-muted/30 py-2">
      <div className="ticker-track">
        {doubled.map((ticker, i) => (
          <TickerCard key={`${ticker.symbol}-${i}`} {...ticker} />
        ))}
      </div>
    </div>
  );
}