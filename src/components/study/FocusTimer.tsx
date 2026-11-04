import { useEffect, useState } from "react";
import { Pause, Play, Timer } from "lucide-react";
import { toast } from "sonner";
import { BloomCard, CardHeading } from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { studyActions } from "@/hooks/use-bloom-actions";
import { focusElapsed, formatClock } from "@/lib/study";
import type { StudyState } from "@/types";

export function FocusTimer({ study }: { study: StudyState }) {
  const [selected, setSelected] = useState("");
  const [now, setNow] = useState(Date.now());
  const focus = study.focus;
  useEffect(() => {
    setNow(Date.now());
    if (focus?.startedAt == null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [focus?.startedAt]);
  const subjectId =
    focus?.subjectId ??
    (study.subjects.some((subject) => subject.id === selected)
      ? selected
      : (study.subjects[0]?.id ?? ""));
  const elapsed = focusElapsed(focus, now);
  return (
    <BloomCard>
      <CardHeading title="Seu tempo de foco" icon={<Timer className="h-4 w-4" />} />
      <div className="grid gap-2">
        <Label htmlFor="study-focus-subject">Matéria do cronômetro</Label>
        <Select
          value={subjectId}
          onValueChange={setSelected}
          disabled={!!focus || !study.subjects.length}
        >
          <SelectTrigger id="study-focus-subject">
            <SelectValue placeholder="Cadastre uma matéria" />
          </SelectTrigger>
          <SelectContent>
            {study.subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <p
        role="timer"
        aria-label="Tempo de foco decorrido"
        className="my-6 text-center font-display text-4xl tabular-nums text-plum"
      >
        {formatClock(elapsed)}
      </p>
      <div className="flex flex-wrap justify-center gap-2">
        {focus?.startedAt != null ? (
          <Button variant="outline" onClick={() => studyActions.pauseFocus()}>
            <Pause /> Pausar
          </Button>
        ) : (
          <Button disabled={!subjectId} onClick={() => studyActions.startFocus(subjectId)}>
            <Play /> {focus ? "Continuar" : "Iniciar"}
          </Button>
        )}
        <Button
          variant="outline"
          disabled={!focus || elapsed < 1000}
          onClick={() => {
            if (studyActions.finishFocus()) toast.success("Sessão de foco registrada");
          }}
        >
          Finalizar e registrar
        </Button>
      </div>
      {focus && (
        <div className="mt-3 text-center">
          <ConfirmAction
            title="Descartar este cronômetro?"
            description="O tempo ainda não registrado será apagado. As sessões já salvas serão mantidas."
            confirmLabel="Descartar tempo"
            onConfirm={() => studyActions.discardFocus()}
          >
            <Button variant="ghost" size="sm">
              Descartar cronômetro
            </Button>
          </ConfirmAction>
        </div>
      )}
      <p className="mt-4 text-center text-xs leading-relaxed text-muted-foreground">
        O cronômetro acompanha seu tempo mesmo se você trocar de página. Finalize para registrar a
        sessão.
      </p>
    </BloomCard>
  );
}
