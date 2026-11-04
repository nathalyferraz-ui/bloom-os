import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, CalendarHeart, CheckCircle2, Flower2, Plus, Sun, Target } from "lucide-react";
import { BloomCard, CardHeading, CheckDot, DemoBadge, EmptyState, ProgressBar, ProgressRing, FloralMark } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { TaskDialog } from "@/components/tasks/TaskDialog";
import { TaskRow } from "@/components/tasks/TaskRow";
import { habitActions } from "@/hooks/use-bloom-actions";
import { fmtLong, fmtShort, nextNDays, toKey, todayKey, weekdayShort } from "@/lib/dates";
import { compareTasks } from "@/lib/tasks";
import { cn } from "@/lib/utils";
import type { BloomState, Task } from "@/types";

export function HeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-banner px-6 py-8 shadow-soft sm:px-10 sm:py-10">
      <img
        src="/images/bloom-lilies.webp"
        srcSet="/images/bloom-lilies-320.webp 320w, /images/bloom-lilies.webp 640w"
        sizes="(max-width: 479px) 112px, (max-width: 639px) 144px, (max-width: 1023px) 224px, 256px"
        alt=""
        aria-hidden="true"
        width={640}
        height={679}
        decoding="async"
        fetchPriority="high"
        draggable={false}
        className="pointer-events-none absolute bottom-3 right-1 h-32 w-28 select-none object-contain opacity-30 min-[480px]:h-40 min-[480px]:w-36 sm:bottom-4 sm:right-5 sm:h-[calc(100%-2rem)] sm:w-56 sm:opacity-50 lg:w-64 lg:opacity-60"
      />
      <div className="relative mb-4 flex items-center gap-2">
        <FloralMark className="h-8 w-8 rounded-full bg-cream/60 p-1 text-rose" />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-plum/85">Seu ritmo, seu florescer</span>
      </div>
      <p className="relative max-w-xl text-balance font-display text-2xl italic leading-snug text-plum sm:text-3xl">
        “Pequenos passos também fazem florescer grandes sonhos.”
      </p>
      <div className="relative mt-5 flex items-center gap-3">
        <span className="h-px w-10 shrink-0 bg-champagne" aria-hidden />
        <p className="text-xs text-plum/85">Um passo de cada vez, no seu tempo.</p>
      </div>
    </section>
  );
}

export function MyDayWidget({ data }: { data: BloomState }) {
  const [dialog, setDialog] = useState<{ open: boolean; task?: Task }>({ open: false });
  const today = todayKey();
  const tasks = data.tasks.filter((t) => t.date === today).sort(compareTasks);
  const done = tasks.filter((t) => t.done).length;
  const overdue = data.tasks.filter((task) => !task.done && task.date < today).length;
  return (
    <BloomCard>
      <CardHeading
        title="Meu dia"
        icon={<Sun className="h-4 w-4" />}
        action={tasks.length > 0 && <span className="rounded-full bg-blush px-2.5 py-1 text-xs text-plum">{done}/{tasks.length} concluídas</span>}
      />
      {overdue > 0 && (
        <Link to="/planejamento" search={{ period: "atrasadas" }} className="mb-3 flex items-center justify-between gap-2 rounded-xl border border-dusty/60 bg-blush/50 px-3 py-2 text-xs text-plum hover:bg-blush focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose">
          <span>{overdue} {overdue === 1 ? "tarefa anterior pendente" : "tarefas anteriores pendentes"}</span>
          <ArrowRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
        </Link>
      )}
      {tasks.length === 0 ? (
        <EmptyState message="Seu espaço está pronto para florescer. Que tal começar com sua primeira tarefa?" actionLabel="Adicionar tarefa" onAction={() => setDialog({ open: true })} />
      ) : (
        <>
          <ProgressBar value={(done / tasks.length) * 100} className="mb-3" label="Tarefas de hoje concluídas" />
          {done === tasks.length && <p role="status" className="mb-3 rounded-lg bg-blush/60 px-3 py-2 text-xs text-plum">Tudo concluído por hoje. Reserve um tempo para você.</p>}
          <ul className="-mx-2">{tasks.map((t) => <TaskRow key={t.id} task={t} onEdit={(task) => setDialog({ open: true, task })} />)}</ul>
          <Button variant="ghost" size="sm" className="mt-2 text-primary" onClick={() => setDialog({ open: true })}><Plus className="h-4 w-4" /> Adicionar tarefa</Button>
        </>
      )}
      <Link to="/planejamento" className="mt-3 flex items-center gap-1 border-t border-border/60 pt-3 text-xs text-primary hover:underline">Ver planejamento <ArrowRight className="h-3 w-3" /></Link>
      <TaskDialog open={dialog.open} task={dialog.task} onOpenChange={(open) => setDialog((previous) => ({ ...previous, open }))} />
    </BloomCard>
  );
}

