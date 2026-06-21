"use client";

import { signIn, signOut } from "next-auth/react";
import Link from "next/link";

type Props = {
  user?: {
    name?: string | null;
    image?: string | null;
    role: "USER" | "ADMIN";
    handle: string | null;
  } | null;
};

export function Header({ user }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-figyellow/95 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-3 py-2.5 sm:px-4 sm:py-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-ink text-figyellow font-display text-lg font-bold sm:h-9 sm:w-9 sm:rounded-xl sm:text-xl">
            C
          </span>
          {/* Wordmark hides on phones to free up the bar */}
          <span className="hidden font-display text-xl font-bold tracking-tight sm:inline">
            Config<span className="text-figpink">/</span>Timeline
          </span>
        </Link>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="card-pop-sm rounded-lg bg-figpurple px-2.5 py-1 text-xs font-semibold text-white sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-sm"
            >
              Admin
            </Link>
          )}

          {user ? (
            <>
              <Link
                href={user.handle ? `/u/${user.handle}` : "/onboarding"}
                className={`card-pop-sm shrink-0 rounded-lg px-2.5 py-1 text-xs font-semibold sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-sm ${
                  user.handle ? "bg-white" : "bg-figgreen"
                }`}
              >
                {user.handle ? "My profile" : "+ Create profile"}
              </Link>
              {user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "you"}
                  className="h-8 w-8 shrink-0 rounded-full border-2 border-ink sm:h-9 sm:w-9"
                />
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                aria-label="Sign out"
                className="card-pop-sm shrink-0 rounded-lg bg-white px-2.5 py-1 text-xs font-semibold sm:rounded-xl sm:px-3 sm:py-1.5 sm:text-sm"
              >
                {/* full label on desktop, compact on phones */}
                <span className="hidden sm:inline">Sign out</span>
                <span className="sm:hidden">Out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="card-pop-sm shrink-0 rounded-lg bg-ink px-3 py-1.5 text-xs font-semibold text-white sm:rounded-xl sm:px-4 sm:text-sm"
            >
              Sign in<span className="hidden sm:inline"> with Google</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
