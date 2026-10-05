"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import {
  fmt,
  formatMoney,
  type BundleOffer,
  type BundlePricing,
  type Locale,
  type Strings,
} from "@jarvis/core";
import { saveBundlePricing } from "@/lib/actions/admin";
import { Field, Input } from "@/components/ui/field";
import { buttonClass } from "@/components/ui/button";
import type { ActionResult } from "@/lib/actions/guard";

/**
 * «Багцын үнэ» — the one price, above the courses it buys.
 *
 * On the courses screen rather than a page of its own: the team looks for the
 * price where the products are, and there is one price, not one per row (§1).
 * The line under the title says what checkout charges *right now*, worked out
 * on the server from the saved row — so after a launch's day passes, the team
 * sees the regular price there without having to do the date arithmetic.
 */
export function PricingForm({
  pricing,
  offer,
  locale,
  t,
}: {
  pricing: BundlePricing;
  offer: BundleOffer;
  locale: Locale;
  t: Strings;
}) {
  const copy = t.admin.pricing;
  const [state, submit, pending] = useActionState<ActionResult | null, FormData>(
    saveBundlePricing,
    null,
  );
  const fields = state && !state.ok ? (state.fields ?? {}) : {};

  return (
    <form action={submit} className="panel space-y-5 p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-display text-[17px]">{copy.title}</h2>
          <p className="text-ink-3 mt-1 text-[13px]">{copy.note}</p>
        </div>
        <p className="text-ink-3 text-[13px]">
          {copy.now}:{" "}
          <span className="font-display tabular text-ink text-[15px]">
            {formatMoney(offer.price, locale)}
          </span>
          {offer.until ? ` · ${fmt(t.learn.bundle.launch, { date: offer.until })}` : null}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label={copy.price}
          hint={copy.priceHint}
          htmlFor="price_mnt"
          error={fields.price_mnt}
        >
          <Input
            id="price_mnt"
            name="price_mnt"
            inputMode="numeric"
            required
            defaultValue={pricing.priceMnt}
            aria-describedby={fields.price_mnt ? "price_mnt-error" : undefined}
          />
        </Field>
        <Field label={copy.launchPrice} htmlFor="launch_price_mnt" error={fields.launch_price_mnt}>
          <Input
            id="launch_price_mnt"
            name="launch_price_mnt"
            inputMode="numeric"
            defaultValue={pricing.launchPriceMnt ?? ""}
            aria-describedby={fields.launch_price_mnt ? "launch_price_mnt-error" : undefined}
          />
        </Field>
        <Field label={copy.launchLastDay} htmlFor="launch_last_day" error={fields.launch_last_day}>
          <Input
            id="launch_last_day"
            name="launch_last_day"
            type="date"
            defaultValue={pricing.launchLastDay ?? ""}
            aria-describedby={fields.launch_last_day ? "launch_last_day-error" : undefined}
          />
        </Field>
      </div>

      <p className="text-ink-3 text-xs">{copy.launchHint}</p>

      {state && !state.ok && !Object.keys(fields).length ? (
        <p className="border-bad/30 bg-bad-soft text-bad rounded-md border px-3 py-2 text-sm">
          {state.error}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className={buttonClass("primary", "md")}>
          {pending ? <Loader2 className="size-4 animate-spin" /> : null}
          {pending ? t.actions.saving : t.actions.save}
        </button>
        {state?.ok ? <p className="text-ok text-xs">{copy.saved}</p> : null}
      </div>
    </form>
  );
}
