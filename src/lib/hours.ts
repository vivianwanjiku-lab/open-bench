import type { DayHours, Weekday, WeekHours } from "@/types";
import { WEEKDAYS } from "@/types";

export const DAY_NAME: Record<Weekday, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const WEEKDAY_FROM_SHORT: Record<string, Weekday> = {
  Sun: "sun",
  Mon: "mon",
  Tue: "tue",
  Wed: "wed",
  Thu: "thu",
  Fri: "fri",
  Sat: "sat",
};

export function closedDay(): DayHours {
  return { closed: true, open: null, close: null };
}

export function openDay(open: string, close: string): DayHours {
  return { closed: false, open, close };
}

export function weekly(
  weekdays: [string, string] | "closed",
  saturday: [string, string] | "closed" = weekdays,
  sunday: [string, string] | "closed" = saturday,
): WeekHours {
  const toDay = (value: [string, string] | "closed"): DayHours =>
    value === "closed" ? closedDay() : openDay(value[0], value[1]);
  return {
    twentyFourHours: false,
    days: {
      mon: toDay(weekdays),
      tue: toDay(weekdays),
      wed: toDay(weekdays),
      thu: toDay(weekdays),
      fri: toDay(weekdays),
      sat: toDay(saturday),
      sun: toDay(sunday),
    },
  };
}

export function alwaysOpen(): WeekHours {
  return {
    twentyFourHours: true,
    days: {
      mon: closedDay(),
      tue: closedDay(),
      wed: closedDay(),
      thu: closedDay(),
      fri: closedDay(),
      sat: closedDay(),
      sun: closedDay(),
    },
  };
}

export function customWeek(days: Record<Weekday, DayHours>): WeekHours {
  return { twentyFourHours: false, days };
}

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function toMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})(?::\d{2})?$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function formatClock(hhmm: string): string {
  const minutes = toMinutes(hhmm);
  if (minutes === null) return hhmm;
  const date = new Date(Date.UTC(2026, 0, 1, Math.floor(minutes / 60), minutes % 60));
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(date);
}

export function timeZoneLabel(timeZone: string, now = new Date()): string {
  try {
    const part = new Intl.DateTimeFormat("en-US", {
      timeZone,
      timeZoneName: "short",
    })
      .formatToParts(now)
      .find((item) => item.type === "timeZoneName");
    return part?.value ? `${part.value} (${timeZone})` : timeZone;
  } catch {
    return timeZone;
  }
}

export function zonedNow(now: Date, timeZone: string): { weekday: Weekday; minutes: number } {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone,
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );
  const weekday = WEEKDAY_FROM_SHORT[parts.weekday ?? ""];
  if (!weekday) {
    throw new Error(`Could not read the weekday in ${timeZone}.`);
  }
  let hour = Number(parts.hour);
  if (hour === 24) hour = 0;
  const minute = Number(parts.minute);
  return { weekday, minutes: hour * 60 + minute };
}

function previousWeekday(day: Weekday): Weekday {
  const index = WEEKDAYS.indexOf(day);
  return WEEKDAYS[(index + 6) % 7] ?? "sun";
}

function nextWeekday(day: Weekday): Weekday {
  const index = WEEKDAYS.indexOf(day);
  return WEEKDAYS[(index + 1) % 7] ?? "mon";
}

/** Same-day portion of a range. Overnight ranges count only the evening side. */
function containsFromOpen(day: DayHours, minutes: number): boolean {
  if (day.closed || !day.open || !day.close) return false;
  const start = toMinutes(day.open);
  const end = toMinutes(day.close);
  if (start === null || end === null || start === end) return false;
  if (end > start) return minutes >= start && minutes < end;
  return minutes >= start;
}

/** Morning portion left over from a previous day's overnight range. */
function containsAfterMidnight(day: DayHours, minutes: number): boolean {
  if (day.closed || !day.open || !day.close) return false;
  const start = toMinutes(day.open);
  const end = toMinutes(day.close);
  if (start === null || end === null || end > start) return false;
  return minutes < end;
}

export function isOpenAt(hours: WeekHours, timeZone: string, now = new Date()): boolean {
  if (hours.twentyFourHours) return true;
  const { weekday, minutes } = zonedNow(now, timeZone);
  if (containsFromOpen(hours.days[weekday], minutes)) return true;
  return containsAfterMidnight(hours.days[previousWeekday(weekday)], minutes);
}

export interface OpeningStatus {
  open: boolean;
  label: string;
  detail: string;
}

export function openingStatus(hours: WeekHours, timeZone: string, now = new Date()): OpeningStatus {
  const zone = timeZoneLabel(timeZone, now);
  if (hours.twentyFourHours) {
    return {
      open: true,
      label: "Open 24 hours",
      detail: `Times shown in ${zone}.`,
    };
  }
  const { weekday, minutes } = zonedNow(now, timeZone);
  if (isOpenAt(hours, timeZone, now)) {
    const close = closingMinutes(hours, weekday, minutes);
    return {
      open: true,
      label: "Open now",
      detail: close
        ? `Closes at ${formatClock(close)}. Times shown in ${zone}.`
        : `Times shown in ${zone}.`,
    };
  }
  const next = nextOpening(hours, weekday, minutes);
  return {
    open: false,
    label: "Closed now",
    detail: next
      ? `Opens ${next.when} at ${formatClock(next.time)}. Times shown in ${zone}.`
      : `No opening hours recorded. Times shown in ${zone}.`,
  };
}

function closingMinutes(hours: WeekHours, weekday: Weekday, minutes: number): string | null {
  const today = hours.days[weekday];
  if (containsFromOpen(today, minutes) && today.close) return today.close;
  const yesterday = hours.days[previousWeekday(weekday)];
  if (containsAfterMidnight(yesterday, minutes) && yesterday.close) return yesterday.close;
  return null;
}

function nextOpening(
  hours: WeekHours,
  weekday: Weekday,
  minutes: number,
): { when: string; time: string } | null {
  const today = hours.days[weekday];
  if (!today.closed && today.open) {
    const start = toMinutes(today.open);
    if (start !== null && minutes < start) {
      return { when: "today", time: today.open };
    }
  }
  let cursor = weekday;
  for (let step = 1; step <= 7; step += 1) {
    cursor = nextWeekday(cursor);
    const day = hours.days[cursor];
    if (!day.closed && day.open) {
      const when = step === 1 ? "tomorrow" : DAY_NAME[cursor];
      return { when, time: day.open };
    }
  }
  return null;
}

export function formatLongDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return iso;
  const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(date);
}

export function formatWhen(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function todayIso(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
