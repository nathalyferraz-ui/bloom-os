import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
import { useBloom } from "@/lib/store";
import { BloomCard, CardHeading, CheckDot, EmptyState, PageHeader } from "@/components/ui/bloom";
import { studyActions } from "@/hooks/use-bloom-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TaskDialog, CATEGORIES } from "@/components/tasks/TaskDialog";
import { TaskRow } from "@/components/tasks/TaskRow";
import { addDays, fromKey, isDateKey, toKey } from "@/lib/dates";
import { compareTasks, filterTasks, TASK_PERIODS, type TaskPeriod, type TaskStatusFilter } from "@/lib/tasks";
import { useLocalNow } from "@/hooks/use-local-now";
import { cn } from "@/lib/utils";
import type { Task, TaskCategory } from "@/types";

export const Route = createFileRoute("/planejamento")({
  validateSearch: (search: Record<string, unknown>): { date?: string; period?: TaskPeriod } => ({
    ...(isDateKey(search["date"]) ? { date: search["date"] } : {}),
    ...(TASK_PERIODS.includes(search["period"] as TaskPeriod) ? { period: search["period"] as TaskPeriod } : {}),
  }),
  head: () => ({
    meta: [
      { title: "Planejamento — Bloom OS" },
      { name: "description", content: "Tarefas e calendário mensal para planejar sua rotina." },
      { property: "og:title", content: "Planejamento — Bloom OS" },
      { property: "og:description", content: "Tarefas e calendário mensal para planejar sua rotina." },
    ],
  }),
  component: Planning,
});

const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];
const PERIOD_LABELS: Record<TaskPeriod, string> = { todas: "Todas as datas", hoje: "Hoje", atrasadas: "Atrasadas", proximas: "Próximos dias" };

