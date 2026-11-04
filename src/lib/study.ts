import { addDays, toKey, weekdayShort } from "@/lib/dates";
import type { FocusState, StudyState } from "@/types";

export function weekDays(anchor = new Date()) {
  const monday = addDays(anchor, -((anchor.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}
export function formatDuration(seconds: number) {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  return hours ? `${hours}h ${minutes}min` : minutes ? `${minutes}min` : `${total}s`;
}
export const focusElapsed = (focus: FocusState | null, now = Date.now()) =>
  focus ? focus.elapsedMs + (focus.startedAt === null ? 0 : Math.max(0, now - focus.startedAt)) : 0;
export const formatClock = (milliseconds: number) => {
  const seconds = Math.floor(milliseconds / 1000);
  return [Math.floor(seconds / 3600), Math.floor(seconds / 60) % 60, seconds % 60]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
};
export function studySummary(study: StudyState, anchor = new Date()) {
  const days = weekDays(anchor);
  const keys = new Set(days.map(toKey));
  const sessions = study.sessions.filter((session) => keys.has(session.date));
  const totalSeconds = sessions.reduce((total, session) => total + session.durationSeconds, 0);
  const targetSeconds = study.subjects.reduce(
    (total, subject) => total + subject.weeklyMinutes * 60,
    0,
  );
  return {
    sessions,
    totalSeconds,
    targetSeconds,
    percent: targetSeconds ? (totalSeconds / targetSeconds) * 100 : 0,
    days: days.map((day) => ({
      date: toKey(day),
      label: weekdayShort(day),
      value: sessions
        .filter((session) => session.date === toKey(day))
        .reduce((total, session) => total + session.durationSeconds, 0),
    })),
    subjects: study.subjects
      .map((subject) => ({
        ...subject,
        seconds: sessions
          .filter((session) => session.subjectId === subject.id)
          .reduce((total, session) => total + session.durationSeconds, 0),
      }))
      .sort((a, b) => b.seconds - a.seconds),
  };
}
