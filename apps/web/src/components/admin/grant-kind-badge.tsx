import { Crown, Gift } from "lucide-react";
import type { GrantKind, Strings } from "@jarvis/core";
import { Badge } from "@/components/ui/badge";

/**
 * VIP or Бэлэг, drawn the same way wherever the console names it (20261016000100).
 *
 * The tones are the dashboard's: VIP is the gold of `--viz-3`, Бэлэг the
 * accent's purple of `--viz-1`, so a person's badge here and their slice of
 * «Эрх авсан хэлбэр» read as the same thing. The word is always printed —
 * the colour never carries the kind alone.
 */
export const GRANT_KIND_ICON = { vip: Crown, gift: Gift } as const;

const TONE = { vip: "warn", gift: "accent" } as const;

export function GrantKindBadge({
  kind,
  t,
  className,
}: {
  kind: GrantKind;
  t: Strings;
  className?: string;
}) {
  const Icon = GRANT_KIND_ICON[kind];
  return (
    <Badge tone={TONE[kind]} className={className}>
      <Icon className="size-3" aria-hidden="true" />
      {t.admin.access.kinds[kind]}
    </Badge>
  );
}
