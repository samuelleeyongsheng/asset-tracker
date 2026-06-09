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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { CATALOG_BY_TYPE, assetValue } from "@/lib/assets-catalog";
import { holdingSchema } from "@/lib/validations/holding";
import { addHolding, updateHolding } from "@/server/holdings";
import type { HoldingView } from "@/types";

type FieldErrors = Partial<Record<"asset" | "quantity", string>>;

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
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const raw = {
      asset: String(formData.get("asset") ?? ""),
      quantity: String(formData.get("quantity") ?? ""),
    };

    // Client-side validation for instant feedback (the server re-validates too).
    const result = holdingSchema.safeParse(raw);
    if (!result.success) {
      const { fieldErrors } = z.flattenError(result.error);
      setErrors({
        asset: fieldErrors.asset?.[0],
        quantity: fieldErrors.quantity?.[0],
      });
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
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

  const defaultAsset = holding
    ? assetValue({ type: holding.type, symbol: holding.symbol })
    : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isEdit ? "Edit holding" : "Add asset"}</CardTitle>
        <CardDescription>
          {isEdit
            ? "Update your position. The latest price is fetched when you save."
            : "Pick an asset and enter how much you hold — we fetch its price on save."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} noValidate>
          <FieldGroup>
            <Field data-invalid={!!errors.asset}>
              <FieldLabel htmlFor="asset">Asset</FieldLabel>
              <select
                id="asset"
                name="asset"
                defaultValue={defaultAsset}
                aria-invalid={!!errors.asset}
                className={selectClassName}
              >
                <option value="" disabled>
                  Select an asset…
                </option>
                <optgroup label="Crypto">
                  {CATALOG_BY_TYPE.crypto.map((a) => (
                    <option key={assetValue(a)} value={assetValue(a)}>
                      {a.display} — {a.name}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Stocks">
                  {CATALOG_BY_TYPE.stock.map((a) => (
                    <option key={assetValue(a)} value={assetValue(a)}>
                      {a.display} — {a.name}
                    </option>
                  ))}
                </optgroup>
              </select>
              {errors.asset && <FieldError>{errors.asset}</FieldError>}
            </Field>

            <Field data-invalid={!!errors.quantity}>
              <FieldLabel htmlFor="quantity">Quantity</FieldLabel>
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