function Planning() {
  const { date, period = "todas" } = Route.useSearch();
  const navigate = Route.useNavigate();
  const today = toKey(useLocalNow());
  const data = useBloom();
  const [status, setStatus] = useState<TaskStatusFilter>("pendentes");
  const [cat, setCat] = useState<TaskCategory | "todas">("todas");
  const [query, setQuery] = useState("");
  const [dialog, setDialog] = useState<{ open: boolean; task?: Task | null; date?: string }>({ open: false });
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const calendar = useRef<HTMLDivElement>(null);
  const pendingFocus = useRef<string | null>(null);
  const selected = date ?? today;
  const selectDay = (day: string) => { void navigate({ search: (previous) => ({ ...previous, date: day }), replace: true }); };
  const selectPeriod = (next: TaskPeriod) => { void navigate({ search: (previous) => ({ ...previous, period: next }), replace: true }); };
  const clearFilters = () => { setStatus("todas"); setCat("todas"); setQuery(""); selectPeriod("todas"); };

  useEffect(() => {
    const day = fromKey(selected);
    setMonth(new Date(day.getFullYear(), day.getMonth(), 1));
  }, [selected]);

  useEffect(() => {
    if (!pendingFocus.current) return;
    const button = calendar.current?.querySelector<HTMLButtonElement>(`[data-date="${pendingFocus.current}"]`);
    if (button) { button.focus(); pendingFocus.current = null; }
  }, [selected, month]);

  const moveDay = (event: React.KeyboardEvent<HTMLButtonElement>, key: string) => {
    const day = fromKey(key);
    const delta = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7, Home: -day.getDay(), End: 6 - day.getDay() }[event.key];
    if (delta === undefined) return;
    event.preventDefault();
    const next = toKey(addDays(day, delta));
    pendingFocus.current = next;
    selectDay(next);
  };

  const filtered = useMemo(() => {
    if (!data) return [];
    return filterTasks(data.tasks, { status, category: cat, period, query, today });
  }, [data, status, cat, period, query, today]);

  if (!data) return null;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < month.getDay(); i++) cells.push(null);
  const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= dim; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  const countByDay = data.tasks.reduce<Record<string, number>>((m, t) => ((m[t.date] = (m[t.date] ?? 0) + 1), m), {});
  const studyByDay = data.study.activities.reduce<Record<string, number>>((counts, activity) => { if (activity.dueDate) counts[activity.dueDate] = (counts[activity.dueDate] ?? 0) + 1; return counts; }, {});
  const dayActivities = data.study.activities.filter((activity) => activity.dueDate === selected);
  const dayTasks = data.tasks.filter((t) => t.date === selected).sort(compareTasks);
  const edit = (task: Task) => setDialog({ open: true, task });

  const chip = (active: boolean) => cn("bloom-chip", active ? "border-primary bg-primary text-primary-foreground" : "bg-card text-plum");

  return (
    <>
      <PageHeader art="planning" title="Planejamento" subtitle="Organize suas tarefas e visualize seu mês." action={<Button aria-label="Nova tarefa" onClick={() => setDialog({ open: true })}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova tarefa</span></Button>} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <BloomCard>
          <CardHeading title="Tarefas" action={<span role="status" className="text-xs tabular-nums text-muted-foreground">{filtered.length} de {data.tasks.length}</span>} />
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-rose" aria-hidden />
            <Input type="search" aria-label="Buscar tarefas" placeholder="Buscar uma tarefa…" value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" />
          </div>
          <div role="group" aria-label="Filtrar por período" className="mb-3 flex flex-wrap gap-2">
            {TASK_PERIODS.map((item) => <button key={item} aria-pressed={period === item} className={chip(period === item)} onClick={() => selectPeriod(item)}>{PERIOD_LABELS[item]}</button>)}
          </div>
          <div role="group" aria-label="Filtrar por status" className="mb-3 flex flex-wrap gap-2">
            {(["pendentes", "concluidas", "todas"] as TaskStatusFilter[]).map((s) => (
              <button key={s} aria-pressed={status === s} className={chip(status === s)} onClick={() => setStatus(s)}>{s === "pendentes" ? "Pendentes" : s === "concluidas" ? "Concluídas" : "Todas"}</button>
            ))}
          </div>
          <div role="group" aria-label="Filtrar por categoria" className="mb-4 flex flex-wrap gap-2">
            {(["todas", ...CATEGORIES] as const).map((c) => (
              <button key={c} aria-pressed={cat === c} className={chip(cat === c)} onClick={() => setCat(c)}>{c === "todas" ? "Todas categorias" : c}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            data.tasks.length === 0
              ? <EmptyState message="Um novo começo merece um bom planejamento." description="Adicione sua primeira tarefa e comece a organizar seu dia." actionLabel="Criar primeira tarefa" onAction={() => setDialog({ open: true })} />
              : <EmptyState message="Nenhuma tarefa corresponde aos filtros selecionados." actionLabel="Limpar filtros" onAction={clearFilters} />
          ) : (
            <ul className="-mx-2 divide-y divide-border/60">{filtered.map((t) => <TaskRow key={t.id} task={t} onEdit={edit} showDate />)}</ul>
          )}
        </BloomCard>

        <div className="space-y-5">
          <BloomCard>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-semibold capitalize text-plum">{month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h2>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={() => { selectDay(today); const day = fromKey(today); setMonth(new Date(day.getFullYear(), day.getMonth(), 1)); }}>Hoje</Button>
                <Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" aria-label="Próximo mês" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            <div ref={calendar} role="group" aria-label="Calendário de tarefas. Use as setas para navegar entre os dias." className="grid grid-cols-7 gap-0.5 text-center">
              {WEEK.map((w, i) => <span key={i} className="pb-1 text-[11px] text-muted-foreground">{w}</span>)}
              {cells.map((d, i) => {
                if (!d) return <span key={i} />;
                const k = toKey(d);
                const n = countByDay[k] ?? 0;
                const studyCount = studyByDay[k] ?? 0;
                return (
                  <button
                    key={k}
                    data-date={k}
                    tabIndex={k === (selected.startsWith(toKey(month).slice(0, 7)) ? selected : toKey(month)) ? 0 : -1}
                    onClick={() => selectDay(k)}
                    onKeyDown={(event) => moveDay(event, k)}
                    aria-label={`${d.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" })}: ${n} ${n === 1 ? "tarefa" : "tarefas"}, ${studyCount} atividades de estudo`}
                    aria-pressed={k === selected}
                    aria-current={k === today ? "date" : undefined}
                    className={cn(
                      "relative flex min-h-11 flex-col items-center justify-center rounded-xl text-sm transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose",
                      k === selected ? "bg-primary text-primary-foreground" : k === today ? "bg-blush font-semibold text-plum" : "text-plum hover:bg-blush/60",
                    )}
                  >
                    {d.getDate()}
                    {(n > 0 || studyCount > 0) && <span className={cn("absolute bottom-1 h-1 w-1 rounded-full", k === selected ? "bg-primary-foreground" : "bg-rose")} />}
                  </button>
                );
              })}
            </div>
          </BloomCard>
          <BloomCard>
            <CardHeading
              title={fromKey(selected).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              action={<Button size="sm" variant="ghost" aria-label="Adicionar tarefa neste dia" className="text-primary" onClick={() => setDialog({ open: true, date: selected })}><Plus className="h-4 w-4" /></Button>}
            />
            {dayTasks.length === 0 ? <EmptyState message="Nenhuma tarefa neste dia. Planeje com leveza." actionLabel="Adicionar tarefa" onAction={() => setDialog({ open: true, date: selected })} /> : <ul className="-mx-2">{dayTasks.map((t) => <TaskRow key={t.id} task={t} onEdit={edit} />)}</ul>}
            {dayActivities.length > 0 && <div className="mt-4 border-t border-border pt-4"><h3 className="mb-3 font-display text-lg text-plum">Atividades de estudo</h3><ul className="space-y-3">{dayActivities.map((activity) => <li key={activity.id} className="flex items-start gap-2"><CheckDot checked={activity.done} onClick={() => studyActions.toggleActivity(activity.id)} label={`${activity.done ? "Reabrir" : "Concluir"} atividade: ${activity.title}`} /><div className="min-w-0"><p className="break-words text-sm text-plum">{activity.title}</p><p className="text-xs text-muted-foreground">{activity.kind}</p></div></li>)}</ul><Link to="/estudos" className="mt-3 inline-block text-xs text-primary hover:underline">Abrir estudos</Link></div>}
          </BloomCard>
        </div>
      </div>
      <TaskDialog open={dialog.open} task={dialog.task} defaultDate={dialog.date} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} />
    </>
  );
}
