import { useCallback, useEffect, useState } from "react";
import { createFileRoute, useBlocker } from "@tanstack/react-router";
import { CloudRain, Coffee, Leaf, Plus, Smile, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBloom } from "@/lib/store";
import { BloomCard, DemoBadge, EmptyState, PageHeader, Sprig } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { entryActions } from "@/hooks/use-bloom-actions";
import { fmtShort, isDateKey, todayKey } from "@/lib/dates";
import { cn } from "@/lib/utils";
import type { JournalEntry, Mood } from "@/types";

export const Route = createFileRoute("/diario")({
  head: () => ({
    meta: [
      { title: "Diário — Dear Me · Bloom OS" },
      { name: "description", content: "Seu diário pessoal para registrar pensamentos e humor." },
      { property: "og:title", content: "Diário — Dear Me · Bloom OS" },
      { property: "og:description", content: "Seu diário pessoal para registrar pensamentos e humor." },
    ],
  }),
  component: Journal,
});

export const MOODS: { value: Mood; label: string; icon: typeof Smile }[] = [
  { value: "feliz", label: "Feliz", icon: Smile },
  { value: "tranquila", label: "Tranquila", icon: Leaf },
  { value: "motivada", label: "Motivada", icon: Sparkles },
  { value: "cansada", label: "Cansada", icon: Coffee },
  { value: "triste", label: "Triste", icon: CloudRain },
];

const blank = (): Omit<JournalEntry, "id"> => ({ date: todayKey(), title: "", mood: "tranquila", content: "" });

function Journal() {
  const data = useBloom();
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [draft, setDraft] = useState(blank());
  const [editing, setEditing] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const saved = data?.entries.find((entry) => entry.id === currentId);
  const dirty = editing && (draft.title !== (saved?.title ?? "") || draft.content !== (saved?.content ?? "")
    || draft.date !== (saved?.date ?? todayKey()) || draft.mood !== (saved?.mood ?? "tranquila"));

  const shouldBlock = useCallback(() => dirty, [dirty]);
  const blocker = useBlocker({ shouldBlockFn: shouldBlock, withResolver: true, enableBeforeUnload: dirty });

  useEffect(() => {
    if (!data || editing) return;
    const first = [...data.entries].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (first) { setCurrentId(first.id); setDraft(first); setEditing(true); }
  }, [data, editing]);

  if (!data) return null;
  const entries = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));

  const switchEntry = (action: () => void) => {
    if (dirty) setPendingAction(() => action);
    else action();
  };
  const newEntry = () => switchEntry(() => { setCurrentId(null); setDraft(blank()); setEditing(true); });
  const open = (e: JournalEntry) => {
    if (e.id === currentId) return;
    switchEntry(() => { setCurrentId(e.id); setDraft(e); setEditing(true); });
  };
  const save = () => {
    if (!draft.title.trim() && !draft.content.trim()) { toast.error("Escreva algo antes de salvar."); return; }
    if (!isDateKey(draft.date)) { toast.error("Escolha uma data válida para a entrada."); return; }
    const nextDraft = { ...draft, title: draft.title.trim(), demo: false };
    const id = entryActions.save({ ...nextDraft, id: currentId ?? undefined });
    if (!id) return;
    setDraft(nextDraft);
    setCurrentId(id);
    toast.success("Entrada do diário salva");
  };
  const remove = () => {
    if (!currentId) return false;
    if (!entryActions.remove(currentId)) return false;
    toast("Entrada excluída");
    setCurrentId(null); setDraft(blank()); setEditing(false);
    return true;
  };

  return (
    <>
      <PageHeader art="journal" title="Dear Me" subtitle="Um espaço só seu para escrever com calma." action={<Button aria-label="Nova entrada" onClick={newEntry}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova entrada</span></Button>} />
      <div className="grid items-start gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <BloomCard className="p-3">
          <h2 className="px-2 pb-2 font-sans text-[11px] uppercase tracking-widest text-muted-foreground">Entradas</h2>
          {entries.length === 0 ? <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma entrada ainda.</p> : (
            <ul className="max-h-48 space-y-1 overflow-y-auto overscroll-contain xl:max-h-[60dvh]">
              {entries.map((e) => {
                const M = MOODS.find((m) => m.value === e.mood)?.icon ?? Smile;
                return (
                  <li key={e.id}>
                    <button aria-current={currentId === e.id ? "true" : undefined} onClick={() => open(e)} className={cn("flex min-h-11 w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors duration-200", currentId === e.id ? "bg-blush" : "hover:bg-blush/50")}>
                      <M className="h-4 w-4 shrink-0 text-rose" strokeWidth={1.6} />
                      <span className="min-w-0 flex-1 truncate text-sm text-plum">{e.title || "Sem título"}</span>
                      {e.demo && <DemoBadge />}
                      <span className="shrink-0 text-[11px] text-muted-foreground">{fmtShort(e.date)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </BloomCard>

        {!editing ? (
          <EmptyState message="Este é o seu espaço para guardar pensamentos e momentos." actionLabel="Escrever no meu diário" onAction={newEntry} />
        ) : (
          <section className="relative overflow-hidden rounded-2xl border border-border bg-cream p-5 shadow-soft sm:p-8">
            <h2 className="sr-only">Registro pessoal</h2>
            <Sprig className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-dusty" />
            <div className="relative grid gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="grid gap-1.5"><Label htmlFor="j-date" className="text-xs text-muted-foreground">Data da entrada</Label><Input id="j-date" type="date" required value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="w-auto bg-card" /></div>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Humor">
                  {MOODS.map(({ value, label, icon: Icon }) => (
                    <button key={value} aria-pressed={draft.mood === value} onClick={() => setDraft({ ...draft, mood: value })}
                      className="bloom-chip bg-card">
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.6} /> {label}
                    </button>
                  ))}
                </div>
              </div>
              <Label htmlFor="j-title" className="text-xs text-muted-foreground">Título</Label>
              <input id="j-title" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Título do dia…"
                className="min-w-0 border-b border-beige bg-transparent pb-2 font-display text-2xl text-plum outline-none placeholder:text-muted-foreground/60 focus:border-rose sm:text-3xl" />
              <Label htmlFor="j-content" className="sr-only">Texto</Label>
              <textarea id="j-content" value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} placeholder="Querida eu…"
                rows={12} className="min-w-0 resize-y rounded-xl bg-transparent text-base leading-8 text-plum outline-none placeholder:text-muted-foreground/75 focus-visible:ring-2 focus-visible:ring-ring" />
              <p role="status" className="text-xs text-muted-foreground">{dirty ? "Você tem alterações para salvar." : currentId ? "Entrada salva neste navegador." : "Escreva e salve seu momento."}</p>
              <div className="flex flex-wrap items-center justify-between gap-2">
                {currentId ? <ConfirmAction title="Excluir esta entrada?" description="Este registro será apagado do seu diário. Esta ação não pode ser desfeita." onConfirm={remove}><Button variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /> Excluir</Button></ConfirmAction> : <span />}
                <Button onClick={save}>Salvar entrada</Button>
              </div>
            </div>
          </section>
        )}
      </div>
      <AlertDialog open={pendingAction !== null || blocker.status === "blocked"} onOpenChange={(open) => { if (!open) { setPendingAction(null); if (blocker.status === "blocked") blocker.reset(); } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Descartar alterações?</AlertDialogTitle>
            <AlertDialogDescription>Esta entrada tem alterações que ainda não foram salvas. Volte para salvar ou continue sem elas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continuar escrevendo</AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (blocker.status === "blocked") blocker.proceed(); else pendingAction?.(); setPendingAction(null); }}>Descartar e continuar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
