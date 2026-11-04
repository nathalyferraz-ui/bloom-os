export const SUBJECT_COLORS = ["rose", "plum", "champagne", "dusty"] as const;
export type SubjectColor = (typeof SUBJECT_COLORS)[number];
export const ACTIVITY_KINDS = [
  "Trabalho",
  "Prova",
  "Revisão",
  "Leitura",
  "Atividade geral",
] as const;
export interface StudySubject {
  id: string;
  name: string;
  description: string;
  color: SubjectColor;
  weeklyMinutes: number;
}
export interface StudySession {
  id: string;
  subjectId: string;
  date: string;
  durationSeconds: number;
  notes: string;
}
export interface StudyActivity {
  id: string;
  subjectId: string;
  title: string;
  kind: (typeof ACTIVITY_KINDS)[number];
  dueDate: string;
  done: boolean;
}
export interface FocusState {
  subjectId: string;
  date: string;
  elapsedMs: number;
  startedAt: number | null;
}
export interface StudyState {
  subjects: StudySubject[];
  sessions: StudySession[];
  activities: StudyActivity[];
  focus: FocusState | null;
}
