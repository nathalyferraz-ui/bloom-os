import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBloom } from "@/lib/store";
import { BloomCard, DemoBadge, EmptyState, PageHeader, ProgressBar } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { ConfirmAction } from "@/components/ui/confirm-action";
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
const colorNames = { rose: "Rosa antigo", plum: "Vinho", champagne: "Champagne", dusty: "Rosa suave" };
const STATUS: Record<GoalStatus, string> = { ativa: "Ativa", pausada: "Pausada", concluida: "Concluída" };

function Goals() {
  const data = useBloom();
  const [dialog, setDialog] = useState<{ open: boolean; goal?: Goal }>({ open: false });
  if (!data) return null;
  return (
    <>
      <PageHeader art="goals" title="Metas" subtitle="Seus sonhos, um passo de cada vez." action={<Button aria-label="Nova meta" onClick={() => setDialog({ open: true })}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova meta</span></Button>} />
      {data.goals.length === 0 ? (
        <EmptyState message="Grandes conquistas começam com um sonho." actionLabel="Criar minha primeira meta" onAction={() => setDialog({ open: true })} />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {data.goals.map((g) => (
            <BloomCard key={g.id} className="flex flex-col">
              <div className="mb-3 flex items-start justify-between gap-2">
                <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", swatch[g.color])} />
                <div className="min-w-0 flex-1">
                  <h2 className="break-words text-xl font-semibold leading-tight text-plum">{g.title}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">{g.category} · {STATUS[g.status]} {g.demo && <DemoBadge />}</p>
                </div>
                <div className="flex shrink-0">
                  <button aria-label={`Editar meta: ${g.title}`} onClick={() => setDialog({ open: true, goal: g })} className="bloom-icon-button"><Pencil className="h-4 w-4" /></button>
                  <ConfirmAction title="Excluir esta meta?" description={`A meta “${g.title}” e seu progresso serão apagados.`} onConfirm={() => { const removed = goalActions.remove(g.id); if (removed) toast("Meta excluída"); return removed; }}>
                    <button aria-label={`Excluir meta: ${g.title}`} className="bloom-icon-button"><Trash2 className="h-4 w-4" /></button>
                  </ConfirmAction>
                </div>
              </div>
              {g.description && <p className="mb-4 break-words text-sm leading-relaxed text-plum/80">{g.description}</p>}
              <div className="mt-auto">
                <div className="mb-1.5 flex justify-between text-sm"><span className="text-muted-foreground">Progresso</span><span className="font-display text-lg text-plum">{g.progress}%</span></div>
                <ProgressBar value={g.progress} color={g.color} label={`Progresso: ${g.title}`} />
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" /> {fmtShort(g.targetDate)}</span>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" aria-label={`Diminuir progresso: ${g.title}`} disabled={g.progress <= 0} onClick={() => goalActions.setProgress(g.id, Math.max(0, g.progress - 5))}>−5%</Button>
                    <Button size="sm" aria-label={`Aumentar progresso: ${g.title}`} disabled={g.progress >= 100} onClick={() => { if (goalActions.setProgress(g.id, Math.min(100, g.progress + 5)) && g.progress + 5 >= 100) toast.success("Meta concluída. Seu esforço floresceu!"); }}>+5%</Button>
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
    if (!goalActions.save({ ...f, id: goal?.id, title: f.title.trim(), demo: false })) return;
    toast.success(goal ? "Meta atualizada" : "Meta criada");
    onOpenChange(false);
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl text-plum">{goal ? "Editar meta" : "Nova meta"}</DialogTitle>
          <DialogDescription>Defina seu objetivo e acompanhe cada conquista.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="grid gap-4">
          <div className="grid gap-1.5"><Label htmlFor="g-t">Título</Label><Input id="g-t" autoFocus required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></div>
          <div className="grid gap-1.5"><Label htmlFor="g-d">Descrição</Label><Textarea id="g-d" rows={2} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></div>
          <div className="grid gap-3 min-[400px]:grid-cols-2">
            <div className="grid gap-1.5"><Label htmlFor="g-c">Categoria</Label><Input id="g-c" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} /></div>
            <div className="grid gap-1.5"><Label htmlFor="g-dt">Data-alvo</Label><Input id="g-dt" type="date" value={f.targetDate} onChange={(e) => setF({ ...f, targetDate: e.target.value })} required /></div>
          </div>
          <div className="grid gap-2"><Label id="g-progress-label">Progresso: {f.progress}%</Label><Slider aria-labelledby="g-progress-label" value={[f.progress]} max={100} step={5} onValueChange={([v]) => { const progress = v ?? 0; setF({ ...f, progress, status: progress === 100 ? "concluida" : f.status === "concluida" ? "ativa" : f.status }); }} /></div>
          <div className="grid gap-3 min-[400px]:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="g-status">Status</Label>
              <Select value={f.status} onValueChange={(v) => setF({ ...f, status: v as GoalStatus, progress: v === "concluida" ? 100 : f.progress })}>
                <SelectTrigger id="g-status"><SelectValue /></SelectTrigger>
                <SelectContent>{(Object.keys(STATUS) as GoalStatus[]).map((s) => <SelectItem key={s} value={s} disabled={f.progress === 100 && s !== "concluida"}>{STATUS[s]}</SelectItem>)}</SelectContent>
              </Select>
              {f.progress === 100 && <p className="text-xs text-muted-foreground">Reduza o progresso para reabrir a meta.</p>}
            </div>
            <div className="grid gap-1.5">
              <p id="g-colors-label" className="text-sm font-medium">Cor</p>
              <div className="flex flex-wrap items-center gap-1" role="group" aria-labelledby="g-colors-label">
                {COLORS.map((c) => <button type="button" key={c} aria-label={colorNames[c]} aria-pressed={f.color === c} onClick={() => setF({ ...f, color: c })} className="grid h-11 w-11 place-items-center rounded-full"><span className={cn("h-7 w-7 rounded-full ring-offset-2 transition-shadow", swatch[c], f.color === c && "ring-2 ring-plum")} /></button>)}
              </div>
            </div>
          </div>
          <DialogFooter><Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit">Salvar</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
