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
import { studyActions } from "@/hooks/use-bloom-actions";
import { todayKey } from "@/lib/dates";
import { getState } from "@/lib/store";
import {
  ACTIVITY_KINDS,
  SUBJECT_COLORS,
  type StudyActivity,
  type StudySession,
  type StudySubject,
  type SubjectColor,
} from "@/types";

const colors: Record<SubjectColor, string> = {
  rose: "Rosa antigo",
  plum: "Vinho",
  champagne: "Champagne",
  dusty: "Rosa suave",
};
function Footer({ onCancel }: { onCancel: () => void }) {
  return (
    <DialogFooter>
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit">Salvar</Button>
    </DialogFooter>
  );
}
export function SubjectDialog({
  open,
  onOpenChange,
  subject,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subject?: StudySubject | undefined;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [hours, setHours] = useState("0");
  const [color, setColor] = useState<SubjectColor>("rose");
  useEffect(() => {
    if (open) {
      setName(subject?.name ?? "");
      setDescription(subject?.description ?? "");
      setHours(String((subject?.weeklyMinutes ?? 0) / 60));
      setColor(subject?.color ?? "rose");
    }
  }, [open, subject]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subject ? "Editar matéria" : "Nova matéria"}</DialogTitle>
          <DialogDescription>Escolha um tema para cultivar seu aprendizado.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const minutes = Number(hours) * 60;
            if (!Number.isInteger(minutes) || minutes < 0 || minutes > 10080) {
              toast.error("Informe uma meta válida de até 168 horas por semana.");
              return;
            }
            if (
              studyActions.saveSubject({
                id: subject?.id,
                name,
                description,
                color,
                weeklyMinutes: minutes,
              })
            ) {
              toast.success(subject ? "Matéria atualizada" : "Matéria cadastrada");
              onOpenChange(false);
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="s-subject-name">Nome</Label>
            <Input
              id="s-subject-name"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="s-subject-description">Descrição (opcional)</Label>
            <Textarea
              id="s-subject-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div className="grid gap-3 min-[400px]:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="s-subject-hours">Meta semanal (horas)</Label>
              <Input
                id="s-subject-hours"
                type="number"
                min={0}
                max={168}
                step={0.25}
                required
                value={hours}
                onChange={(event) => setHours(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Use zero se ainda não quiser definir uma meta.
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="s-subject-color">Cor</Label>
              <Select value={color} onValueChange={(value) => setColor(value as SubjectColor)}>
                <SelectTrigger id="s-subject-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SUBJECT_COLORS.map((item) => (
                    <SelectItem key={item} value={item}>
                      {colors[item]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Footer onCancel={() => onOpenChange(false)} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function SessionDialog({
  open,
  onOpenChange,
  subjects,
  session,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: StudySubject[];
  session?: StudySession | undefined;
}) {
  const [subjectId, setSubjectId] = useState("");
  const [date, setDate] = useState(todayKey());
  const [minutes, setMinutes] = useState("30");
  const [notes, setNotes] = useState("");
  useEffect(() => {
    if (open) {
      setSubjectId(session?.subjectId ?? getState().study.subjects[0]?.id ?? "");
      setDate(session?.date ?? todayKey());
      setMinutes(session ? (session.durationSeconds / 60).toFixed(2) : "30");
      setNotes(session?.notes ?? "");
    }
  }, [open, session]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{session ? "Editar sessão" : "Registrar sessão"}</DialogTitle>
          <DialogDescription>Registre o tempo que você dedicou ao aprendizado.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const seconds = Math.round(Number(minutes) * 60);
            if (!Number.isFinite(seconds) || seconds < 1) {
              toast.error("Informe uma duração positiva.");
              return;
            }
            if (
              studyActions.saveSession({
                id: session?.id,
                subjectId,
                date,
                durationSeconds: seconds,
                notes,
              })
            ) {
              toast.success("Sessão salva");
              onOpenChange(false);
            }
          }}
        >
          <SubjectSelect
            subjects={subjects}
            value={subjectId}
            onChange={setSubjectId}
            id="s-session-subject"
          />
          <div className="grid gap-3 min-[400px]:grid-cols-2">
            <div className="grid gap-1.5">
              <Label htmlFor="s-session-date">Data</Label>
              <Input
                id="s-session-date"
                type="date"
                required
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="s-session-minutes">Duração (minutos)</Label>
              <Input
                id="s-session-minutes"
                type="number"
                min={0.01}
                step={0.01}
                required
                value={minutes}
                onChange={(event) => setMinutes(event.target.value)}
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="s-session-notes">Observações (opcional)</Label>
            <Textarea
              id="s-session-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
            />
          </div>
          <Footer onCancel={() => onOpenChange(false)} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ActivityDialog({
  open,
  onOpenChange,
  subjects,
  activity,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subjects: StudySubject[];
  activity?: StudyActivity | undefined;
}) {
  const [title, setTitle] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [kind, setKind] = useState<StudyActivity["kind"]>("Atividade geral");
  const [dueDate, setDueDate] = useState("");
  useEffect(() => {
    if (open) {
      setTitle(activity?.title ?? "");
      setSubjectId(activity?.subjectId ?? getState().study.subjects[0]?.id ?? "");
      setKind(activity?.kind ?? "Atividade geral");
      setDueDate(activity?.dueDate ?? "");
    }
  }, [open, activity]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{activity ? "Editar atividade" : "Nova atividade"}</DialogTitle>
          <DialogDescription>Organize trabalhos, provas, revisões e leituras.</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (studyActions.saveActivity({ id: activity?.id, title, subjectId, kind, dueDate })) {
              toast.success("Atividade salva");
              onOpenChange(false);
            }
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="s-activity-title">Título</Label>
            <Input
              id="s-activity-title"
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <SubjectSelect
            subjects={subjects}
            value={subjectId}
            onChange={setSubjectId}
            id="s-activity-subject"
          />
          <div className="grid gap-1.5">
            <Label htmlFor="s-activity-kind">Tipo</Label>
            <Select value={kind} onValueChange={(value) => setKind(value as StudyActivity["kind"])}>
              <SelectTrigger id="s-activity-kind">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_KINDS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="s-activity-date">Prazo (opcional)</Label>
            <Input
              id="s-activity-date"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <Footer onCancel={() => onOpenChange(false)} />
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SubjectSelect({
  subjects,
  value,
  onChange,
  id,
}: {
  subjects: StudySubject[];
  value: string;
  onChange: (value: string) => void;
  id: string;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>Matéria</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Selecione uma matéria" />
        </SelectTrigger>
        <SelectContent>
          {subjects.map((subject) => (
            <SelectItem key={subject.id} value={subject.id}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
