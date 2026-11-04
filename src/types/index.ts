export type Priority = "baixa" | "media" | "alta";
export type TaskCategory = "Pessoal" | "Trabalho" | "Estudos" | "Autocuidado";
export type Mood = "feliz" | "tranquila" | "motivada" | "cansada" | "triste";
export type GoalStatus = "ativa" | "pausada" | "concluida";

export interface Task {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  priority: Priority;
  category: TaskCategory;
  done: boolean;
  demo?: boolean;
}

export interface Habit {
  id: string;
  name: string;
  /** times per week the habit should happen (7 = daily) */
  timesPerWeek: number;
  log: string[]; // dates YYYY-MM-DD completed
  demo?: boolean;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  category: string;
  targetDate: string;
  progress: number; // 0-100
  status: GoalStatus;
  color: "rose" | "plum" | "champagne" | "dusty";
  demo?: boolean;
}

export interface JournalEntry {
  id: string;
  date: string;
  title: string;
  mood: Mood;
  content: string;
  demo?: boolean;
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
