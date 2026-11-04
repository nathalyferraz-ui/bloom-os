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
import { wellbeingActions } from "@/hooks/use-bloom-actions";
import { getState } from "@/lib/store";
import { todayKey } from "@/lib/dates";
import { CHECKIN_MOODS, SELFCARE_ACTIVITIES, type WellbeingCheckin } from "@/types";

const blank = (date: string): WellbeingCheckin => ({
  date,
  mood: "Neutra",
  energy: 3,
  sleepMinutes: 0,
  activities: [],
  reflection: "",
});
export function CheckinDialog({
  open,
  onOpenChange,
  initialDate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate: string;
}) {
  const [form, setForm] = useState(() => blank(initialDate));
  const [sleep, setSleep] = useState("");
  const [custom, setCustom] = useState("");
  const loadDate = (date: string) => {
    const record = getState().wellbeing.checkins.find((item) => item.date === date);
    setForm(record ?? blank(date));
    setSleep(record ? String(record.sleepMinutes / 60) : "");
    setCustom(
      record?.activities
        .filter((item) => !SELFCARE_ACTIVITIES.some((preset) => preset === item))
        .join(", ") ?? "",
    );
  };
  useEffect(() => {
    if (open) loadDate(initialDate);
  }, [open, initialDate]);
  const existing = open && !!getState().wellbeing.checkins.find((item) => item.date === form.date);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Seu check-in diário</DialogTitle>
          <DialogDescription>Um momento para se escutar, sem certo ou errado.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            const sleepMinutes = Math.round(Number(sleep) * 60);
            if (
              sleep === "" ||
              !Number.isFinite(sleepMinutes) ||
              sleepMinutes < 0 ||
              sleepMinutes > 1440
            ) {
              toast.error("Informe o sono registrado entre 0 e 24 horas.");
              return;
            }
            const activities = [
              ...form.activities.filter((item) =>
                SELFCARE_ACTIVITIES.some((preset) => preset === item),
              ),
              ...custom
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean),
            ];
            if (wellbeingActions.saveCheckin({ ...form, sleepMinutes, activities })) {
              toast.success(existing ? "Check-in atualizado" : "Check-in salvo com carinho");
              onOpenChange(false);
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="checkin-date">Data</Label>
            <Input
              id="checkin-date"
              type="date"
              required
              max={todayKey()}
              value={form.date}
              onChange={(event) => loadDate(event.target.value)}
            />
            {existing && (
              <p className="text-xs text-muted-foreground">
                Você está editando o registro desta data.
              </p>
            )}
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-plum">
              Como você está se sentindo?
            </legend>
            <div className="flex flex-wrap gap-2">
              {CHECKIN_MOODS.map((mood) => (
                <label key={mood} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="checkin-mood"
                    value={mood}
                    checked={form.mood === mood}
                    onChange={() => setForm((current) => ({ ...current, mood }))}
                    className="peer sr-only"
                  />
                  <span className="bloom-chip inline-flex min-h-11 items-center peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2">
                    {mood}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-plum">Sua energia · de 1 a 5</legend>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map((energy) => (
                <label key={energy} className="relative cursor-pointer">
                  <input
                    type="radio"
                    name="checkin-energy"
                    value={energy}
                    checked={form.energy === energy}
                    onChange={() => setForm((current) => ({ ...current, energy }))}
                    className="peer sr-only"
                  />
                  <span className="bloom-chip inline-flex min-h-11 min-w-11 items-center justify-center peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-primary peer-focus-visible:ring-offset-2">
                    {energy}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              1 = pouca energia · 5 = muita energia
            </p>
          </fieldset>
          <div className="grid gap-1.5">
            <Label htmlFor="checkin-sleep">Quantas horas você dormiu?</Label>
            <Input
              id="checkin-sleep"
              required
              type="number"
              min={0}
              max={24}
              step="any"
              inputMode="decimal"
              placeholder="Ex.: 7,5"
              value={sleep}
              onChange={(event) => setSleep(event.target.value)}
            />
          </div>
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-plum">
              Momentos de autocuidado (opcional)
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {SELFCARE_ACTIVITIES.map((activity) => (
                <label
                  key={activity}
                  className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border px-3 py-2 text-sm text-plum"
                >
                  <input
                    type="checkbox"
                    checked={form.activities.includes(activity)}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        activities: event.target.checked
                          ? [...current.activities, activity]
                          : current.activities.filter((item) => item !== activity),
                      }))
                    }
                    className="h-4 w-4 accent-primary"
                  />
                  {activity}
                </label>
              ))}
            </div>
          </fieldset>
          <div className="grid gap-1.5">
            <Label htmlFor="checkin-custom">Outros momentos (opcional)</Label>
            <Input
              id="checkin-custom"
              placeholder="Separe as atividades por vírgula"
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="checkin-reflection">Como foi o seu dia? (opcional)</Label>
            <Textarea
              id="checkin-reflection"
              maxLength={1000}
              value={form.reflection}
              onChange={(event) =>
                setForm((current) => ({ ...current, reflection: event.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground">
              {form.reflection.length}/1000 · Salvo somente neste navegador.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">Salvar check-in</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
