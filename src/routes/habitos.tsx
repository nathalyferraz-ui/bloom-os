import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBloom } from "@/lib/store";
import { BloomCard, CheckDot, DemoBadge, EmptyState, PageHeader, ProgressBar, ProgressRing } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { habitActions } from "@/hooks/use-bloom-actions";
import { lastNDays, toKey, weekdayShort } from "@/lib/dates";
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
  const [dialog, setDialog] = useState<{ open: boolean; habit?: Habit }>({ open: false });
  if (!data) return null;
  const days = lastNDays(7);
  const keys = days.map(toKey);
  const weekPct = (h: Habit) => Math.min(100, (h.log.filter((d) => keys.includes(d)).length / h.timesPerWeek) * 100);
  const overall = data.habits.length ? data.habits.reduce((s, h) => s + weekPct(h), 0) / data.habits.length : 0;

  return (
    <>
      <PageHeader title="Hábitos" subtitle="Pequenos rituais, grandes transformações." action={<Button onClick={() => setDialog({ open: true })}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Novo hábito</span></Button>} />
      {data.habits.length === 0 ? (
        <EmptyState message="Seu jardim de hábitos está pronto para ser plantado." actionLabel="Criar primeiro hábito" onAction={() => setDialog({ open: true })} />
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
          <BloomCard className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  <th className="pb-3 text-left font-medium">Hábito</th>
                  {days.map((d) => <th key={toKey(d)} className="pb-3 font-medium">{weekdayShort(d)}<div className="font-display text-sm normal-case text-plum">{d.getDate()}</div></th>)}
                  <th className="pb-3 text-left font-medium">Semana</th>
                  <th />
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {data.habits.map((h) => (
                  <tr key={h.id} className="group">
                    <td className="py-3 pr-3">
                      <p className="text-sm font-medium text-plum">{h.name}</p>
                      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">{h.timesPerWeek === 7 ? "Diário" : `${h.timesPerWeek}x por semana`} {h.demo && <DemoBadge />}</p>
                    </td>
                    {keys.map((k) => (
                      <td key={k} className="px-1 py-3 text-center">
                        <div className="flex justify-center"><CheckDot checked={h.log.includes(k)} onClick={() => habitActions.toggleDay(h.id, k)} label={`${h.name} em ${k}`} /></div>
                      </td>
                    ))}
                    <td className="w-28 py-3 pl-2">
                      <ProgressBar value={weekPct(h)} />
                      <span className="text-[11px] text-muted-foreground">{Math.round(weekPct(h))}%</span>
                    </td>
                    <td className="py-3 pl-2">
                      <div className="flex">
                        <button aria-label="Editar" onClick={() => setDialog({ open: true, habit: h })} className="rounded-md p-1.5 text-rose hover:bg-blush"><Pencil className="h-3.5 w-3.5" /></button>
                        <button aria-label="Excluir" onClick={() => { habitActions.remove(h.id); toast("Hábito excluído"); }} className="rounded-md p-1.5 text-rose hover:bg-blush"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </BloomCard>
          <BloomCard className="flex flex-col items-center justify-center gap-3 text-center">
            <ProgressRing value={overall} size={130} label="da semana" />
            <p className="font-display text-lg text-plum">Progresso semanal</p>
            <p className="text-xs text-muted-foreground">Baseado na frequência definida para cada hábito.</p>
          </BloomCard>
        </div>
      )}
      <HabitDialog open={dialog.open} habit={dialog.habit} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} />
    </>
  );
}

function HabitDialog({ open, habit, onOpenChange }: { open: boolean; habit?: Habit; onOpenChange: (o: boolean) => void }) {
  const [name, setName] = useState("");
  const [freq, setFreq] = useState(7);
  useEffect(() => { if (open) { setName(habit?.name ?? ""); setFreq(habit?.timesPerWeek ?? 7); } }, [open, habit]);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { toast.error("Dê um nome para o hábito."); return; }
    habitActions.save({ id: habit?.id, name: name.trim(), timesPerWeek: freq, demo: false });
    toast.success(habit ? "Hábito atualizado" : "Hábito criado");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-sm">
        <DialogHeader><DialogTitle className="font-display text-2xl text-plum">{habit ? "Editar hábito" : "Novo hábito"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-1.5"><Label htmlFor="h-name">Nome</Label><Input id="h-name" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Meditar 10 minutos" /></div>
          <div className="grid gap-1.5">
            <Label>Frequência semanal</Label>
            <div className="flex flex-wrap gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((n) => (
                <button type="button" key={n} onClick={() => setFreq(n)} className={`h-9 min-w-9 rounded-full border px-2 text-sm transition-colors ${freq === n ? "border-rose bg-rose text-primary-foreground" : "border-border text-plum hover:bg-blush"}`}>{n === 7 ? "Diário" : `${n}x`}</button>
              ))}
            </div>
          </div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
