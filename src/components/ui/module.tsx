import type { ReactNode } from "react";
import { BloomCard } from "@/components/ui/bloom";

export function MetricCard({
  label,
  value,
  note,
  icon,
}: {
  label: string;
  value: ReactNode;
  note?: string;
  icon?: ReactNode;
}) {
  return (
    <BloomCard>
      <div className="mb-3 flex items-center gap-2 text-xs text-muted-foreground">
        {icon && <span className="text-primary">{icon}</span>}
        <span>{label}</span>
      </div>
      <p className="break-words font-display text-2xl font-semibold tabular-nums text-plum sm:text-3xl">
        {value}
      </p>
      {note && <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{note}</p>}
    </BloomCard>
  );
}
