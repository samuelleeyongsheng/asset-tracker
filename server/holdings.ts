"use server";

import { and, eq } from "drizzle-orm";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { db } from "@/db/drizzle";
import { holding } from "@/db/schema";
import { holdingSchema, type RawHoldingInput } from "@/lib/validations/holding";
import { getPrice, getPrices } from "@/lib/prices";
import type { ActionResult, RefreshResult } from "@/types";

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
  const { asset, quantity } = parsed.data;

  // Fetch the live price at the moment the asset is saved (the "POST" fetch).
  const price = await getPrice(asset.symbol, asset.type);

  await db.insert(holding).values({
    userId,
    symbol: asset.symbol,
    type: asset.type,
    quantity: String(quantity),
    lastPrice: price === null ? null : String(price),
    priceUpdatedAt: price === null ? null : new Date(),
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
  const { asset, quantity } = parsed.data;

  const price = await getPrice(asset.symbol, asset.type);

  // Ownership enforced in WHERE: a user can only update their own rows.
  const updated = await db
    .update(holding)
    .set({
      symbol: asset.symbol,
      type: asset.type,
      quantity: String(quantity),
      lastPrice: price === null ? null : String(price),
      priceUpdatedAt: price === null ? null : new Date(),
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
    rows.map((r) => ({ symbol: r.symbol, type: r.type as "crypto" | "stock" })),
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
