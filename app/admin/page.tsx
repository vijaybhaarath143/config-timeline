import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserActions, PostModeration } from "@/components/AdminControls";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();
  const me = session?.user;

  if (!me || me.role !== "ADMIN") {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="font-display text-3xl font-bold">Admins only ✋</h1>
        <p className="mt-2 text-ink/60">You don&apos;t have access to this page.</p>
        <Link href="/" className="mt-6 inline-block card-pop-sm rounded-xl bg-ink px-4 py-2 font-semibold text-white">
          Back home
        </Link>
      </div>
    );
  }

  const [users, hiddenPosts] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { posts: true, comments: true } } },
    }),
    prisma.post.findMany({
      where: { status: "HIDDEN" },
      orderBy: { createdAt: "desc" },
      include: { author: true },
    }),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Admin</h1>
        <Link href="/" className="card-pop-sm rounded-xl bg-white px-3 py-1.5 text-sm font-semibold">
          ← Home
        </Link>
      </div>

      <Section title={`People (${users.length})`} accent="figgreen">
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-2 rounded-2xl border-2 border-ink bg-white p-3">
              <div className="flex min-w-0 items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={u.image ?? "/avatar.svg"} alt="" className="h-10 w-10 shrink-0 rounded-full border-2 border-ink object-cover" />
                <div className="min-w-0 leading-tight">
                  <div className="flex flex-wrap items-center gap-1.5 text-sm font-bold">
                    {u.handle ? (
                      <Link href={`/u/${u.handle}`} className="underline decoration-figpink decoration-2 underline-offset-2">
                        {u.name ?? "—"}
                      </Link>
                    ) : (
                      <span>{u.name ?? "—"}</span>
                    )}
                    {u.role === "ADMIN" && (
                      <span className="rounded-full border-2 border-ink bg-figpurple px-2 py-0.5 text-[11px] font-bold text-white">ADMIN</span>
                    )}
                    <span className={`rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-bold ${u.isPublic ? "bg-figgreen" : "bg-figyellow"}`}>
                      {u.handle ? (u.isPublic ? "public" : "private") : "no profile"}
                    </span>
                  </div>
                  <div className="truncate text-xs text-ink/50">{u.email} · {u._count.posts} post(s)</div>
                </div>
              </div>
              <div className="shrink-0">
                <UserActions userId={u.id} isSelf={u.id === me.id} />
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title={`Hidden posts (${hiddenPosts.length})`} accent="figpink">
        {hiddenPosts.length === 0 ? (
          <p className="rounded-2xl border-2 border-dashed border-ink/20 p-4 text-sm font-semibold text-ink/40">No hidden posts.</p>
        ) : (
          <ul className="space-y-2">
            {hiddenPosts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 rounded-2xl border-2 border-ink bg-white p-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-bold">{p.author.name ?? p.author.email}</div>
                  <div className="truncate text-sm text-ink/70">{p.caption || "(no caption)"}</div>
                </div>
                <div className="shrink-0">
                  <PostModeration postId={p.id} hidden />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Section({ title, accent, children }: { title: string; accent: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 inline-block rounded-full border-2 border-ink bg-white px-3 py-1 font-display font-bold">
        <span className={`text-${accent}`}>●</span> {title}
      </h2>
      {children}
    </section>
  );
}
