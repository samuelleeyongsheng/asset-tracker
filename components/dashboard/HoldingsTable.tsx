"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Pencil, Trash2 } from "lucide-react";

import Badge from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteHolding } from "@/server/holdings";
import type { HoldingView } from "@/types";

const usd = (n: number | null) =>
  n == null ? "—" : n.toLocaleString("en-US", { style: "currency", currency: "USD" });

const qty = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 8 });

export function HoldingsTable({
  holdings,
  onEdit,
}: {
  holdings: HoldingView[];
  onEdit: (h: HoldingView) => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDelete(h: HoldingView) {
    if (!window.confirm(`Delete ${h.display}? This can't be undone.`)) return;
    startTransition(async () => {
      const res = await deleteHolding(h.id);
      if (!res.ok) {
        toast.error(res.error ?? "Couldn't delete that holding");
        return;
      }
      toast.success(`Removed ${h.display}`);
      router.refresh();
    });
  }

  if (holdings.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
        No assets yet. Click{" "}
        <span className="font-medium text-foreground">Add asset</span> to start
        tracking your portfolio.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-medium">Asset</th>
            <th className="px-4 py-3 font-medium">Type</th>
            <th className="px-4 py-3 text-right font-medium">Quantity</th>
            <th className="px-4 py-3 text-right font-medium">Price</th>
            <th className="px-4 py-3 text-right font-medium">Value</th>
            <th className="px-4 py-3 text-right font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {holdings.map((h) => (
            <tr key={h.id} className="border-t border-border">
              <td className="px-4 py-3 font-medium text-foreground">{h.display}</td>
              <td className="px-4 py-3">
                <Badge variant={h.type} size="sm">
                  {h.type}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right tabular-nums">{qty(h.quantity)}</td>
              <td className="px-4 py-3 text-right tabular-nums">{usd(h.lastPrice)}</td>
              <td className="px-4 py-3 text-right font-medium tabular-nums">
                {usd(h.value)}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-1">
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onEdit(h)}
                    aria-label={`Edit ${h.display}`}
                  >
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => handleDelete(h)}
                    disabled={isPending}
                    aria-label={`Delete ${h.display}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
