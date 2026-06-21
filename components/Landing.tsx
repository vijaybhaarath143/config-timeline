"use client";

import { signIn } from "next-auth/react";
import { EVENT } from "@/lib/event";

export function Landing() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-5 py-16 text-center">
      <span className="mb-5 inline-block rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
        {EVENT.city} · June 19–26
      </span>

      <h1 className="font-display text-6xl font-bold leading-[0.92] tracking-tight sm:text-8xl">
        <span className="text-figred">C</span>
        <span className="text-figorange">o</span>
        <span className="text-figgreen">n</span>
        <span className="text-figblue">f</span>
        <span className="text-figpurple">i</span>
        <span className="text-figpink">g</span>
        <br />
        <span className="text-stroke">Timeline</span>
      </h1>

      <p className="mx-auto mt-6 max-w-md text-lg font-medium text-ink/70">
        Your own colourful, hour-by-hour diary of Config. Snap the moments, add a
        thought, and build your personal timeline of the week.
      </p>

      <button
        onClick={() => signIn("google")}
        className="card-pop mt-8 rounded-2xl bg-ink px-7 py-4 font-display text-lg font-bold text-white transition active:translate-y-1"
      >
        Sign in to add your Config experience →
      </button>

      <div className="mt-12 grid w-full max-w-md grid-cols-3 gap-3 text-left">
        <Feature color="figpink" emoji="📸" label="Post photos & thoughts with a timestamp" />
        <Feature color="figblue" emoji="🗓️" label="A timeline for each day, 19→26" />
        <Feature color="figgreen" emoji="🔒" label="Keep it public or private — your call" />
      </div>

      <p className="mt-10 text-xs font-semibold text-ink/40">
        Sign in with Google · be kind, be colourful ✦
      </p>
    </main>
  );
}

function Feature({ color, emoji, label }: { color: string; emoji: string; label: string }) {
  return (
    <div className="card-pop-sm rounded-2xl bg-white p-3">
      <div className={`mb-1 grid h-9 w-9 place-items-center rounded-lg bg-${color} text-xl`}>{emoji}</div>
      <div className="text-xs font-semibold leading-snug">{label}</div>
    </div>
  );
}
