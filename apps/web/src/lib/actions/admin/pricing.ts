"use server";

import { bundlePricingSchema, fieldErrors, mn } from "@jarvis/core";
import { createServerSupabase } from "@/lib/supabase/server";
import { describeError, fail, requireAdmin, type ActionResult } from "../guard";
import { formObject, revalidateAdmin } from "./shared";

/**
 * The bundle's price, from the console.
 *
 * The one row in `bundle_pricing` (20261005000100) — always an update, never
 * an insert, because the table allows exactly one row and the migration wrote
 * it. Written through the request-scoped client, so the `is_admin()` policy is
 * what lets it through; the `requireAdmin()` above it is the explanation, not
 * the gate (§6.2).
 *
 * Takes effect on the next request everywhere: checkout reads the row when it
 * builds an invoice, and every page that prints the price is `force-dynamic`.
 * An invoice already issued keeps the amount it was issued for.
 */
export async function saveBundlePricing(_prev: unknown, form: FormData): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin.ok) return fail(admin.error);

  const parsed = bundlePricingSchema.safeParse(formObject(form));
  if (!parsed.success) return fail(mn.admin.errors.saveFailed, fieldErrors(parsed.error));

  const supabase = createServerSupabase();
  const { data, error } = await supabase
    .from("bundle_pricing")
    .update(parsed.data)
    .eq("id", true)
    .select("id");

  if (error) return fail(describeError(error));
  // RLS turns a refused update into zero rows rather than an error.
  if (!data?.length) return fail(mn.admin.errors.saveFailed);

  await revalidateAdmin();
  return { ok: true };
}
