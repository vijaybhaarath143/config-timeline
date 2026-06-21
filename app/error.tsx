"use client";

import Link from "next/link";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-16 text-center">
      <div className="font-display text-6xl font-bold leading-none">
        <span className="text-figred">o</span>
        <span className="text-figorange">o</span>
        <span className="text-figpurple">f</span>
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold">Something glitched</h1>
      <p className="mt-2 max-w-sm text-ink/60">
        That&apos;s on us, not you. Give it another go.
      </p>
      <div className="mt-6 flex gap-2">
        <button
          onClick={() => reset()}
          className="card-pop rounded-2xl bg-ink px-5 py-3 font-display font-bold text-white transition active:translate-y-1"
        >
          Try again
        </button>
        <Link
          href="/"
          className="card-pop-sm rounded-2xl bg-white px-5 py-3 font-display font-bold transition active:translate-y-1"
        >
          Home
        </Link>
      </div>
    </main>
  );
}
