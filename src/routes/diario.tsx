import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CloudRain, Coffee, Leaf, Plus, Smile, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useBloom } from "@/lib/store";
import { BloomCard, EmptyState, PageHeader, Sprig } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { entryActions } from "@/hooks/use-bloom-actions";
import { fmtShort, todayKey } from "@/lib/dates";
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

  useEffect(() => {
    if (!data || editing) return;
    const first = [...data.entries].sort((a, b) => b.date.localeCompare(a.date))[0];
    if (first) { setCurrentId(first.id); setDraft(first); setEditing(true); }
  }, [data, editing]);

  if (!data) return null;
  const entries = [...data.entries].sort((a, b) => b.date.localeCompare(a.date));

  const newEntry = () => { setCurrentId(null); setDraft(blank()); setEditing(true); };
  const open = (e: JournalEntry) => { setCurrentId(e.id); setDraft(e); setEditing(true); };
  const save = () => {
    if (!draft.title.trim() && !draft.content.trim()) { toast.error("Escreva algo antes de salvar."); return; }
    const id = entryActions.save({ ...draft, id: currentId ?? undefined, demo: false });
    setCurrentId(id);
    toast.success("Entrada salva");
  };
  const remove = () => {
    if (!currentId) return;
    entryActions.remove(currentId);
    toast("Entrada excluída");
    setCurrentId(null); setDraft(blank()); setEditing(false);
  };

  return (
    <>
      <PageHeader title="Dear Me" subtitle="Um espaço só seu para escrever com calma." action={<Button onClick={newEntry}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Nova entrada</span></Button>} />
      <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
        <BloomCard className="p-3">
          <p className="px-2 pb-2 text-[11px] uppercase tracking-widest text-muted-foreground">Entradas</p>
          {entries.length === 0 ? <p className="px-2 py-3 text-sm text-muted-foreground">Nenhuma entrada ainda.</p> : (
            <ul className="space-y-1">
              {entries.map((e) => {
                const M = MOODS.find((m) => m.value === e.mood)?.icon ?? Smile;
                return (
                  <li key={e.id}>
                    <button onClick={() => open(e)} className={cn("flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors", currentId === e.id ? "bg-blush" : "hover:bg-blush/50")}>
                      <M className="h-4 w-4 shrink-0 text-rose" strokeWidth={1.6} />
                      <span className="min-w-0 flex-1 truncate text-sm text-plum">{e.title || "Sem título"}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{fmtShort(e.date)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </BloomCard>

        {!editing ? (
          <EmptyState message="Que tal registrar como você está se sentindo hoje?" actionLabel="Escrever agora" onAction={newEntry} />
        ) : (
          <section className="relative overflow-hidden rounded-2xl border border-border bg-cream p-5 shadow-soft sm:p-8">
            <Sprig className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 text-dusty" />
            <div className="relative grid gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} className="w-auto bg-card" />
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Humor">
                  {MOODS.map(({ value, label, icon: Icon }) => (
                    <button key={value} role="radio" aria-checked={draft.mood === value} onClick={() => setDraft({ ...draft, mood: value })}
                      className={cn("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors", draft.mood === value ? "border-rose bg-rose text-primary-foreground" : "border-border bg-card text-plum hover:bg-blush")}>
                      <Icon className="h-3.5 w-3.5" strokeWidth={1.6} /> {label}
                    </button>
                  ))}
                </div>
              </div>
              <input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="Título do dia…" aria-label="Título"
                className="border-b border-beige bg-transparent pb-2 font-display text-2xl text-plum outline-none placeholder:text-muted-foreground/60 focus:border-rose sm:text-3xl" />
              <textarea value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} placeholder="Querida eu…" aria-label="Texto"
                rows={12} className="resize-none bg-transparent text-[15px] leading-8 text-plum outline-none placeholder:text-muted-foreground/60" />
              <div className="flex justify-between gap-2">
                {currentId ? <Button variant="ghost" className="text-destructive" onClick={remove}><Trash2 className="h-4 w-4" /> Excluir</Button> : <span />}
                <Button onClick={save}>Salvar entrada</Button>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
}
