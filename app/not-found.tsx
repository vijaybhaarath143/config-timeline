import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-16 text-center">
      <div className="font-display text-7xl font-bold leading-none">
        <span className="text-figred">4</span>
        <span className="text-figblue">0</span>
        <span className="text-figpurple">4</span>
      </div>
      <h1 className="mt-4 font-display text-2xl font-bold">Nothing here</h1>
      <p className="mt-2 max-w-sm text-ink/60">
        This profile doesn&apos;t exist, or it&apos;s set to private.
      </p>
      <Link
        href="/"
        className="card-pop mt-6 rounded-2xl bg-ink px-5 py-3 font-display font-bold text-white transition active:translate-y-1"
      >
        ← Back to Config Timeline
      </Link>
    </main>
  );
}
