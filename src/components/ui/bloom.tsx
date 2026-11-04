import { useEffect, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function FloralMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" className={className} aria-hidden>
      <path d="M20 31c-5-4-7-9-7-13 3 1 6 4 7 8 1-4 4-7 7-8 0 4-2 9-7 13Z" />
      <path d="M20 26c-2-5-2-11 0-16 2 5 2 11 0 16Z" />
      <path d="M13 18c-3-1-6 0-8 2 3 4 9 6 15 6" />
      <path d="M27 18c3-1 6 0 8 2-3 4-9 6-15 6" />
    </svg>
  );
}

export function Sprig({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" className={className} aria-hidden>
      <path d="M20 110C45 80 60 50 95 12" />
      <path d="M40 86c-10-2-18 2-22 8 9 3 17 1 22-8Z" />
      <path d="M52 70c-2-10 2-18 9-22 2 9-1 17-9 22Z" />
      <path d="M62 58c-11 0-18 5-20 12 9 1 16-3 20-12Z" />
      <path d="M74 42c-1-10 4-17 11-20 1 9-3 16-11 20Z" />
      <path d="M82 32c-10-1-17 3-20 10 9 2 16-2 20-10Z" />
      <circle cx="96" cy="11" r="3" />
    </svg>
  );
}

export function BloomCard({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn("bloom-card min-w-0 p-5", className)}>{children}</section>;
}

export function CardHeading({ title, action, icon }: { title: string; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-2">
        {icon && <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blush/70 text-rose">{icon}</span>}
        <h2 className="min-w-0 break-words text-lg font-semibold leading-snug text-plum">{title}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, action, art }: { title: string; subtitle?: string; action?: ReactNode; art?: "planning" | "habits" | "goals" | "journal" | "finance" | "study" | "library" | "wellbeing" }) {
  return (
    <header className={cn("relative mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3", art && "min-h-32 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft sm:min-h-36 sm:p-6")}>
      {art && <img src={`/images/bloom-${art}.webp`} srcSet={`/images/bloom-${art}-400.webp 400w, /images/bloom-${art}.webp 800w`} sizes="(max-width: 639px) 60vw, 45vw" width={800} height={450} alt="" aria-hidden="true" loading="lazy" decoding="async" className="pointer-events-none absolute inset-y-0 right-0 h-full w-3/5 object-cover object-right opacity-25 [mask-image:linear-gradient(to_right,transparent,black_55%)] sm:w-1/2 sm:opacity-55" />}
      <div className="relative min-w-0">
        <h1 className="break-words text-2xl font-semibold text-plum sm:text-3xl md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-md text-sm leading-relaxed text-plum/80">{subtitle}</p>}
      </div>
      {action && <div className="relative shrink-0">{action}</div>}
    </header>
  );
}

const barColors = { rose: "bg-rose", plum: "bg-plum", champagne: "bg-champagne", dusty: "bg-dusty" } as const;
export function ProgressBar({ value, color = "rose", className, label = "Progresso" }: { value: number; color?: keyof typeof barColors; className?: string; label?: string }) {
  return (
    <div className={cn("h-2 w-full overflow-hidden rounded-full bg-blush", className)} role="progressbar" aria-label={label} aria-valuenow={Math.min(100, Math.max(0, value))} aria-valuemin={0} aria-valuemax={100}>
      <div className={cn("h-full rounded-full transition-[width] duration-300", barColors[color])} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 88, label }: { value: number; size?: number; label?: string }) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid shrink-0 place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-blush" strokeWidth="6" fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} className="stroke-rose transition-[stroke-dashoffset] duration-300" strokeWidth="6" fill="none" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * value) / 100} />
      </svg>
      <div className="absolute text-center">
        <div className="font-display text-xl font-semibold text-plum">{Math.round(value)}%</div>
        {label && <div className="text-[10px] text-muted-foreground">{label}</div>}
      </div>
    </div>
  );
}

export function CheckDot({ checked, onClick, label, size = "md" }: { checked: boolean; onClick: () => void; label: string; size?: "sm" | "md" }) {
  const [animate, setAnimate] = useState(false);
  useEffect(() => {
    if (!animate) return;
    const timer = window.setTimeout(() => setAnimate(false), 280);
    return () => window.clearTimeout(timer);
  }, [animate]);
  return (
    <button
      type="button"
      onClick={() => { if (!checked) setAnimate(true); onClick(); }}
      aria-label={label}
      aria-pressed={checked}
      className={cn(
        "grid shrink-0 place-items-center rounded-full border transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-offset-2 pointer-coarse:min-h-11 pointer-coarse:min-w-11",
        size === "sm" ? "h-5 w-5" : "h-8 w-8",
        checked ? "border-primary bg-primary text-primary-foreground" : "border-dusty bg-card hover:border-rose hover:bg-blush",
      )}
    >
      {checked && <Check className={cn(size === "sm" ? "h-3 w-3" : "h-4 w-4", animate && "animate-pop")} strokeWidth={2.5} />}
    </button>
  );
}

export function EmptyState({ message, description, actionLabel, onAction }: { message: string; description?: string; actionLabel?: string; onAction?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-dusty bg-blush/30 px-5 py-8 text-center sm:py-10">
      <div className="grid h-14 w-14 place-items-center rounded-full border border-dusty/50 bg-card/80"><FloralMark className="h-9 w-9 text-rose" /></div>
      <p className="max-w-sm text-balance font-display text-xl leading-snug text-plum">{message}</p>
      {description && <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">{description}</p>}
      {actionLabel && onAction && (
        <Button className="mt-1 max-w-full whitespace-normal" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function DemoBadge() {
  return <span className="rounded-full bg-champagne/20 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-plum/80">exemplo</span>;
}
