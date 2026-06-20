"use client";

import { signIn, signOut } from "next-auth/react";
import Link from "next/link";

type Props = {
  user?: {
    name?: string | null;
    image?: string | null;
    role: "USER" | "ADMIN";
    status: "PENDING" | "APPROVED" | "BANNED";
  } | null;
};

export function Header({ user }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b-[3px] border-ink bg-figyellow/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
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
              <StatusPill role={user.role} status={user.status} />
              {user.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.image}
                  alt={user.name ?? "you"}
                  className="h-9 w-9 rounded-full border-2 border-ink"
                />
              )}
              <button
                onClick={() => signOut()}
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

function StatusPill({
  role,
  status,
}: {
  role: "USER" | "ADMIN";
  status: "PENDING" | "APPROVED" | "BANNED";
}) {
  if (role === "ADMIN")
    return <Pill className="bg-figpurple text-white">Admin</Pill>;
  if (status === "APPROVED")
    return <Pill className="bg-figgreen text-ink">Approved</Pill>;
  if (status === "BANNED")
    return <Pill className="bg-figred text-white">Removed</Pill>;
  return <Pill className="bg-white text-ink">Pending review</Pill>;
}

function Pill({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`hidden rounded-full border-2 border-ink px-2.5 py-1 text-xs font-bold sm:inline ${className}`}>
      {children}
    </span>
  );
}
