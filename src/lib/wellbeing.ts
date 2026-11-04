import { toKey, weekdayShort } from "./dates";
import { weekDays } from "./study";
import { CHECKIN_MOODS, type WellbeingState } from "@/types";

export function wellbeingSummary(wellbeing: WellbeingState, now = new Date()) {
  const days = weekDays(now).map((day) => {
    const date = toKey(day);
    return {
      date,
      label: weekdayShort(day),
      checkin: wellbeing.checkins.find((item) => item.date === date),
    };
  });
  const selfcareDays = days.filter(
    (day) => day.checkin && day.checkin.activities.length > 0,
  ).length;
  return {
    days,
    today: wellbeing.checkins.find((item) => item.date === toKey(now)),
    latest: [...wellbeing.checkins].sort((a, b) => b.date.localeCompare(a.date))[0],
    selfcareDays,
    flowerStage:
      selfcareDays >= 5
        ? ("open" as const)
        : selfcareDays >= 2
          ? ("opening" as const)
          : ("bud" as const),
  };
}
export const moodValue = (mood: (typeof CHECKIN_MOODS)[number]) =>
  CHECKIN_MOODS.length - CHECKIN_MOODS.indexOf(mood);
export const moodLabel = (value: number) => CHECKIN_MOODS[CHECKIN_MOODS.length - value] ?? "";
export const sleepLabel = (minutes: number) =>
  `${Math.floor(minutes / 60)}h${minutes % 60 ? ` ${minutes % 60}min` : ""}`;
