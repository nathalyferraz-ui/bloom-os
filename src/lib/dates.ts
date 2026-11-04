export const pad = (n: number) => String(n).padStart(2, "0");
export const toKey = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
export const fromKey = (k: string) => {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
};
export const addDays = (d: Date, n: number) => {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
};
export const todayKey = () => toKey(new Date());
export const lastNDays = (n: number) => Array.from({ length: n }, (_, i) => addDays(new Date(), i - (n - 1)));
export const nextNDays = (n: number) => Array.from({ length: n }, (_, i) => addDays(new Date(), i));

export const fmtLong = (d: Date) =>
  d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
export const fmtShort = (k: string) =>
  fromKey(k).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
export const weekdayShort = (d: Date) =>
  d.toLocaleDateString("pt-BR", { weekday: "short" }).replace(".", "");

export const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
};
export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
