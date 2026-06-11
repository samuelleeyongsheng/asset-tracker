"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Modal from "@/components/ui/Modal";
import { HoldingForm } from "@/components/dashboard/HoldingForm";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { refreshPrices } from "@/server/holdings";
import type { HoldingView, PortfolioTotals } from "@/types";

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

function formatAsOf(iso: string | null): string {
  if (!iso) return "Prices not fetched yet";
  const d = new Date(iso);
  return `Prices as of ${d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })}`;
}

export default function DashboardClient({
  holdings,
  totals,
  userName,
}: {
  holdings: HoldingView[];
  totals: PortfolioTotals;
  userName?: string | null;
}) {
  const router = useRouter();
  const [isRefreshing, startRefresh] = useTransition();
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<HoldingView | null>(null);

  function handleRefresh() {
    startRefresh(async () => {
      const res = await refreshPrices();
      if (!res.ok) {
        toast.error(res.error ?? "Couldn't refresh prices");
        return;
      }
      if (res.updated > 0) {
        toast.success(`Updated ${res.updated} price${res.updated === 1 ? "" : "s"}`);
      } else {
        toast.message("No prices to update");
      }
      if (res.missing > 0) {
        toast.warning(
          `Couldn't find a price for ${res.missing} asset${res.missing === 1 ? "" : "s"}`,
        );
      }
      router.refresh();
    });
  }

  const closeModals = () => {
    setShowAdd(false);
    setEditing(null);
  };

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {userName ? `${userName}'s portfolio` : "Your portfolio"}
          </h1>
          <p className="text-sm text-muted-foreground">{formatAsOf(totals.asOf)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={isRefreshing ? "size-4 animate-spin" : "size-4"} />
            {isRefreshing ? "Refreshing…" : "Refresh prices"}
          </Button>
          <Button onClick={() => setShowAdd(true)}>
            <Plus className="size-4" />
            Add asset
          </Button>
        </div>
      </div>

      {/* Summary cards — computed from stored prices, no API call on load */}
      <div className="mt-6 grid gap-4 grid-cols-2 sm:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Total value</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{usd(totals.total)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Crypto</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{usd(totals.crypto)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Stocks</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{usd(totals.stock)}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Cash</CardDescription>
            <CardTitle className="text-2xl tabular-nums">{usd(totals.cash)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {totals.unpricedCount > 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          {totals.unpricedCount} holding{totals.unpricedCount === 1 ? "" : "s"} without a
          price yet — they aren&apos;t counted in the total. Hit Refresh to fetch them.
        </p>
      )}

      <div className="mt-6">
        <HoldingsTable holdings={holdings} onEdit={(h) => setEditing(h)} />
      </div>

      {/* Add / Edit share one modal; a non-null `editing` means edit mode. */}
      <Modal open={showAdd || editing !== null} onClose={closeModals}>
        <HoldingForm holding={editing} onClose={closeModals} />
      </Modal>
    </main>
  );
}
