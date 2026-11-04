import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBloom } from "@/lib/store";
import { BloomCard, DemoBadge, EmptyState, PageHeader, ProgressBar } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { goalActions } from "@/hooks/use-bloom-actions";
import { addDays, fmtShort, toKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { Goal, GoalStatus } from "@/types";

export const Route = createFileRoute("/metas")({
  head: () => ({
    meta: [
      { title: "Metas — Bloom OS" },
      { name: "description", content: "Defina objetivos pessoais e acompanhe seu progresso." },
      { property: "og:title", content: "Metas — Bloom OS" },
      { property: "og:description", content: "Defina objetivos pessoais e acompanhe seu progresso." },
    ],
  }),
  component: Goals,
});

const COLORS: Goal["color"][] = ["rose", "plum", "champagne", "dusty"];
const swatch = { rose: "bg-rose", plum: "bg-plum", champagne: "bg-champagne", dusty: "bg-dusty" };
const STATUS: Record<GoalStatus, string> = { ativa: "Ativa", pausada: "Pausada", concluida: "Concluída" };

function Goals() {
  const data = useBloom();
  const [dialog, setDialog] = useState<{ open: boolean; goal?: Goal }>({ open: false });
  if (!data) return null;
  return (
    <>
      <PageHeader title="Metas" subtitle="Seus sonhos, um passo de cada vez." action={<Button onClick={() => setDialog({ open: true })}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova meta</span></Button>} />
      {data.goals.length === 0 ? (
        <EmptyState message="Qual sonho você quer fazer florescer?" actionLabel="Criar primeira meta" onAction={() => setDialog({ open: true })} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {data.goals.map((g) => (
            <BloomCard key={g.id} className="flex flex-col hover:-translate-y-0.5">
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", swatch[g.color])} />
                <div className="min-w-0 flex-1">
                  <h3 className="text-xl font-semibold leading-tight text-plum">{g.title}</h3>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">{g.category} · {STATUS[g.status]} {g.demo && <DemoBadge />}</p>
                </div>
                <div className="flex shrink-0">
                  <button aria-label="Editar" onClick={() => setDialog({ open: true, goal: g })} className="rounded-md p-1.5 text-rose hover:bg-blush"><Pencil className="h-3.5 w-3.5" /></button>
                  <button aria-label="Excluir" onClick={() => { goalActions.remove(g.id); toast("Meta excluída"); }} className="rounded-md p-1.5 text-rose hover:bg-blush"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
              {g.description && <p className="mb-4 text-sm text-plum/75">{g.description}</p>}
              <div className="mt-auto">
                <div className="mb-1.5 flex justify-between text-sm"><span className="text-muted-foreground">Progresso</span><span className="font-display text-lg text-plum">{g.progress}%</span></div>
                <ProgressBar value={g.progress} color={g.color} />
                <div className="mt-4 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> {fmtShort(g.targetDate)}</span>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" disabled={g.progress <= 0} onClick={() => goalActions.setProgress(g.id, Math.max(0, g.progress - 5))}>−5%</Button>
                    <Button size="sm" disabled={g.progress >= 100} onClick={() => { goalActions.setProgress(g.id, Math.min(100, g.progress + 5)); if (g.progress + 5 >= 100) toast.success("Meta concluída! 🌸"); }}>+5%</Button>
                  </div>
                </div>
              </div>
            </BloomCard>
          ))}
        </div>
      )}
      <GoalDialog open={dialog.open} goal={dialog.goal} onOpenChange={(o) => setDialog((d) => ({ ...d, open: o }))} />
    </>
  );
}

function GoalDialog({ open, goal, onOpenChange }: { open: boolean; goal?: Goal | undefined; onOpenChange: (o: boolean) => void }) {
  const blank = { title: "", description: "", category: "Pessoal", targetDate: toKey(addDays(new Date(), 90)), progress: 0, status: "ativa" as GoalStatus, color: "rose" as Goal["color"] };
  const [f, setF] = useState(blank);
  useEffect(() => { if (open) setF(goal ? { ...blank, ...goal, description: goal.description ?? "" } : blank); }, [open, goal]); // eslint-disable-line react-hooks/exhaustive-deps
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.title.trim()) { toast.error("Dê um título para a meta."); return; }
    goalActions.save({ ...f, id: goal?.id, title: f.title.trim(), demo: false });
    toast.success(goal ? "Meta atualizada" : "Meta criada");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader><DialogTitle className="font-display text-2xl text-plum">{goal ? "Editar meta" : "Nova meta"}</DialogTitle></DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-1.5"><Label htmlFor="g-t">Título</Label><Input id="g-t" autoFocus value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label htmlFor="g-d">Descrição</Label><Textarea id="g-d" rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5"><Label htmlFor="g-c">Categoria</Label><Input id="g-c" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label htmlFor="g-dt">Data-alvo</Label><Input id="g-dt" type="date" value={f.targetDate} onChange={(e) => setF({ ...f, targetDate: e.target.value })} required /></div>
          </div>
          <div className="grid gap-2"><Label>Progresso: {f.progress}%</Label><Slider value={[f.progress]} max={100} step={5} onValueChange={([v]) => setF({ ...f, progress: v ?? 0 })} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label>Status</Label>
              <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v as GoalStatus })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.keys(STATUS) as GoalStatus[]).map((s) => <SelectItem key={s} value={s}>{STATUS[s]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Cor</Label>
              <div className="flex h-9 items-center gap-2">
                {COLORS.map((c) => <button type="button" key={c} aria-label={c} onClick={() => setF({ ...f, color: c })} className={cn("h-7 w-7 rounded-full ring-offset-2 transition", swatch[c], f.color === c && "ring-2 ring-plum")} />)}
              </div>
            </div>
          </div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
