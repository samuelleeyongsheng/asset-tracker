import { z } from "zod";

import { isSupportedAsset, splitAssetValue } from "@/lib/assets-catalog";
import type { AssetType } from "@/types";

/*
  Single source of truth for "valid holding form data". Values arrive as strings
  (from FormData / form fields), so every field is validated as a string and
  transformed into its final typed shape. We validate on the client for instant
  feedback AND on the server (server actions) — never trust the client alone.
*/

// The <select> submits "type:symbol" (e.g. "crypto:bitcoin"). Confirm it
// resolves to an asset we actually support, then expose it as { symbol, type }.
const assetField = z
  .string()
  .min(1, "Pick an asset")
  .refine((val) => {
    const { type, symbol } = splitAssetValue(val);
    return type !== null && symbol.length > 0 && isSupportedAsset(symbol, type);
  }, "Pick a supported asset")
  .transform((val) => {
    const { type, symbol } = splitAssetValue(val);
    return { symbol, type: type as AssetType };
  });

// How many units the user holds. Must be a finite, positive number.
const quantityField = z
  .string()
  .trim()
  .min(1, "Enter a quantity")
  .transform((s) => Number(s))
  .refine((n) => Number.isFinite(n) && n > 0, "Quantity must be greater than 0");

export const holdingSchema = z.object({
  asset: assetField,
  quantity: quantityField,
});

// Post-parse shape: { asset: { symbol, type }, quantity: number }
export type HoldingInput = z.infer<typeof holdingSchema>;

// Raw (pre-parse) shape the form and server actions pass in.
export type RawHoldingInput = {
  asset: string;
  quantity: string;
};
