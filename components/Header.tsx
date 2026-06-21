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
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-figyellow font-display text-xl font-bold">
            C
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Config<span className="text-figpink">/</span>Timeline
          </span>
        </Link>

        <div className="flex items-center gap-2">
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="card-pop-sm rounded-xl bg-figpurple px-3 py-1.5 text-sm font-semibold text-white"
            >
              Admin
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href={user.handle ? `/u/${user.handle}` : "/onboarding"}
                className="card-pop-sm rounded-xl bg-white px-3 py-1.5 text-sm font-semibold"
              >
                My profile
              </Link>
              {user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "you"}
                  className="h-9 w-9 rounded-full border-2 border-ink"
                />
              )}
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="card-pop-sm rounded-xl bg-white px-3 py-1.5 text-sm font-semibold"
              >
                Sign out
              </button>
            </div>
          ) : (
            <button
              onClick={() => signIn("google")}
              className="card-pop-sm rounded-xl bg-ink px-4 py-1.5 text-sm font-semibold text-white"
            >
              Sign in with Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
