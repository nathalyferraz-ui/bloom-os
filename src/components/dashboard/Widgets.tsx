import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarHeart, Flower2, Plus, Sun, Target } from "lucide-react";
import { BloomCard, CardHeading, CheckDot, EmptyState, ProgressBar, ProgressRing, Sprig, FloralMark } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { TaskRow } from "@/components/tasks/TaskRow";
import { habitActions } from "@/hooks/use-bloom-actions";
import { lastNDays, nextNDays, toKey, todayKey, weekdayShort } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { BloomState } from "@/types";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-banner px-6 py-8 shadow-soft sm:px-10 sm:py-10">
      <Sprig className="pointer-events-none absolute -right-4 -top-6 h-48 w-48 rotate-12 text-rose/40 sm:h-60 sm:w-60" />
      <Sprig className="pointer-events-none absolute -bottom-10 right-40 hidden h-36 w-36 -rotate-45 text-champagne/50 md:block" />
      <FloralMark className="mb-3 h-7 w-7 text-rose" />
      <p className="max-w-xl font-display text-2xl italic leading-snug text-plum sm:text-3xl">
        “Pequenos passos também fazem florescer grandes sonhos.”
      </p>
      <div className="mt-4 h-px w-16 bg-champagne" />
    </section>
  );
}

export function MyDayWidget({ data }: { data: BloomState }) {
  const [open, setOpen] = useState(false);
  const today = todayKey();
  const tasks = data.tasks.filter((t) => t.date === today).sort((a, b) => (a.time ?? "99").localeCompare(b.time ?? "99"));
  const done = tasks.filter((t) => t.done).length;
  return (
    <BloomCard>
      <CardHeading
        title="Meu dia"
        icon={<Sun className="h-4 w-4" />}
        action={tasks.length > 0 && <span className="rounded-full bg-blush px-2.5 py-1 text-xs text-plum">{done}/{tasks.length} concluídas</span>}
      />
      {tasks.length === 0 ? (
        <EmptyState message="Seu espaço está pronto para florescer. Que tal começar com sua primeira tarefa?" actionLabel="Adicionar tarefa" onAction={() => setOpen(true)} />
      ) : (
        <>
          <ProgressBar value={(done / tasks.length) * 100} className="mb-3" />
          <ul className="-mx-2">{tasks.map((t) => <TaskRow key={t.id} task={t} compact />)}</ul>
          <Button variant="ghost" size="sm" className="mt-2 text-rose" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Adicionar tarefa</Button>
        </>
      )}
      <TaskDialog open={open} onOpenChange={setOpen} />
    </BloomCard>
  );
}

export function HabitsWidget({ data }: { data: BloomState }) {
  const today = todayKey();
  const total = data.habits.length;
  const doneToday = data.habits.filter((h) => h.log.includes(today)).length;
  return (
    <BloomCard>
      <CardHeading title="Meus hábitos" icon={<Flower2 className="h-4 w-4" />} action={<Link to="/habitos" className="text-xs text-rose hover:underline">Ver todos</Link>} />
      {total === 0 ? (
        <EmptyState message="Crie um hábito para cultivar todos os dias." />
      ) : (
        <div className="flex items-center gap-4">
          <ProgressRing value={(doneToday / total) * 100} label="hoje" />
          <ul className="min-w-0 flex-1 space-y-2">
            {data.habits.slice(0, 5).map((h) => (
              <li key={h.id} className="flex items-center gap-2">
                <CheckDot size="sm" checked={h.log.includes(today)} onClick={() => habitActions.toggleDay(h.id, today)} label={`Marcar ${h.name} hoje`} />
                <span className="truncate text-sm text-plum">{h.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </BloomCard>
  );
}

export function GoalsWidget({ data }: { data: BloomState }) {
  const goals = data.goals.filter((g) => g.status === "ativa").slice(0, 3);
  return (
    <BloomCard>
      <CardHeading title="Metas em andamento" icon={<Target className="h-4 w-4" />} action={<Link to="/metas" className="text-xs text-rose hover:underline">Ver metas</Link>} />
      {goals.length === 0 ? (
        <EmptyState message="Defina um sonho e acompanhe cada passo." />
      ) : (
        <ul className="space-y-4">
          {goals.map((g) => (
            <li key={g.id}>
              <div className="mb-1.5 flex justify-between gap-3 text-sm">
                <span className="truncate text-plum">{g.title}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{g.progress}%</span>
              </div>
              <ProgressBar value={g.progress} color={g.color} />
            </li>
          ))}
        </ul>
      )}
    </BloomCard>
  );
}

export function WeekWidget({ data }: { data: BloomState }) {
  const days = nextNDays(7);
  return (
    <BloomCard>
      <CardHeading title="Minha semana" icon={<CalendarHeart className="h-4 w-4" />} action={<Link to="/planejamento" className="flex items-center gap-1 text-xs text-rose hover:underline">Planejar <ArrowRight className="h-3 w-3" /></Link>} />
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d, i) => {
          const k = toKey(d);
          const ts = data.tasks.filter((t) => t.date === k);
          return (
            <div key={k} className={cn("flex min-h-28 flex-col rounded-xl border p-1.5 sm:p-2", i === 0 ? "border-dusty bg-blush" : "border-border bg-card")}>
              <span className="text-center text-[10px] uppercase tracking-wide text-muted-foreground">{weekdayShort(d)}</span>
              <span className={cn("text-center font-display text-lg", i === 0 ? "text-rose" : "text-plum")}>{d.getDate()}</span>
              <div className="mt-1 space-y-1">
                {ts.slice(0, 3).map((t) => (
                  <div key={t.id} title={t.title} className={cn("truncate rounded-md px-1 py-0.5 text-[10px]", t.done ? "bg-muted text-muted-foreground line-through" : "bg-dusty/50 text-plum")}>
                    <span className="hidden sm:inline">{t.title}</span>
                    <span className="sm:hidden">•</span>
                  </div>
                ))}
                {ts.length > 3 && <div className="text-center text-[10px] text-muted-foreground">+{ts.length - 3}</div>}
              </div>
            </div>
          );
        })}
      </div>
    </BloomCard>
  );
}

export function SummaryStrip({ data }: { data: BloomState }) {
  const week = new Set(lastNDays(7).map(toKey));
  const habitChecks = data.habits.reduce((n, h) => n + h.log.filter((d) => week.has(d)).length, 0);
  const items = [
    { label: "Tarefas concluídas", value: `${data.tasks.filter((t) => t.done).length}/${data.tasks.length}` },
    { label: "Hábitos realizados (7 dias)", value: habitChecks },
    { label: "Metas ativas", value: data.goals.filter((g) => g.status === "ativa").length },
  ];
  return (
    <section className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card shadow-soft">
      {items.map((i) => (
        <div key={i.label} className="px-3 py-4 text-center sm:px-6">
          <p className="font-display text-2xl font-semibold text-plum sm:text-3xl">{i.value}</p>
          <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{i.label}</p>
        </div>
      ))}
    </section>
  );
}
