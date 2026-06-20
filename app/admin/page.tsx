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
          Back to the timeline
        </Link>
      </div>
    );
  }

  const [users, pendingPosts, hiddenPosts] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { _count: { select: { posts: true, comments: true } } },
    }),
    prisma.post.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      include: { author: true, images: true },
    }),
    prisma.post.findMany({
      where: { status: "HIDDEN" },
      orderBy: { createdAt: "desc" },
      include: { author: true },
    }),
  ]);

  const pendingUsers = users.filter((u) => u.status === "PENDING");

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-3xl font-bold">Admin</h1>
        <Link href="/" className="card-pop-sm rounded-xl bg-white px-3 py-1.5 text-sm font-semibold">
          ← Timeline
        </Link>
      </div>

      {/* Pending approvals */}
      <Section title={`Pending approvals (${pendingUsers.length})`} accent="figyellow">
        {pendingUsers.length === 0 ? (
          <Empty>No one waiting — you&apos;re all caught up.</Empty>
        ) : (
          <ul className="space-y-2">
            {pendingUsers.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-white p-3">
                <Person name={u.name} email={u.email} image={u.image} count={u._count.posts} />
                <UserActions userId={u.id} status={u.status} isSelf={u.id === me.id} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Held posts */}
      <Section title={`Posts held for review (${pendingPosts.length})`} accent="figblue">
        {pendingPosts.length === 0 ? (
          <Empty>Nothing held right now.</Empty>
        ) : (
          <ul className="space-y-2">
            {pendingPosts.map((p) => (
              <li key={p.id} className="rounded-2xl border-2 border-ink bg-white p-3">
                <div className="mb-1 text-sm font-bold">{p.author.name ?? p.author.email}</div>
                <div className="text-sm text-ink/70">{p.caption || "(no caption)"} · {p.images.length} photo(s)</div>
                <p className="mt-1 text-xs text-ink/40">Approve the author above to release their held posts.</p>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Everyone */}
      <Section title={`All people (${users.length})`} accent="figgreen">
        <ul className="space-y-2">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-white p-3">
              <div className="flex items-center gap-3">
                <Person name={u.name} email={u.email} image={u.image} count={u._count.posts} />
                <StatusTag status={u.status} role={u.role} />
              </div>
              <UserActions userId={u.id} status={u.status} isSelf={u.id === me.id} />
            </li>
          ))}
        </ul>
      </Section>

      {/* Hidden posts */}
      <Section title={`Hidden posts (${hiddenPosts.length})`} accent="figpink">
        {hiddenPosts.length === 0 ? (
          <Empty>No hidden posts.</Empty>
        ) : (
          <ul className="space-y-2">
            {hiddenPosts.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 rounded-2xl border-2 border-ink bg-white p-3">
                <div className="min-w-0">
                  <div className="text-sm font-bold">{p.author.name ?? p.author.email}</div>
                  <div className="truncate text-sm text-ink/70">{p.caption || "(no caption)"}</div>
                </div>
                <PostModeration postId={p.id} hidden />
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

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="rounded-2xl border-2 border-dashed border-ink/20 p-4 text-sm font-semibold text-ink/40">{children}</p>;
}

function Person({ name, email, image, count }: { name: string | null; email: string | null; image: string | null; count: number }) {
  return (
    <div className="flex items-center gap-3">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={image ?? "/avatar.svg"} alt="" className="h-10 w-10 rounded-full border-2 border-ink object-cover" />
      <div className="leading-tight">
        <div className="text-sm font-bold">{name ?? "—"}</div>
        <div className="text-xs text-ink/50">{email} · {count} post(s)</div>
      </div>
    </div>
  );
}

function StatusTag({ status, role }: { status: string; role: string }) {
  const map: Record<string, string> = {
    ADMIN: "bg-figpurple text-white",
    APPROVED: "bg-figgreen text-ink",
    PENDING: "bg-figyellow text-ink",
    BANNED: "bg-figred text-white",
  };
  const label = role === "ADMIN" ? "ADMIN" : status;
  return <span className={`rounded-full border-2 border-ink px-2 py-0.5 text-[11px] font-bold ${map[label] ?? "bg-white"}`}>{label}</span>;
}
