import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { useBloom } from "@/lib/store";
import { BloomCard, CardHeading, EmptyState, PageHeader } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { TaskDialog, CATEGORIES } from "@/components/tasks/TaskDialog";
import { TaskRow } from "@/components/tasks/TaskRow";
import { fromKey, toKey, todayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Task } from "@/types";

export const Route = createFileRoute("/planejamento")({
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

type Status = "todas" | "pendentes" | "concluidas";
const WEEK = ["D", "S", "T", "Q", "Q", "S", "S"];

function Planning() {
  const data = useBloom();
  const [status, setStatus] = useState<Status>("pendentes");
  const [cat, setCat] = useState<string>("todas");
  const [dialog, setDialog] = useState<{ open: boolean; task?: Task | null; date?: string }>({ open: false });
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [selected, setSelected] = useState(todayKey());

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.tasks
      .filter((t) => (status === "todas" ? true : status === "concluidas" ? t.done : !t.done))
      .filter((t) => cat === "todas" || t.category === cat)
      .sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? "")));
  }, [data, status, cat]);

  if (!data) return null;

  const cells: (Date | null)[] = [];
  for (let i = 0; i < month.getDay(); i++) cells.push(null);
  const dim = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= dim; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
  const countByDay = data.tasks.reduce<Record<string, number>>((m, t) => ((m[t.date] = (m[t.date] ?? 0) + 1), m), {});
  const dayTasks = data.tasks.filter((t) => t.date === selected);
  const edit = (task: Task) => setDialog({ open: true, task });

  const chip = (active: boolean) => cn("rounded-full border px-3 py-1 text-xs transition-colors", active ? "border-rose bg-rose text-primary-foreground" : "border-border bg-card text-plum hover:bg-blush");

  return (
    <>
      <PageHeader title="Planejamento" subtitle="Organize suas tarefas e visualize seu mês." action={<Button onClick={() => setDialog({ open: true })}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova tarefa</span></Button>} />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
        <BloomCard>
          <CardHeading title="Tarefas" />
          <div className="mb-4 flex flex-wrap gap-2">
            {(["pendentes", "concluidas", "todas"] as Status[]).map((s) => (
              <button key={s} className={chip(status === s)} onClick={() => setStatus(s)}>{s === "pendentes" ? "Pendentes" : s === "concluidas" ? "Concluídas" : "Todas"}</button>
            ))}
            <span className="mx-1 w-px bg-border" />
            {["todas", ...CATEGORIES].map((c) => (
              <button key={c} className={chip(cat === c)} onClick={() => setCat(c)}>{c === "todas" ? "Todas categorias" : c}</button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <EmptyState message="Nenhuma tarefa por aqui. Que tal começar com uma nova?" actionLabel="Criar tarefa" onAction={() => setDialog({ open: true })} />
          ) : (
            <ul className="-mx-2 divide-y divide-border/60">{filtered.map((t) => <TaskRow key={t.id} task={t} onEdit={edit} showDate />)}</ul>
          )}
        </BloomCard>

        <div className="space-y-5">
          <BloomCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold capitalize text-plum">{month.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</h2>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" aria-label="Mês anterior" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" aria-label="Próximo mês" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {WEEK.map((w, i) => <span key={i} className="pb-1 text-[11px] text-muted-foreground">{w}</span>)}
              {cells.map((d, i) => {
                if (!d) return <span key={i} />;
                const k = toKey(d);
                const n = countByDay[k] ?? 0;
                return (
                  <button
                    key={k}
                    onClick={() => setSelected(k)}
                    className={cn(
                      "relative flex aspect-square flex-col items-center justify-center rounded-lg text-sm transition-colors",
                      k === selected ? "bg-rose text-primary-foreground" : k === todayKey() ? "bg-blush font-semibold text-rose" : "text-plum hover:bg-blush/60",
                    )}
                  >
                    {d.getDate()}
                    {n > 0 && <span className={cn("absolute bottom-1 h-1 w-1 rounded-full", k === selected ? "bg-primary-foreground" : "bg-rose")} />}
                  </button>
                );
              })}
            </div>
          </BloomCard>
          <BloomCard>
            <CardHeading
              title={fromKey(selected).toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
              action={<Button size="sm" variant="ghost" className="text-rose" onClick={() => setDialog({ open: true, date: selected })}><Plus className="h-4 w-4" /></Button>}
            />
            {dayTasks.length === 0 ? <p className="text-sm text-muted-foreground">Nenhuma tarefa neste dia.</p> : <ul className="-mx-2">{dayTasks.map((t) => <TaskRow key={t.id} task={t} onEdit={edit} />)}</ul>}
          </BloomCard>
        </div>
      </div>
      <TaskDialog open={dialog.open} task={dialog.task} defaultDate={dialog.date} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} />
    </>
  );
}
