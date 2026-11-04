import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, Clock3, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  BloomCard,
  CardHeading,
  CheckDot,
  EmptyState,
  PageHeader,
  ProgressBar,
} from "@/components/ui/bloom";
import { Button } from "@/components/ui/button";
import { MetricCard } from "@/components/ui/module";
import { DailyChart } from "@/components/ui/daily-chart";
import { ConfirmAction } from "@/components/ui/confirm-action";
import { FocusTimer } from "@/components/study/FocusTimer";
import { ActivityDialog, SessionDialog, SubjectDialog } from "@/components/study/StudyDialogs";
import { studyActions } from "@/hooks/use-bloom-actions";
import { useLocalNow } from "@/hooks/use-local-now";
import { useBloom } from "@/lib/store";
import { fmtShort } from "@/lib/dates";
import { formatDuration, studySummary } from "@/lib/study";
import type { StudyActivity, StudySession, StudySubject } from "@/types";

export const Route = createFileRoute("/estudos")({
  head: () => ({
    meta: [
      { title: "Study Garden — Bloom OS" },
      { name: "description", content: "Organize matérias, sessões e atividades de estudo." },
    ],
  }),
  component: Studies,
});
const subjectColors = {
  rose: "bg-rose",
  plum: "bg-plum",
  champagne: "bg-champagne",
  dusty: "bg-dusty",
};
function Studies() {
  const data = useBloom();
  const now = useLocalNow();
  const [subjectDialog, setSubjectDialog] = useState<{ open: boolean; subject?: StudySubject }>({
    open: false,
  });
  const [sessionDialog, setSessionDialog] = useState<{ open: boolean; session?: StudySession }>({
    open: false,
  });
  const [activityDialog, setActivityDialog] = useState<{ open: boolean; activity?: StudyActivity }>(
    { open: false },
  );
  const [showDone, setShowDone] = useState(false);
  if (!data) return null;
  const study = data.study,
    summary = studySummary(study, now);
  const activities = study.activities
    .filter((item) => showDone || !item.done)
    .sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999"));
  const subjectName = (id: string) =>
    study.subjects.find((subject) => subject.id === id)?.name ?? "Matéria";
  return (
    <div className="space-y-5">
      <PageHeader
        art="study"
        title="Study Garden"
        subtitle="Um espaço para cultivar seu aprendizado."
        action={
          <Button aria-label="Nova matéria" onClick={() => setSubjectDialog({ open: true })}>
            <Plus />
            <span className="hidden sm:inline">Nova matéria</span>
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Estudado nesta semana"
          value={formatDuration(summary.totalSeconds)}
          note="De segunda a domingo, pelas sessões registradas."
          icon={<Clock3 className="h-4 w-4" />}
        />
        <MetricCard
          label="Matérias"
          value={study.subjects.length}
          icon={<BookOpen className="h-4 w-4" />}
        />
        <MetricCard
          label="Atividades pendentes"
          value={study.activities.filter((item) => !item.done).length}
        />
        <MetricCard
          label="Meta semanal"
          value={summary.targetSeconds ? formatDuration(summary.targetSeconds) : "A definir"}
          note={
            summary.targetSeconds
              ? `${Math.round(summary.percent)}% da meta semanal realizado.`
              : "Defina a meta de cada matéria para acompanhar seu progresso."
          }
        />
      </div>
      {!study.subjects.length ? (
        <EmptyState
          message="Cada aprendizado é uma nova oportunidade de florescer."
          actionLabel="Criar primeira matéria"
          onAction={() => setSubjectDialog({ open: true })}
        />
      ) : (
        <section aria-labelledby="study-subjects">
          <h2 id="study-subjects" className="mb-4 text-xl font-semibold text-plum">
            Minhas matérias
          </h2>
          <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
            {summary.subjects.map((subject) => (
              <BloomCard key={subject.id}>
                <div className="mb-3 flex items-start gap-2">
                  <span
                    className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${subjectColors[subject.color]}`}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="break-words text-xl text-plum">{subject.name}</h3>
                    <p className="mt-1 break-words text-sm text-muted-foreground">
                      {subject.description}
                    </p>
                  </div>
                  <button
                    className="bloom-icon-button"
                    aria-label={`Editar matéria: ${subject.name}`}
                    onClick={() => setSubjectDialog({ open: true, subject })}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <ConfirmAction
                    title="Excluir esta matéria?"
                    description={`“${subject.name}”, suas sessões, atividades e eventual cronômetro serão apagados.`}
                    onConfirm={() => {
                      const removed = studyActions.removeSubject(subject.id);
                      if (removed) toast("Matéria excluída");
                      return removed;
                    }}
                  >
                    <button
                      className="bloom-icon-button"
                      aria-label={`Excluir matéria: ${subject.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </ConfirmAction>
                </div>
                <p className="mb-2 text-xs text-muted-foreground">
                  {formatDuration(subject.seconds)} nesta semana
                  {subject.weeklyMinutes
                    ? ` · meta de ${formatDuration(subject.weeklyMinutes * 60)}`
                    : " · sem meta definida"}
                </p>
                {subject.weeklyMinutes > 0 && (
                  <ProgressBar
                    value={(subject.seconds / (subject.weeklyMinutes * 60)) * 100}
                    label={`Meta semanal: ${subject.name}`}
                  />
                )}
              </BloomCard>
            ))}
          </div>
        </section>
      )}
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <FocusTimer study={study} />
        <BloomCard>
          <CardHeading title="Sua semana de aprendizado" />
          {summary.targetSeconds > 0 && (
            <div className="mb-4">
              <ProgressBar value={summary.percent} label="Meta geral de estudos" />
              <p className="mt-2 text-xs text-muted-foreground">
                {Math.round(summary.percent)}% da soma das metas das matérias.
              </p>
            </div>
          )}
          <DailyChart
            data={summary.days}
            label="Tempo estudado por dia"
            formatValue={formatDuration}
          />
          <ul className="mt-4 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
            {summary.days.map((day) => (
              <li key={day.date}>
                {day.label}: {formatDuration(day.value)}
              </li>
            ))}
          </ul>
        </BloomCard>
      </div>
      <BloomCard>
        <CardHeading
          title="Próximas atividades"
          action={
            <Button
              size="sm"
              disabled={!study.subjects.length}
              onClick={() => setActivityDialog({ open: true })}
            >
              <Plus />
              Nova atividade
            </Button>
          }
        />
        <button
          className="bloom-chip mb-3"
          aria-pressed={showDone}
          onClick={() => setShowDone((value) => !value)}
        >
          Mostrar concluídas
        </button>
        {!study.subjects.length && (
          <p className="mb-3 text-xs text-muted-foreground">
            Cadastre uma matéria para adicionar atividades.
          </p>
        )}
        {activities.length ? (
          <ul className="divide-y divide-border/60">
            {activities.map((activity) => (
              <li
                key={activity.id}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 py-3 sm:flex"
              >
                <CheckDot
                  checked={activity.done}
                  onClick={() => studyActions.toggleActivity(activity.id)}
                  label={`${activity.done ? "Reabrir" : "Concluir"} atividade: ${activity.title}`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`break-words text-sm ${activity.done ? "text-muted-foreground line-through" : "text-plum"}`}
                  >
                    {activity.title}
                  </p>
                  <p className="mt-1 break-words text-xs text-muted-foreground">
                    {subjectName(activity.subjectId)} · {activity.kind} ·{" "}
                    {activity.dueDate ? fmtShort(activity.dueDate) : "Sem prazo"}
                  </p>
                </div>
                <div className="col-span-2 flex justify-end sm:shrink-0">
                  <button
                    className="bloom-icon-button"
                    aria-label={`Editar atividade: ${activity.title}`}
                    onClick={() => setActivityDialog({ open: true, activity })}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <ConfirmAction
                    title="Excluir esta atividade?"
                    description={activity.title}
                    onConfirm={() => studyActions.removeActivity(activity.id)}
                  >
                    <button
                      className="bloom-icon-button"
                      aria-label={`Excluir atividade: ${activity.title}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </ConfirmAction>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            Nenhuma atividade neste filtro. Seus próximos passos aparecem aqui.
          </p>
        )}
      </BloomCard>
      <BloomCard>
        <CardHeading
          title="Sessões de estudo"
          action={
            <Button
              size="sm"
              disabled={!study.subjects.length}
              onClick={() => setSessionDialog({ open: true })}
            >
              <Plus />
              Registrar sessão
            </Button>
          }
        />
        {study.sessions.length ? (
          <ul className="divide-y divide-border/60">
            {[...study.sessions]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((session) => (
                <li key={session.id} className="flex items-start gap-2 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="break-words text-sm text-plum">
                      {subjectName(session.subjectId)} · {formatDuration(session.durationSeconds)}
                    </p>
                    <p className="mt-1 break-words text-xs text-muted-foreground">
                      {fmtShort(session.date)}
                      {session.notes && ` · ${session.notes}`}
                    </p>
                  </div>
                  <button
                    className="bloom-icon-button"
                    aria-label={`Editar sessão: ${subjectName(session.subjectId)}`}
                    onClick={() => setSessionDialog({ open: true, session })}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <ConfirmAction
                    title="Excluir esta sessão?"
                    description="O tempo desta sessão deixará de contar nos indicadores."
                    onConfirm={() => studyActions.removeSession(session.id)}
                  >
                    <button
                      className="bloom-icon-button"
                      aria-label={`Excluir sessão: ${subjectName(session.subjectId)}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </ConfirmAction>
                </li>
              ))}
          </ul>
        ) : (
          <p className="py-4 text-sm text-muted-foreground">
            Registre uma sessão ou utilize o cronômetro para começar.
          </p>
        )}
      </BloomCard>
      <SubjectDialog
        open={subjectDialog.open}
        subject={subjectDialog.subject}
        onOpenChange={(open) => setSubjectDialog((current) => ({ ...current, open }))}
      />
      <SessionDialog
        open={sessionDialog.open}
        session={sessionDialog.session}
        subjects={study.subjects}
        onOpenChange={(open) => setSessionDialog((current) => ({ ...current, open }))}
      />
      <ActivityDialog
        open={activityDialog.open}
        activity={activityDialog.activity}
        subjects={study.subjects}
        onOpenChange={(open) => setActivityDialog((current) => ({ ...current, open }))}
      />
    </div>
  );
}
