import { z } from "zod";

/*
  Single source of truth for "valid holding form data". Values arrive as strings
  from the form, so each field is validated as a string and transformed into its
  final shape. Validated on the client (instant feedback) AND on the server.

  `symbol` is free text — the user types a ticker (stocks) or a coin
  name/ticker/id (crypto). We don't restrict it to a fixed catalog here; the
  server resolves it and price-checks it on save, rejecting anything it can't
  actually price.
*/

const typeField = z.enum(["crypto", "stock", "cash"]);

const symbolField = z
  .string()
  .trim()
  .min(1, "Enter a symbol")
  .max(40, "That symbol looks too long");

const quantityField = z
  .string()
  .trim()
  .min(1, "Enter a quantity")
  .transform((s) => Number(s))
  .refine((n) => Number.isFinite(n) && n > 0, "Quantity must be greater than 0");

export const holdingSchema = z.object({
  type: typeField,
  symbol: symbolField,
  quantity: quantityField,
});

// Post-parse shape: { type: "crypto" | "stock", symbol: string, quantity: number }
export type HoldingInput = z.infer<typeof holdingSchema>;

// Raw (pre-parse) shape the form and server actions pass in.
export type RawHoldingInput = {
  type: string;
  symbol: string;
  quantity: string;
};
