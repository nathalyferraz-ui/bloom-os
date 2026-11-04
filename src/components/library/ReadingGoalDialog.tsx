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
import { libraryActions } from "@/hooks/use-bloom-actions";

export function ReadingGoalDialog({
  open,
  onOpenChange,
  year,
  target,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  year: number;
  target: number;
}) {
  const [value, setValue] = useState("");
  useEffect(() => {
    if (open) setValue(target ? String(target) : "12");
  }, [open, target]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sua meta de leitura · {year}</DialogTitle>
          <DialogDescription>Um convite para descobrir histórias, no seu ritmo.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (libraryActions.saveGoal(year, Number(value))) {
              toast.success("Meta de leitura salva");
              onOpenChange(false);
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="reading-target">Livros no ano</Label>
            <Input
              id="reading-target"
              required
              type="number"
              min={1}
              max={10000}
              step={1}
              value={value}
              onChange={(event) => setValue(event.target.value)}
            />
          </div>
          <DialogFooter>
            {target > 0 && (
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  if (libraryActions.removeGoal(year)) {
                    toast("Meta removida");
                    onOpenChange(false);
                  }
                }}
              >
                Remover meta
              </Button>
            )}
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar meta</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
