"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { holding } from "@/db/schema";
import { holdingSchema, type RawHoldingInput } from "@/lib/validations/holding";
import { getPrice, getPrices, resolveCryptoId } from "@/lib/prices";
import { isSupportedAsset } from "@/lib/assets-catalog";
import type { ActionResult, AssetType, RefreshResult } from "@/types";

/** Resolve the signed-in user's id, or throw. */
async function requireUserId(): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("UNAUTHENTICATED");
  return session.user.id;
}

// zod's flattenError gives string[] per field; we surface only the first message.
function firstErrors(
  fieldErrors: Record<string, string[] | undefined>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(fieldErrors)) if (v?.[0]) out[k] = v[0];
  return out;
}

/**
 * Turn the user's free-typed symbol into the exact value our price layer needs,
 * or return a user-facing error. Per type:
 *   crypto -> CoinGecko coin id, resolved via search (rejects unknown coins)
 *   stock  -> uppercased ticker (Yahoo validates it later by pricing it)
 *   cash   -> uppercased currency code; since cash has no pricing API to vouch
 *             for it, the catalog is the gatekeeper for what's allowed.
 */
async function resolveSymbol(
  type: AssetType,
  input: string,
): Promise<{ ok: true; symbol: string } | (ActionResult & { ok: false })> {
  if (type === "crypto") {
    const id = await resolveCryptoId(input);
    if (!id) {
      return {
        ok: false,
        error: `Couldn't find a crypto matching "${input}". Try its name or ticker, e.g. bitcoin or eth.`,
        fieldErrors: { symbol: "Unknown crypto" },
      };
    }
    return { ok: true, symbol: id };
  }

  const symbol = input.toUpperCase();

  if (type === "cash" && !isSupportedAsset(symbol, "cash")) {
    return {
      ok: false,
      error: `"${input}" isn't a supported currency. Only USD is supported right now.`,
      fieldErrors: { symbol: "Unsupported currency" },
    };
  }

  return { ok: true, symbol };
}

export async function addHolding(raw: RawHoldingInput): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "Please sign in again." };
  }

  const parsed = holdingSchema.safeParse(raw);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: firstErrors(fieldErrors),
    };
  }
  const { type, symbol: input, quantity } = parsed.data;

  // Resolve + validate the free-typed symbol (see resolveSymbol above).
  const resolved = await resolveSymbol(type, input);
  if (!resolved.ok) return resolved;
  const { symbol } = resolved;

  // Price it now (the "POST" fetch). No price = bad symbol, so reject the save.
  const price = await getPrice(symbol, type);
  if (price === null) {
    return {
      ok: false,
      error: `Couldn't fetch a price for "${input}". Double-check the symbol.`,
      fieldErrors: { symbol: "No price found for this symbol" },
    };
  }

  await db.insert(holding).values({
    userId,
    symbol,
    type,
    quantity: String(quantity),
    lastPrice: String(price),
    priceUpdatedAt: new Date(),
  });

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateHolding(
  id: string,
  raw: RawHoldingInput,
): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "Please sign in again." };
  }

  const parsed = holdingSchema.safeParse(raw);
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: firstErrors(fieldErrors),
    };
  }
  const { type, symbol: input, quantity } = parsed.data;

  const resolved = await resolveSymbol(type, input);
  if (!resolved.ok) return resolved;
  const { symbol } = resolved;

  const price = await getPrice(symbol, type);
  if (price === null) {
    return {
      ok: false,
      error: `Couldn't fetch a price for "${input}". Double-check the symbol.`,
      fieldErrors: { symbol: "No price found for this symbol" },
    };
  }

  // Ownership enforced in WHERE: a user can only update their own rows.
  const updated = await db
    .update(holding)
    .set({
      symbol,
      type,
      quantity: String(quantity),
      lastPrice: String(price),
      priceUpdatedAt: new Date(),
    })
    .where(and(eq(holding.id, id), eq(holding.userId, userId)))
    .returning({ id: holding.id });

  if (updated.length === 0) return { ok: false, error: "Holding not found." };

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteHolding(id: string): Promise<ActionResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "Please sign in again." };
  }

  await db
    .delete(holding)
    .where(and(eq(holding.id, id), eq(holding.userId, userId)));

  revalidatePath("/dashboard");
  return { ok: true };
}

/** Re-pull live prices for every holding the user owns (the Refresh button). */
export async function refreshPrices(): Promise<RefreshResult> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "Please sign in again." };
  }

  const rows = await db.select().from(holding).where(eq(holding.userId, userId));
  if (rows.length === 0) return { ok: true, updated: 0, missing: 0 };

  const { prices, missing } = await getPrices(
    rows.map((r) => ({ symbol: r.symbol, type: r.type as AssetType })),
  );

  const now = new Date();
  let updated = 0;
  await Promise.all(
    rows.map(async (r) => {
      const price = prices.get(`${r.type}:${r.symbol}`);
      if (price === undefined) return;
      await db
        .update(holding)
        .set({ lastPrice: String(price), priceUpdatedAt: now })
        .where(and(eq(holding.id, r.id), eq(holding.userId, userId)));
      updated += 1;
    }),
  );

  revalidatePath("/dashboard");
  return { ok: true, updated, missing: missing.length };
}
