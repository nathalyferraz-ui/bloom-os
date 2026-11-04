import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { libraryActions } from "@/hooks/use-bloom-actions";
import { todayKey } from "@/lib/dates";
import { isCoverUrl } from "@/lib/library";
import { BOOK_STATUSES, BOOK_STATUS_LABELS, type Book, type BookStatus } from "@/types";

const blank = (): Omit<Book, "id"> => ({
  title: "",
  author: "",
  coverUrl: "",
  genre: "",
  totalPages: 1,
  currentPage: 0,
  status: "quero-ler",
  rating: 0,
  notes: "",
  completedDate: "",
});
export function BookDialog({
  open,
  onOpenChange,
  book,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book?: Book | undefined;
}) {
  const [form, setForm] = useState(blank);
  useEffect(() => {
    if (open) setForm(book ?? blank());
  }, [open, book]);
  const field = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((current) => ({ ...current, [key]: value }));
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{book ? "Editar livro e progresso" : "Adicionar livro"}</DialogTitle>
          <DialogDescription>Uma nova história para a sua estante.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!isCoverUrl(form.coverUrl.trim())) {
              toast.error("Use uma URL de capa começando com https:// ou http://.");
              return;
            }
            if (libraryActions.saveBook({ ...form, id: book?.id })) {
              toast.success(book ? "Livro atualizado" : "Livro adicionado à estante");
              onOpenChange(false);
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="book-title">Título</Label>
            <Input
              id="book-title"
              required
              value={form.title}
              onChange={(event) => field("title", event.target.value)}
            />
          </div>
          <div className="grid gap-3 min-[400px]:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="book-author">Autor (opcional)</Label>
              <Input
                id="book-author"
                value={form.author}
                onChange={(event) => field("author", event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="book-genre">Gênero (opcional)</Label>
              <Input
                id="book-genre"
                value={form.genre}
                onChange={(event) => field("genre", event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="book-cover">URL da capa (opcional)</Label>
            <Input
              id="book-cover"
              type="url"
              placeholder="https://"
              value={form.coverUrl}
              onChange={(event) => field("coverUrl", event.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Sem capa, criamos uma composição com o título. A imagem é carregada do endereço
              informado.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="book-pages">Total de páginas</Label>
              <Input
                id="book-pages"
                type="number"
                required
                min={1}
                max={1000000}
                step={1}
                value={form.totalPages}
                onChange={(event) => field("totalPages", Number(event.target.value))}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="book-current">Página atual</Label>
              <Input
                id="book-current"
                type="number"
                required
                min={0}
                max={form.totalPages}
                step={1}
                value={form.currentPage}
                onChange={(event) => {
                  const currentPage = Number(event.target.value);
                  setForm((current) => ({
                    ...current,
                    currentPage,
                    status:
                      currentPage === current.totalPages
                        ? "concluido"
                        : current.status === "concluido"
                          ? "lendo"
                          : current.status,
                  }));
                }}
              />
            </div>
          </div>
          <div className="grid gap-3 min-[400px]:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="book-status">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) => field("status", value as BookStatus)}
              >
                <SelectTrigger id="book-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BOOK_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {BOOK_STATUS_LABELS[status]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="book-rating">Avaliação</Label>
              <Select
                value={String(form.rating)}
                onValueChange={(value) => field("rating", Number(value))}
              >
                <SelectTrigger id="book-rating">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5].map((rating) => (
                    <SelectItem key={rating} value={String(rating)}>
                      {rating ? `${rating} de 5 estrelas` : "Sem avaliação"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {form.status === "concluido" && (
            <div className="grid gap-1.5">
              <Label htmlFor="book-completed">Data de conclusão</Label>
              <Input
                id="book-completed"
                type="date"
                required
                value={form.completedDate || todayKey()}
                onChange={(event) => field("completedDate", event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                A conclusão preenche todas as páginas e conta na meta do ano desta data.
              </p>
            </div>
          )}
          <div className="grid gap-1.5">
            <Label htmlFor="book-notes">Notas pessoais (opcional)</Label>
            <Textarea
              id="book-notes"
              value={form.notes}
              onChange={(event) => field("notes", event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar livro</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
