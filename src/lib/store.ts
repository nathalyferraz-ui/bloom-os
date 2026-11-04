import { useSyncExternalStore } from "react";
import type { BloomState } from "@/types";
import { addDays, lastNDays, toKey, uid } from "./dates";

const KEY = "bloom-os:v1";

export function createDemoData(): BloomState {
  const t = (n: number) => toKey(addDays(new Date(), n));
  const past = lastNDays(7).map(toKey);
  return {
    profile: { name: "Nathaly Ferraz", showFirstNameOnly: true },
    tasks: [
      { id: uid(), title: "Planejar a semana", date: t(0), time: "09:00", priority: "alta", category: "Pessoal", done: true, demo: true },
      { id: uid(), title: "Responder e-mails", date: t(0), time: "10:30", priority: "media", category: "Trabalho", done: false, demo: true },
      { id: uid(), title: "Estudar 1h", date: t(0), time: "14:00", priority: "media", category: "Estudos", done: false, demo: true },
      { id: uid(), title: "Rotina de skincare", date: t(0), time: "21:00", priority: "baixa", category: "Autocuidado", done: false, demo: true },
      { id: uid(), title: "Reunião de alinhamento", date: t(1), time: "11:00", priority: "alta", category: "Trabalho", done: false, demo: true },
      { id: uid(), title: "Aula de pilates", date: t(2), time: "07:30", priority: "media", category: "Autocuidado", done: false, demo: true },
      { id: uid(), title: "Revisar capítulo 3", date: t(4), priority: "media", category: "Estudos", done: false, demo: true },
    ],
    habits: [
      { id: uid(), name: "Beber água", timesPerWeek: 7, log: past.slice(1), demo: true },
      { id: uid(), name: "Ler 20 minutos", timesPerWeek: 7, log: [past[2], past[4], past[5]], demo: true },
      { id: uid(), name: "Praticar exercícios", timesPerWeek: 4, log: [past[1], past[3], past[5]], demo: true },
      { id: uid(), name: "Organizar o dia", timesPerWeek: 7, log: [past[3], past[4], past[5], past[6]], demo: true },
      { id: uid(), name: "Fazer skincare", timesPerWeek: 7, log: [past[0], past[2], past[4], past[5]], demo: true },
    ],
    goals: [
      { id: uid(), title: "Minha evolução profissional", description: "Desenvolver novas habilidades e conquistar meus objetivos.", category: "Carreira", targetDate: t(120), progress: 65, status: "ativa", color: "rose", demo: true },
      { id: uid(), title: "Ler 12 livros no ano", description: "Um livro por mês, com calma e prazer.", category: "Pessoal", targetDate: t(200), progress: 40, status: "ativa", color: "champagne", demo: true },
      { id: uid(), title: "Rotina de bem-estar", description: "Movimento, sono e alimentação em equilíbrio.", category: "Saúde", targetDate: t(60), progress: 25, status: "ativa", color: "plum", demo: true },
    ],
    entries: [
      { id: uid(), date: t(-1), title: "Um dia leve", mood: "tranquila", content: "Hoje consegui desacelerar e aproveitar um café com calma. Quero lembrar de fazer isso mais vezes.", demo: true },
    ],
  };
}

function emptyData(name: string): BloomState {
  return { profile: { name, showFirstNameOnly: true }, tasks: [], habits: [], goals: [], entries: [] };
}

let state: BloomState | null = null;
const listeners = new Set<() => void>();

function load(): BloomState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as BloomState;
  } catch {
    /* ignore corrupt data */
  }
  const demo = createDemoData();
  localStorage.setItem(KEY, JSON.stringify(demo));
  return demo;
}

export function getState(): BloomState {
  if (!state) state = load();
  return state;
}

export function setState(updater: (s: BloomState) => BloomState) {
  state = updater(getState());
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}

export const resetDemo = () => setState(() => createDemoData());
export const clearAll = () => setState((s) => emptyData(s.profile.name));

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** Returns null during SSR / before hydration. */
export function useBloom(): BloomState | null {
  return useSyncExternalStore(subscribe, getState, () => null);
}