export function HabitsWidget({ data }: { data: BloomState }) {
  const today = todayKey();
  const total = data.habits.length;
  const doneToday = data.habits.filter((h) => h.log.includes(today)).length;
  return (
    <BloomCard>
      <CardHeading title="Meus hábitos" icon={<Flower2 className="h-4 w-4" />} action={<Link to="/habitos" className="text-xs text-primary hover:underline">Ver todos</Link>} />
      {total === 0 ? (
        <>
          <EmptyState message="Crie um hábito para cultivar todos os dias." />
          <Link to="/habitos" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">Criar primeiro hábito <ArrowRight className="h-3 w-3" /></Link>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 min-[380px]:flex-row">
          <ProgressRing value={(doneToday / total) * 100} label="hoje" />
          <ul className="min-w-0 flex-1 space-y-2">
            {data.habits.slice(0, 5).map((h) => (
              <li key={h.id} className="flex items-center gap-2">
                <CheckDot size="sm" checked={h.log.includes(today)} onClick={() => habitActions.toggleDay(h.id, today)} label={`${h.log.includes(today) ? "Desmarcar" : "Marcar"} ${h.name} hoje`} />
                <div className="min-w-0">
                  <span className="block break-words text-sm text-plum" title={h.name}>{h.name}</span>
                  <span className="text-[10px] text-muted-foreground">{h.timesPerWeek === 7 ? "Diário" : `${h.timesPerWeek}x por semana`}</span>
                </div>
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
      <CardHeading title="Metas em andamento" icon={<Target className="h-4 w-4" />} action={<Link to="/metas" className="text-xs text-primary hover:underline">Ver metas</Link>} />
      {goals.length === 0 ? (
        <>
          <EmptyState message="Defina um sonho e acompanhe cada passo." />
          <Link to="/metas" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">{data.goals.length ? "Ver minhas metas" : "Criar primeira meta"} <ArrowRight className="h-3 w-3" /></Link>
        </>
      ) : (
        <ul className="space-y-4">
          {goals.map((g) => (
            <li key={g.id}>
              <div className="mb-1.5 flex justify-between gap-3 text-sm">
                <span className="min-w-0 break-words text-plum">{g.title}</span>
                <span className="shrink-0 tabular-nums text-muted-foreground">{g.progress}%</span>
              </div>
              <ProgressBar value={g.progress} color={g.color} label={`Progresso: ${g.title}`} />
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                <span>Até {fmtShort(g.targetDate)}</span>{g.demo && <DemoBadge />}
              </div>
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
      <CardHeading title="Minha semana" icon={<CalendarHeart className="h-4 w-4" />} action={<Link to="/planejamento" className="flex items-center gap-1 text-xs text-primary hover:underline">Planejar <ArrowRight className="h-3 w-3" /></Link>} />
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((d, i) => {
          const k = toKey(d);
          const ts = data.tasks.filter((t) => t.date === k).sort(compareTasks);
          return (
            <Link key={k} to="/planejamento" search={{ date: k }} aria-label={`${fmtLong(d)}: ${ts.length} ${ts.length === 1 ? "tarefa" : "tarefas"}`} aria-current={i === 0 ? "date" : undefined} className={cn("flex min-w-0 min-h-28 flex-col rounded-xl border p-1.5 transition-colors hover:border-rose focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose sm:p-2", i === 0 ? "border-dusty bg-blush" : "border-border bg-card")}>
              <span className="text-center text-[10px] uppercase tracking-wide text-muted-foreground">{weekdayShort(d)}</span>
              <span className={cn("mx-auto grid h-7 w-full max-w-7 place-items-center rounded-full font-display text-base sm:h-8 sm:max-w-8 sm:text-lg", i === 0 ? "bg-primary text-primary-foreground" : "text-plum")}>{d.getDate()}</span>
              <span className="mt-2 text-center text-[10px] text-muted-foreground sm:hidden">{ts.length > 0 ? ts.length : "—"}</span>
              <div className="mt-1 hidden space-y-1 sm:block">
                {ts.slice(0, 3).map((t) => (
                  <div key={t.id} title={t.title} className={cn("truncate rounded-md px-1 py-0.5 text-[10px]", t.done ? "bg-muted text-muted-foreground line-through" : "bg-dusty/50 text-plum")}>
                    {t.title}
                  </div>
                ))}
                {ts.length > 3 && <div className="text-center text-[10px] text-muted-foreground">+{ts.length - 3}</div>}
              </div>
            </Link>
          );
        })}
      </div>
    </BloomCard>
  );
}

export function SummaryStrip({ data }: { data: BloomState }) {
  const today = todayKey();
  const tasks = data.tasks.filter((task) => task.date === today);
  const habitChecks = data.habits.filter((habit) => habit.log.includes(today)).length;
  const items = [
    { label: "Tarefas concluídas hoje", value: `${tasks.filter((t) => t.done).length}/${tasks.length}`, icon: CheckCircle2 },
    { label: "Hábitos realizados hoje", value: `${habitChecks}/${data.habits.length}`, icon: Flower2 },
    { label: "Metas ativas", value: data.goals.filter((g) => g.status === "ativa").length, icon: Target },
  ];
  return (
    <section className="grid grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card shadow-soft">
      {items.map((i) => (
        <div key={i.label} className="px-3 py-4 text-center sm:px-6">
          <i.icon className="mx-auto mb-2 h-4 w-4 text-rose" strokeWidth={1.6} aria-hidden />
          <p className="font-display text-2xl font-semibold tabular-nums text-plum sm:text-3xl">{i.value}</p>
          <p className="mt-1 text-[11px] text-muted-foreground sm:text-xs">{i.label}</p>
        </div>
      ))}
    </section>
  );
}
