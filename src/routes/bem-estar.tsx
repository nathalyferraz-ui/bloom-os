import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Heart, Moon, Pencil, Plus, Smile, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";
import { BloomCard, CardHeading, EmptyState, PageHeader } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MetricCard } from "@/components/ui/module";
import { DailyChart } from "@/components/ui/daily-chart";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { CheckinDialog } from "@/components/wellbeing/CheckinDialog";
import { MyFlower } from "@/components/wellbeing/MyFlower";
import { wellbeingActions } from "@/hooks/use-bloom-actions";
import { useLocalNow } from "@/hooks/use-local-now";
import { useBloom } from "@/lib/store";
import { fromKey, toKey } from "@/lib/dates";
import { moodLabel, moodValue, sleepLabel, wellbeingSummary } from "@/lib/wellbeing";

export const Route = createFileRoute("/bem-estar")({
  head: () => ({ meta: [{ title: "Inner Bloom — Bloom OS" }] }),
  component: Wellbeing,
});
function Wellbeing() {
  const data = useBloom();
  const now = useLocalNow();
  const [dialog, setDialog] = useState({ open: false, date: toKey(now) });
  const [historyMonth, setHistoryMonth] = useState("");
  if (!data) return null;
  const wellbeing = data.wellbeing,
    summary = wellbeingSummary(wellbeing, now),
    today = summary.today;
  const history = [...wellbeing.checkins]
    .filter((item) => !historyMonth || item.date.startsWith(historyMonth))
    .sort((a, b) => b.date.localeCompare(a.date));
  const openCheckin = (date = toKey(now)) => setDialog({ open: true, date });
  return (
    <div className="space-y-5">
      <PageHeader
        art="wellbeing"
        title="Inner Bloom"
        subtitle="Um espaço para se acolher e florescer no seu tempo."
        action={
          <Button aria-label="Registrar check-in" onClick={() => openCheckin()}>
            <Plus />
            <span className="hidden sm:inline">{today ? "Editar meu dia" : "Meu check-in"}</span>
          </Button>
        }
      />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <MetricCard
          label="Humor de hoje"
          value={today?.mood ?? "Seu momento"}
          note={today ? "Conforme seu registro." : "Ainda sem check-in hoje."}
          icon={<Smile className="h-4 w-4" />}
        />
        <MetricCard
          label="Sua energia hoje"
          value={today ? `${today.energy}/5` : "—"}
          icon={<Zap className="h-4 w-4" />}
        />
        <MetricCard
          label="Sono registrado hoje"
          value={today ? sleepLabel(today.sleepMinutes) : "—"}
          icon={<Moon className="h-4 w-4" />}
        />
        <MetricCard
          label="Autocuidado nesta semana"
          value={`${summary.selfcareDays} ${summary.selfcareDays === 1 ? "dia" : "dias"}`}
          icon={<Heart className="h-4 w-4" />}
        />
      </div>
      {!wellbeing.checkins.length && (
        <EmptyState
          message="Este é o seu espaço para cuidar de si, no seu ritmo."
          actionLabel="Fazer meu primeiro check-in"
          onAction={() => openCheckin()}
        />
      )}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)]">
        <MyFlower stage={summary.flowerStage} days={summary.selfcareDays} />
        <BloomCard>
          <CardHeading title="Seu humor nesta semana" />
          <p className="mb-3 text-xs text-muted-foreground">
            De segunda a domingo. Dias sem registro ficam em branco. Escala: 1 Triste ? 2 Cansada ?
            3 Neutra ? 4 Bem ? 5 Muito feliz.
          </p>
          <DailyChart
            data={summary.days.map((day) => ({
              ...day,
              value: day.checkin ? moodValue(day.checkin.mood) : null,
            }))}
            label="Humor semanal conforme seus registros"
            max={5}
            axisFormat={String}
            formatValue={moodLabel}
          />
          <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            {summary.days.map((day) => (
              <li key={day.date}>
                {day.label}: {day.checkin?.mood ?? "Sem registro"}
              </li>
            ))}
          </ul>
        </BloomCard>
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <BloomCard>
          <CardHeading title="Energia que você registrou" />
          <DailyChart
            data={summary.days.map((day) => ({ ...day, value: day.checkin?.energy ?? null }))}
            label="Energia semanal, de 1 a 5"
            max={5}
            formatValue={(value) => `${value}/5`}
          />
          <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            {summary.days.map((day) => (
              <li key={day.date}>
                {day.label}: {day.checkin ? `${day.checkin.energy}/5` : "Sem registro"}
              </li>
            ))}
          </ul>
        </BloomCard>
        <BloomCard>
          <CardHeading title="Seu descanso registrado" />
          <DailyChart
            data={summary.days.map((day) => ({ ...day, value: day.checkin?.sleepMinutes ?? null }))}
            label="Sono registrado na semana"
            axisFormat={(value) =>
              `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value / 60)}h`
            }
            formatValue={sleepLabel}
          />
          <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-3">
            {summary.days.map((day) => (
              <li key={day.date}>
                {day.label}: {day.checkin ? sleepLabel(day.checkin.sleepMinutes) : "Sem registro"}
              </li>
            ))}
          </ul>
        </BloomCard>
      </div>
      <BloomCard>
        <CardHeading title="Seus dias, com carinho" />
        <div className="mb-5 flex flex-wrap items-end gap-3">
          <div className="grid min-w-0 flex-1 gap-1.5 sm:max-w-52">
            <Label htmlFor="checkin-history-month">Filtrar por mês</Label>
            <Input
              id="checkin-history-month"
              className="min-w-0"
              type="month"
              value={historyMonth}
              onChange={(event) => setHistoryMonth(event.target.value)}
            />
          </div>
          {historyMonth && (
            <Button variant="ghost" onClick={() => setHistoryMonth("")}>
              Ver todos
            </Button>
          )}
        </div>
        {history.length ? (
          <ul className="space-y-4">
            {history.map((checkin) => (
              <li key={checkin.date} className="rounded-2xl border border-border bg-blush/20 p-4">
                <div className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg text-plum">
                      {fromKey(checkin.date).toLocaleDateString("pt-BR")}
                    </h3>
                    <p className="mt-1 text-sm text-primary">{checkin.mood}</p>
                  </div>
                  <button
                    className="bloom-icon-button"
                    aria-label={`Editar check-in de ${checkin.date}`}
                    onClick={() => openCheckin(checkin.date)}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <ConfirmAction
                    title="Excluir este check-in?"
                    description="Somente o registro desta data será apagado."
                    onConfirm={() => {
                      const removed = wellbeingActions.removeCheckin(checkin.date);
                      if (removed) toast("Check-in excluído");
                      return removed;
                    }}
                  >
                    <button
                      className="bloom-icon-button"
                      aria-label={`Excluir check-in de ${checkin.date}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </ConfirmAction>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Energia: {checkin.energy}/5 · Sono: {sleepLabel(checkin.sleepMinutes)}
                </p>
                {checkin.activities.length > 0 && (
                  <ul className="mt-3 flex flex-wrap gap-2" aria-label="Autocuidado registrado">
                    {checkin.activities.map((activity) => (
                      <li
                        key={activity}
                        className="max-w-full break-words rounded-full bg-blush px-3 py-1 text-xs text-plum"
                      >
                        {activity}
                      </li>
                    ))}
                  </ul>
                )}
                {checkin.reflection && (
                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                    {checkin.reflection}
                  </p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            Seus registros aparecerão aqui. Você pode escolher uma data anterior ao fazer seu
            check-in.
          </p>
        )}
      </BloomCard>
      <p className="px-2 text-xs leading-relaxed text-muted-foreground">
        Estes indicadores mostram somente o que você registrou, sem diagnósticos ou interpretações
        de saúde. Seus registros de bem-estar permanecem neste navegador.
      </p>
      <CheckinDialog
        open={dialog.open}
        initialDate={dialog.date}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
      />
    </div>
  );
}
