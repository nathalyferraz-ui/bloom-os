export type Priority = "baixa" | "media" | "alta";
export type TaskCategory = "Pessoal" | "Trabalho" | "Estudos" | "Autocuidado";
export type Mood = "feliz" | "tranquila" | "motivada" | "cansada" | "triste";
export type GoalStatus = "ativa" | "pausada" | "concluida";

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string | undefined; // HH:mm
  priority: Priority;
  category: TaskCategory;
  done: boolean;
  demo?: boolean | undefined;
}

export interface Habit {
  id: string;
  name: string;
  /** times per week the habit should happen (7 = daily) */
  timesPerWeek: number;
  log: string[]; // dates YYYY-MM-DD completed
  demo?: boolean | undefined;
}

export interface Goal {
  id: string;
  title: string;
  description?: string | undefined;
  category: string;
  targetDate: string;
  progress: number; // 0-100
  status: GoalStatus;
  color: "rose" | "plum" | "champagne" | "dusty";
  demo?: boolean | undefined;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  mood: Mood;
  content: string;
  demo?: boolean | undefined;
}

export interface Profile {
  name: string;
  showFirstNameOnly: boolean;
}

export interface BloomState {
  profile: Profile;
  tasks: Task[];
  habits: Habit[];
  goals: Goal[];
  entries: JournalEntry[];
}
