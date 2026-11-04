export const CHECKIN_MOODS = ["Muito feliz", "Bem", "Neutra", "Cansada", "Triste"] as const;
export type CheckinMood = (typeof CHECKIN_MOODS)[number];
export const SELFCARE_ACTIVITIES = [
  "Leitura",
  "Caminhada",
  "Descanso",
  "Meditação",
  "Tempo ao ar livre",
  "Algo que me faz bem",
] as const;
export interface WellbeingCheckin {
  date: string;
  mood: CheckinMood;
  energy: number;
  sleepMinutes: number;
  activities: string[];
  reflection: string;
}
export interface WellbeingState {
  checkins: WellbeingCheckin[];
}
