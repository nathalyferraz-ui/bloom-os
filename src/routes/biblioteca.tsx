import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Grid2X2, List, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { BloomCard, CardHeading, EmptyState, PageHeader, ProgressBar } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { MetricCard } from "@/components/ui/module";
import { BookCover } from "@/components/library/BookCover";
import { BookDialog } from "@/components/library/BookDialog";
import { ReadingGoalDialog } from "@/components/library/ReadingGoalDialog";
import { libraryActions } from "@/hooks/use-bloom-actions";
import { useLocalNow } from "@/hooks/use-local-now";
import { useBloom } from "@/lib/store";
import { fromKey } from "@/lib/dates";
import { librarySummary } from "@/lib/library";
import { BOOK_STATUSES, BOOK_STATUS_LABELS, type Book } from "@/types";

export const Route = createFileRoute("/biblioteca")({
  head: () => ({ meta: [{ title: "My Little Library — Bloom OS" }] }),
  component: Library,
});
function Library() {
  const data = useBloom();
  const now = useLocalNow();
  const [yearInput, setYearInput] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("todos");
  const [genre, setGenre] = useState("todos");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [editor, setEditor] = useState<{ open: boolean; book?: Book }>({ open: false });
  const [detailId, setDetailId] = useState<string | null>(null);
  const [goalOpen, setGoalOpen] = useState(false);
  const [year, setYear] = useState<number | null>(null);
  if (!data) return null;
  const library = data.library,
    selectedYear = year ?? now.getFullYear(),
    summary = librarySummary(library, selectedYear);
  const genres = [...new Set(library.books.map((book) => book.genre).filter(Boolean))].sort(
    (a, b) => a.localeCompare(b, "pt-BR"),
  );
  const books = library.books.filter(
    (book) =>
      (status === "todos" || book.status === status) &&
      (genre === "todos" || book.genre === genre.slice(6)) &&
      `${book.title} ${book.author}`
        .toLocaleLowerCase("pt-BR")
        .includes(search.toLocaleLowerCase("pt-BR")),
  );
  const detail = library.books.find((book) => book.id === detailId);
  const edit = (book: Book) => {
    setDetailId(null);
    setEditor({ open: true, book });
  };
  return (
    <div className="space-y-5">
      <PageHeader
        art="library"
        title="My Little Library"
        subtitle="Histórias que acompanham o seu florescer."
        action={
          <Button aria-label="Adicionar livro" onClick={() => setEditor({ open: true })}>
            <Plus />
            <span className="hidden sm:inline">Adicionar livro</span>
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-4 2xl:grid-cols-4">
        <MetricCard
          label="Na sua estante"
          value={summary.total}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <MetricCard label="Livros lidos" value={summary.completed} />
        <MetricCard label="Em leitura" value={summary.reading} />
        <MetricCard label="Quero ler" value={summary.wishlist} />
      </div>
      <BloomCard>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-plum">Seu ano em histórias</h2>
          <div className="flex flex-wrap items-center gap-2">
            <Label htmlFor="reading-year">Ano</Label>
            <Input
              id="reading-year"
              type="number"
              min={1000}
              max={9999}
              step={1}
              className="w-24"
              value={yearInput ?? selectedYear}
              onBlur={() => setYearInput(null)}
              onChange={(event) => {
                const value = event.target.value;
                setYearInput(value);
                const next = Number(value);
                if (/^\d{4}$/.test(value) && next >= 1000 && next <= 9999) setYear(next);
              }}
            />
            <Button size="sm" variant="outline" onClick={() => setGoalOpen(true)}>
              {summary.target ? "Editar meta" : "Definir meta"}
            </Button>
          </div>
        </div>
        <p className="mb-3 text-sm text-muted-foreground">
          {summary.finishedThisYear}{" "}
          {summary.finishedThisYear === 1 ? "livro concluído" : "livros concluídos"} em{" "}
          {selectedYear}
          {summary.target
            ? ` · meta de ${summary.target}`
            : ". Escolha uma meta, se fizer sentido para você."}
        </p>
        {summary.target > 0 && (
          <ProgressBar value={summary.percent} label={`Meta de leitura de ${selectedYear}`} />
        )}
      </BloomCard>
      <BloomCard>
        <CardHeading title="Minha estante" />
        <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
          <div className="grid gap-1.5">
            <Label htmlFor="library-search">Buscar título ou autor</Label>
            <Input
              id="library-search"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Encontre uma história…"
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="library-status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="library-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os status</SelectItem>
                {BOOK_STATUSES.map((item) => (
                  <SelectItem key={item} value={item}>
                    {BOOK_STATUS_LABELS[item]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="library-genre">Gênero</Label>
            <Select value={genre} onValueChange={setGenre}>
              <SelectTrigger id="library-genre">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os gêneros</SelectItem>
                {genres.map((item) => (
                  <SelectItem key={item} value={`genre:${item}`}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-1" role="group" aria-label="Visualização da estante">
            <button
              className="bloom-icon-button aria-pressed:bg-blush"
              aria-label="Visualizar em estante"
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <Grid2X2 className="h-4 w-4" />
            </button>
            <button
              className="bloom-icon-button aria-pressed:bg-blush"
              aria-label="Visualizar em lista"
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
        {!library.books.length ? (
          <EmptyState
            message="Uma nova história está esperando por você."
            actionLabel="Adicionar meu primeiro livro"
            onAction={() => setEditor({ open: true })}
          />
        ) : !books.length ? (
          <EmptyState
            message="Nenhuma história neste filtro."
            actionLabel="Limpar filtros"
            onAction={() => {
              setSearch("");
              setStatus("todos");
              setGenre("todos");
            }}
          />
        ) : (
          <ul
            className={
              view === "grid"
                ? "grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
                : "divide-y divide-border/70"
            }
          >
            {books.map((book) => (
              <li key={book.id} className={view === "list" ? "py-3" : "min-w-0"}>
                <button
                  onClick={() => setDetailId(book.id)}
                  aria-label={`Ver detalhes de ${book.title}`}
                  className={
                    view === "grid"
                      ? "group w-full rounded-xl text-left"
                      : "group flex w-full items-center gap-4 rounded-xl text-left"
                  }
                >
                  <BookCover
                    book={book}
                    className={
                      view === "list"
                        ? "w-16 shrink-0 p-2 [&_p]:text-[9px] [&_svg]:hidden"
                        : "motion-safe:transition-transform motion-safe:duration-200 motion-safe:group-hover:-translate-y-0.5"
                    }
                  />
                  <div className={view === "grid" ? "mt-3 min-w-0" : "min-w-0 flex-1"}>
                    <h3 className="break-words font-display text-lg leading-snug text-plum">
                      {book.title}
                    </h3>
                    <p className="mt-1 break-words text-xs text-muted-foreground">
                      {book.author || "Autor não informado"}
                    </p>
                    <p className="my-2 text-xs text-primary">
                      {BOOK_STATUS_LABELS[book.status]} ·{" "}
                      {Math.round((book.currentPage / book.totalPages) * 100)}%
                    </p>
                    <ProgressBar
                      value={(book.currentPage / book.totalPages) * 100}
                      label={`Leitura de ${book.title}`}
                    />
                    {book.rating > 0 && (
                      <p className="mt-2 flex items-center gap-1 text-xs text-plum">
                        <Star className="h-3 w-3 fill-champagne text-plum" />
                        {book.rating}/5
                      </p>
                    )}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </BloomCard>
      <Dialog
        open={!!detail}
        onOpenChange={(open) => {
          if (!open) setDetailId(null);
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>{detail?.title}</DialogTitle>
            <DialogDescription>
              {detail?.author || "Seu livro, suas descobertas."}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <>
              <div className="grid gap-5 min-[400px]:grid-cols-[140px_minmax(0,1fr)]">
                <BookCover book={detail} className="mx-auto max-w-36" />
                <div className="min-w-0 space-y-3 text-sm">
                  <p className="text-primary">{BOOK_STATUS_LABELS[detail.status]}</p>
                  <p className="break-words text-muted-foreground">
                    {detail.genre || "Sem gênero informado"}
                  </p>
                  <p className="text-plum">
                    Página {detail.currentPage} de {detail.totalPages}
                  </p>
                  <ProgressBar
                    value={(detail.currentPage / detail.totalPages) * 100}
                    label="Progresso de leitura"
                  />
                  <p>
                    {detail.rating
                      ? `Avaliação: ${detail.rating} de 5 estrelas`
                      : "Ainda sem avaliação"}
                  </p>
                  {detail.completedDate && (
                    <p className="text-muted-foreground">
                      Concluído em {fromKey(detail.completedDate).toLocaleDateString("pt-BR")}
                    </p>
                  )}
                </div>
              </div>
              <div className="rounded-xl bg-blush/40 p-4">
                <h3 className="mb-2 font-display text-lg text-plum">Entre as páginas</h3>
                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                  {detail.notes || "Suas notas e trechos favoritos podem morar aqui."}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <ConfirmAction
                  title="Excluir este livro?"
                  description={`“${detail.title}”, seu progresso e suas notas serão apagados.`}
                  onConfirm={() => {
                    const removed = libraryActions.removeBook(detail.id);
                    if (removed) {
                      setDetailId(null);
                      toast("Livro excluído");
                    }
                    return removed;
                  }}
                >
                  <Button variant="ghost">
                    <Trash2 />
                    Excluir
                  </Button>
                </ConfirmAction>
                <Button onClick={() => edit(detail)}>
                  <Pencil />
                  Editar e atualizar leitura
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
      <BookDialog
        open={editor.open}
        book={editor.book}
        onOpenChange={(open) => setEditor((current) => ({ ...current, open }))}
      />
      <ReadingGoalDialog
        open={goalOpen}
        onOpenChange={setGoalOpen}
        year={selectedYear}
        target={summary.target}
      />
    </div>
  );
}
