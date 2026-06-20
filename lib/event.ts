// Central config for the Figma Config timeline window.
// The timeline runs 19 -> 26 June 2026 and locks (read-only) after the 26th.

export const EVENT = {
  title: "Config",
  city: "San Francisco",
  // Inclusive day range, in event-local order.
  startDay: "2026-06-19",
  endDay: "2026-06-26",
  // Posting closes at the end of this day (local). After this, the app is read-only.
  closesAt: new Date("2026-06-27T00:00:00-07:00"), // midnight PT after the 26th
};

// One vivid hue per day, cycling the Figma rainbow.
const DAY_COLORS = [
  "figred",
  "figorange",
  "figyellow",
  "figgreen",
  "figteal",
  "figblue",
  "figpurple",
  "figpink",
] as const;

export type DayColor = (typeof DAY_COLORS)[number];

export type EventDay = {
  key: string; // "2026-06-19"
  date: Date; // midnight that day (PT-ish, used only for labels)
  dayNum: number; // 19
  weekday: string; // "Fri"
  color: DayColor;
  index: number; // 0-based position in the timeline
};

/** Build the ordered list of event days from startDay..endDay (inclusive). */
export function getEventDays(): EventDay[] {
  const days: EventDay[] = [];
  const start = parseKey(EVENT.startDay);
  const end = parseKey(EVENT.endDay);

  let i = 0;
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const date = new Date(d);
    days.push({
      key: toKey(date),
      date,
      dayNum: date.getUTCDate(),
      weekday: date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
      color: DAY_COLORS[i % DAY_COLORS.length],
      index: i,
    });
    i++;
  }
  return days;
}

/** True while the event window is still open for posting. */
export function isEventOpen(now: Date = new Date()): boolean {
  return now < EVENT.closesAt;
}

/** Is the given day key part of the event window? */
export function isValidDayKey(key: string): boolean {
  return getEventDays().some((d) => d.key === key);
}

function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function toKey(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** "7:14 AM" style label from a stored timestamp. */
export function timeLabel(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}
