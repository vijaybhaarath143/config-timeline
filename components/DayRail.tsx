"use client";

import type { EventDay } from "@/lib/event";

export function DayRail({ days, counts }: { days: EventDay[]; counts: Record<string, number> }) {
  return (
    <nav className="no-scrollbar sticky top-[52px] z-20 -mx-4 flex gap-2 overflow-x-auto border-b-2 border-ink/10 bg-figyellow/80 px-4 py-2 backdrop-blur sm:top-[60px]">
      {days.map((d) => (
        <a
          key={d.key}
          href={`#day-${d.dayNum}`}
          className={`card-pop-sm flex shrink-0 items-center gap-2 rounded-full bg-${d.color} px-3 py-1.5 text-sm font-bold text-ink`}
        >
          <span className="uppercase">{d.weekday}</span>
          <span>{d.dayNum}</span>
          <span className="grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-white">
            {counts[d.key] ?? 0}
          </span>
        </a>
      ))}
    </nav>
  );
}
