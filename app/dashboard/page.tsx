import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { desc, eq } from "drizzle-orm";

import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { holding } from "@/db/schema";
import Navbar from "@/components/layout/Navbar";
import DashboardClient from "@/components/dashboard/DashboardClient";
import { assetLabel } from "@/lib/assets-catalog";
import type { AssetType, HoldingView, PortfolioTotals } from "@/types";

function computeTotals(holdings: HoldingView[]): PortfolioTotals {
  let total = 0;
  let crypto = 0;
  let stock = 0;
  let cash = 0;
  let pricedCount = 0;
  let unpricedCount = 0;
  let asOf: string | null = null;

  for (const h of holdings) {
    if (h.value === null) {
      unpricedCount += 1;
      continue;
    }
    pricedCount += 1;
    total += h.value;
    if (h.type === "crypto") crypto += h.value;
    else if (h.type === "stock") stock += h.value;
    else cash += h.value;
    if (h.priceUpdatedAt && (asOf === null || h.priceUpdatedAt > asOf)) {
      asOf = h.priceUpdatedAt;
    }
  }

  return { total, crypto, stock, cash, pricedCount, unpricedCount, asOf };
}

export default async function DashboardPage() {
  // Real auth check (defense in depth alongside the proxy.ts middleware, which
  // only does an optimistic cookie check).
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) redirect("/");

  // Only this user's rows — the core of user isolation. Wrapped so a not-yet-
  // migrated database (i.e. before `pnpm db:push`) shows a setup notice instead
  // of throwing and taking down the dev server.
  let holdings: HoldingView[] = [];
  let loadError = false;
  try {
    const rows = await db
      .select()
      .from(holding)
      .where(eq(holding.userId, session.user.id))
      .orderBy(desc(holding.createdAt));

    holdings = rows.map((r) => {
      const type = r.type as AssetType;
      const quantity = Number(r.quantity);
      const lastPrice = r.lastPrice === null ? null : Number(r.lastPrice);
      const value = lastPrice === null ? null : quantity * lastPrice;
      return {
        id: r.id,
        symbol: r.symbol,
        type,
        display: assetLabel(r.symbol, type),
        quantity,
        lastPrice,
        value,
        priceUpdatedAt: r.priceUpdatedAt ? r.priceUpdatedAt.toISOString() : null,
      };
    });
  } catch (err) {
    console.error(
      "Failed to load holdings — is the DB migrated? Run `pnpm db:push`.\n",
      err,
    );
    loadError = true;
  }

  const totals = computeTotals(holdings);

  return (
    <div className="flex min-h-full flex-col">
      <Navbar />
      {loadError ? (
        <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-16">
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center">
            <h1 className="text-lg font-semibold">Couldn&apos;t load your portfolio</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              The <code className="font-mono">holding</code> table isn&apos;t set up in the
              database yet. In your project terminal run{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono">pnpm db:push</code>{" "}
              to create it, then refresh this page.
            </p>
          </div>
        </main>
      ) : (
        <DashboardClient
          holdings={holdings}
          totals={totals}
          userName={session.user.name}
        />
      )}
    </div>
  );
}
