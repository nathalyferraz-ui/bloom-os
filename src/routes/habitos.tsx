import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBloom } from "@/lib/store";
import { BloomCard, CheckDot, DemoBadge, EmptyState, PageHeader, ProgressBar, ProgressRing } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { habitActions } from "@/hooks/use-bloom-actions";
import { useLocalNow } from "@/hooks/use-local-now";
import { useIsMobile } from "@/hooks/use-mobile";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { fmtLong, lastNDays, toKey, weekdayShort } from "@/lib/dates";
import type { Habit } from "@/types";

export const Route = createFileRoute("/habitos")({
  head: () => ({
    meta: [
      { title: "Hábitos — Bloom OS" },
      { name: "description", content: "Acompanhe seus hábitos nos últimos sete dias." },
      { property: "og:title", content: "Hábitos — Bloom OS" },
      { property: "og:description", content: "Acompanhe seus hábitos nos últimos sete dias." },
    ],
  }),
  component: Habits,
});

function Habits() {
  const data = useBloom();
  const compact = useIsMobile(1280);
  useLocalNow();
  const [dialog, setDialog] = useState<{ open: boolean; habit?: Habit }>({ open: false });
  if (!data) return null;
  const days = lastNDays(7);
  const keys = days.map(toKey);
  const weekPct = (h: Habit) => Math.min(100, (h.log.filter((d) => keys.includes(d)).length / h.timesPerWeek) * 100);
  const overall = data.habits.length ? data.habits.reduce((s, h) => s + weekPct(h), 0) / data.habits.length : 0;

  return (
    <>
      <PageHeader art="habits" title="Hábitos" subtitle="Pequenos rituais, grandes transformações." action={<Button aria-label="Novo hábito" onClick={() => setDialog({ open: true })}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo hábito</span></Button>} />
      {data.habits.length === 0 ? (
        <EmptyState message="Todo florescer começa com um pequeno hábito." actionLabel="Adicionar hábito" onAction={() => setDialog({ open: true })} />
      ) : (
        <div className="grid items-start gap-5 2xl:grid-cols-[minmax(0,1fr)_240px]">
          {compact ? <div className="space-y-4 xl:hidden">
            {data.habits.map((habit) => (
              <BloomCard key={habit.id}>
                <div className="mb-4 flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="break-words text-lg font-semibold text-plum">{habit.name}</h2>
                    <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">{habit.timesPerWeek === 7 ? "Diário" : `${habit.timesPerWeek}x por semana`} {habit.demo && <DemoBadge />}</p>
                  </div>
                  <HabitActions habit={habit} onEdit={() => setDialog({ open: true, habit })} />
                </div>
                <div className="grid grid-cols-4 gap-x-2 gap-y-4 min-[480px]:grid-cols-7" role="group" aria-label={`Últimos sete dias: ${habit.name}`}>
                  {days.map((day) => (
                    <div key={toKey(day)} className="flex flex-col items-center gap-2">
                      <span className="text-center text-[11px] text-muted-foreground">{weekdayShort(day)} <span className="font-medium text-plum">{day.getDate()}</span></span>
                      <CheckDot checked={habit.log.includes(toKey(day))} onClick={() => habitActions.toggleDay(habit.id, toKey(day))} label={`${habit.log.includes(toKey(day)) ? "Desmarcar" : "Marcar"} ${habit.name} em ${fmtLong(day)}`} />
                    </div>
                  ))}
                </div>
                <div className="mt-5 border-t border-border/60 pt-4">
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground"><span>Progresso semanal</span><span className="tabular-nums text-plum">{Math.round(weekPct(habit))}%</span></div>
                  <ProgressBar value={weekPct(habit)} label={`Progresso semanal: ${habit.name}`} />
                </div>
              </BloomCard>
            ))}
          </div> : <BloomCard className="hidden xl:block">
            <table className="w-full">
              <caption className="sr-only">Registros dos hábitos nos últimos sete dias e progresso semanal.</caption>
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th scope="col" className="pb-3 text-left font-medium">Hábito</th>
                  {days.map((d) => <th scope="col" key={toKey(d)} className="pb-3 font-medium">{weekdayShort(d)}<div className="font-display text-sm normal-case text-plum">{d.getDate()}</div></th>)}
                  <th scope="col" className="pb-3 text-left font-medium">Semana</th>
                  <th scope="col"><span className="sr-only">Ações</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.habits.map((h) => (
                  <tr key={h.id} className="group">
                    <th scope="row" className="max-w-52 py-3 pr-3 text-left font-normal">
                      <p className="break-words text-sm font-medium text-plum">{h.name}</p>
                      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">{h.timesPerWeek === 7 ? "Diário" : `${h.timesPerWeek}x por semana`} {h.demo && <DemoBadge />}</p>
                    </th>
                    {keys.map((k) => (
                      <td key={k} className="px-1 py-3 text-center">
                        <div className="flex justify-center"><CheckDot checked={h.log.includes(k)} onClick={() => habitActions.toggleDay(h.id, k)} label={`${h.log.includes(k) ? "Desmarcar" : "Marcar"} ${h.name} em ${k}`} /></div>
                      </td>
                    ))}
                    <td className="w-28 py-3 pl-2">
                      <ProgressBar value={weekPct(h)} label={`Progresso semanal: ${h.name}`} />
                      <span className="text-[11px] text-muted-foreground">{Math.round(weekPct(h))}%</span>
                    </td>
                    <td className="py-3 pl-2">
                      <HabitActions habit={h} onEdit={() => setDialog({ open: true, habit: h })} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </BloomCard>}
          <BloomCard className="flex items-center gap-4 2xl:flex-col 2xl:py-8 2xl:text-center">
            <ProgressRing value={overall} size={104} label="da semana" />
            <div className="min-w-0"><h2 className="font-display text-lg text-plum">Progresso semanal</h2>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Baseado na frequência definida para cada hábito.</p></div>
          </BloomCard>
        </div>
      )}
      <HabitDialog open={dialog.open} habit={dialog.habit} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} />
    </>
  );
}

function HabitActions({ habit, onEdit }: { habit: Habit; onEdit: () => void }) {
  return <div className="flex shrink-0">
    <button type="button" aria-label={`Editar hábito: ${habit.name}`} onClick={onEdit} className="bloom-icon-button"><Pencil className="h-4 w-4" /></button>
    <ConfirmAction title="Excluir este hábito?" description={`O hábito “${habit.name}” e seu histórico de realizações serão apagados.`} onConfirm={() => { const removed = habitActions.remove(habit.id); if (removed) toast("Hábito excluído"); return removed; }}>
      <button type="button" aria-label={`Excluir hábito: ${habit.name}`} className="bloom-icon-button"><Trash2 className="h-4 w-4" /></button>
    </ConfirmAction>
  </div>;
}

function HabitDialog({ open, habit, onOpenChange }: { open: boolean; habit?: Habit | undefined; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState("");
  const [freq, setFreq] = useState(7);
  useEffect(() => { if (open) { setName(habit?.name ?? ""); setFreq(habit?.timesPerWeek ?? 7); } }, [open, habit]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Dê um nome para o hábito."); return; }
    if (!habitActions.save({ id: habit?.id, name: name.trim(), timesPerWeek: freq, demo: false })) return;
    toast.success(habit ? "Alterações salvas" : "Hábito cadastrado");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-plum">{habit ? "Editar hábito" : "Novo hábito"}</DialogTitle>
          <DialogDescription>Defina um ritual e quantas vezes quer realizá-lo por semana.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-1.5"><Label htmlFor="h-name">Nome</Label><Input id="h-name" autoFocus required value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Meditar 10 minutos" /></div>
          <div className="grid gap-1.5">
            <p id="h-frequency" className="text-sm font-medium">Frequência semanal</p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-labelledby="h-frequency">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button type="button" key={n} aria-pressed={freq === n} onClick={() => setFreq(n)} className="bloom-chip">{n === 7 ? "Diário" : `${n}x`}</button>
              ))}
            </div>
          </div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
