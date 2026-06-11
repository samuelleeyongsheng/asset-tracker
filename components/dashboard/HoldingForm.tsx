"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ASSET_CATALOG } from "@/lib/assets-catalog";
import { holdingSchema } from "@/lib/validations/holding";
import { addHolding, updateHolding } from "@/server/holdings";
import type { AssetType, HoldingView } from "@/types";

type FieldErrors = Partial<Record<"type" | "symbol" | "quantity", string>>;

// Native <select> styled to match the shadcn Input (which is @base-ui based).
const selectClassName =
  "h-8 w-full min-w-0 cursor-pointer rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30";

export function HoldingForm({
  holding,
  onClose,
}: {
  holding?: HoldingView | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEdit = !!holding;
  // `type` is controlled so it can drive the placeholder, hint and suggestions.
  const [type, setType] = useState<AssetType>(holding?.type ?? "crypto");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = {
      type: String(formData.get("type") ?? ""),
      symbol: String(formData.get("symbol") ?? ""),
      quantity: String(formData.get("quantity") ?? ""),
    };

    // Client-side validation for instant feedback (the server re-validates too).
    const result = holdingSchema.safeParse(raw);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({
        type: fieldErrors.type?.[0],
        symbol: fieldErrors.symbol?.[0],
        quantity: fieldErrors.quantity?.[0],
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      // The server resolves the typed symbol + fetches its price; if it can't be
      // priced it comes back with a field error we surface below.
      const res = isEdit
        ? await updateHolding(holding!.id, raw)
        : await addHolding(raw);

      if (!res.ok) {
        if (res.fieldErrors) setErrors(res.fieldErrors);
        toast.error(res.error ?? "Something went wrong");
        return;
      }

      toast.success(isEdit ? "Holding updated" : "Holding added");
      onClose();
      router.refresh(); // re-render the dashboard server component with fresh data
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Autocomplete hints for the chosen type — still fully free-text.
  const suggestions = ASSET_CATALOG.filter((a) => a.type === type);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit holding" : "Add asset"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update your position. The latest price is fetched when you save."
            : "Type any ticker or coin — we fetch its price on save."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.type}>
              <FieldLabel htmlFor="type">Type</FieldLabel>
              <select
                id="type"
                name="type"
                value={type}
                onChange={(e) => setType(e.target.value as AssetType)}
                aria-invalid={!!errors.type}
                className={selectClassName}
              >
                <option value="crypto" className="bg-popover text-popover-foreground">Crypto</option>
                <option value="stock" className="bg-popover text-popover-foreground">Stock</option>
                <option value="cash" className="bg-popover text-popover-foreground">Cash</option>

              </select>
              {errors.type && <FieldError>{errors.type}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.symbol}>
              <FieldLabel htmlFor="symbol">Symbol</FieldLabel>
              <Input
                id="symbol"
                name="symbol"
                list="symbol-suggestions"
                autoComplete="off"
                placeholder={
                  type === "crypto" ? "e.g. BTC"
                  : type === "stock" ? "e.g. TSLA "
                  : type === "cash" ? "e.g. USD"
                  : "Bonds"
                }
                defaultValue={holding?.symbol ?? ""}
                aria-invalid={!!errors.symbol}
              />
              <datalist id="symbol-suggestions">
                {suggestions.map((a) => (
                  <option
                    key={a.symbol}
                    value={a.type === "crypto" ? a.symbol : a.display}
                  >
                    {a.display} — {a.name}
                  </option>
                ))}
              </datalist>
              <FieldDescription>
                {type === "crypto"
                  ? "Coin name, ticker, or CoinGecko id — e.g. bitcoin, ETH, solana."
                  : type === "cash"
                    ? "Currency code — only USD is supported right now."
                    : "Stock ticker — e.g. AAPL, NVDA, TSLA."}
              </FieldDescription>
              {errors.symbol && <FieldError>{errors.symbol}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.quantity}>
              <FieldLabel htmlFor="quantity">Quantity / Amount in Cash</FieldLabel>
              <Input
                id="quantity"
                name="quantity"
                type="number"
                step="any"
                min="0"
                inputMode="decimal"
                placeholder="0.00"
                defaultValue={holding ? String(holding.quantity) : ""}
                aria-invalid={!!errors.quantity}
              />
              {errors.quantity && <FieldError>{errors.quantity}</FieldError>}
            </Field>

            <Field>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? isEdit
                    ? "Saving…"
                    : "Adding…"
                  : isEdit
                    ? "Save changes"
                    : "Add asset"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </Field>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  );
}
