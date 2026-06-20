import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { EVENT, getEventDays, isEventOpen, timeLabel } from "@/lib/event";
import { Header } from "@/components/Header";
import { DayRail } from "@/components/DayRail";
import { AddPost } from "@/components/AddPost";
import { PostCard } from "@/components/PostCard";
import type { PostView } from "@/components/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  const me = session?.user ?? null;
  const isAdmin = me?.role === "ADMIN";
  const canInteract = !!me && me.status !== "BANNED";
  const eventOpen = isEventOpen();
  const days = getEventDays();

  const rows = await prisma.post.findMany({
    where: {
      OR: [
        { status: "VISIBLE" },
        ...(me ? [{ authorId: me.id, status: "PENDING" as const }] : []),
      ],
    },
    orderBy: { happenedAt: "asc" },
    include: {
      author: true,
      images: { orderBy: { order: "asc" } },
      comments: { orderBy: { createdAt: "asc" }, include: { author: true } },
    },
  });

  const byDay = new Map<string, PostView[]>();
  for (const p of rows) {
    const view: PostView = {
      id: p.id,
      caption: p.caption,
      timeLabel: timeLabel(p.happenedAt),
      authorName: p.author.name ?? "Someone",
      authorImage: p.author.image,
      held: p.status === "PENDING",
      images: p.images.map((i) => ({ id: i.id, url: i.url })),
      canDelete: isAdmin || p.authorId === me?.id,
      comments: p.comments.map((c) => ({
        id: c.id,
        body: c.body,
        authorId: c.authorId,
        authorName: c.author.name ?? "Someone",
        authorImage: c.author.image,
        edited: c.updatedAt.getTime() - c.createdAt.getTime() > 1000,
        mine: c.authorId === me?.id,
        canDelete: c.authorId === me?.id || isAdmin,
      })),
    };
    const list = byDay.get(p.day) ?? [];
    list.push(view);
    byDay.set(p.day, list);
  }

  const counts: Record<string, number> = {};
  for (const d of days) counts[d.key] = byDay.get(d.key)?.length ?? 0;

  return (
    <div className="min-h-screen">
      <Header user={me} />

      <main className="mx-auto max-w-3xl px-4 pb-24">
        {/* Hero */}
        <section className="py-10 text-center sm:py-14">
          <p className="mb-3 inline-block rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest">
            {EVENT.city} · June 19–26
          </p>
          <h1 className="font-display text-5xl font-bold leading-[0.95] tracking-tight sm:text-7xl">
            <span className="text-figred">C</span>
            <span className="text-figorange">o</span>
            <span className="text-figgreen">n</span>
            <span className="text-figblue">f</span>
            <span className="text-figpurple">i</span>
            <span className="text-figpink">g</span>{" "}
            <span className="text-stroke">Timeline</span>
          </h1>
          <p className="mx-auto mt-4 max-w-md text-lg font-medium text-ink/70">
            What happened, hour by hour. Snap it, share a thought, scroll the days.
          </p>
          {!eventOpen && (
            <p className="mx-auto mt-4 max-w-md rounded-2xl border-2 border-ink bg-figyellow px-4 py-2 text-sm font-bold">
              🎉 Config has wrapped — the timeline is now read-only.
            </p>
          )}
        </section>

        <Guidelines signedIn={!!me} pending={me?.status === "PENDING"} />

        <DayRail days={days} counts={counts} />

        {/* Timeline */}
        <div className="relative mt-6">
          {/* vertical spine */}
          <div className="absolute bottom-0 left-[19px] top-2 w-1 rounded bg-ink/10" aria-hidden />

          <div className="space-y-12">
            {days.map((d) => {
              const posts = byDay.get(d.key) ?? [];
              return (
                <section key={d.key} id={`day-${d.dayNum}`} className="scroll-mt-32">
                  {/* day header */}
                  <div className="relative mb-4 flex items-center gap-3">
                    <span className={`z-10 grid h-10 w-10 place-items-center rounded-full border-[3px] border-ink bg-${d.color} font-display text-lg font-bold`}>
                      {d.dayNum}
                    </span>
                    <div className="flex-1">
                      <h2 className="font-display text-2xl font-bold leading-none">
                        {d.weekday} {d.dayNum}
                      </h2>
                      <p className="text-xs font-semibold text-ink/50">
                        {posts.length} {posts.length === 1 ? "moment" : "moments"}
                      </p>
                    </div>
                    {eventOpen && canInteract && (
                      <AddPost dayKey={d.key} dayLabel={`${d.weekday} ${d.dayNum}`} color={d.color} />
                    )}
                  </div>

                  {/* posts */}
                  <div className="ml-12 space-y-4">
                    {posts.length === 0 ? (
                      <div className="rounded-3xl border-2 border-dashed border-ink/20 py-8 text-center text-sm font-semibold text-ink/40">
                        Nothing here yet.{" "}
                        {eventOpen && canInteract
                          ? "Tap the + to add the first moment."
                          : !me
                            ? "Sign in to add a moment."
                            : "Quiet day!"}
                      </div>
                    ) : (
                      posts.map((p) => (
                        <PostCard key={p.id} post={p} accent={d.color} canInteract={canInteract} />
                      ))
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        </div>

        <footer className="mt-16 text-center text-xs font-semibold text-ink/40">
          Built for Config · be kind, be colourful ✦
        </footer>
      </main>
    </div>
  );
}

function Guidelines({ signedIn, pending }: { signedIn: boolean; pending: boolean }) {
  return (
    <section className="card-pop mb-2 rounded-4xl bg-white p-5">
      <h2 className="mb-3 font-display text-lg font-bold">House rules ✦</h2>
      <ul className="space-y-2 text-sm font-medium text-ink/75">
        <li>👀 <b>Anyone can browse.</b> The whole timeline is public — no login needed to look around.</li>
        <li>🔑 <b>Sign in with Google to post or comment.</b> Your first post is held until an admin says hi and approves you.</li>
        <li>📸 <b>Post the moment, with a time.</b> Add photos, a quick thought, and when it happened — morning to night.</li>
        <li>💬 <b>Keep comments quick and kind.</b> You can edit or delete your own anytime.</li>
        <li>🚫 <b>No spam, no nonsense.</b> Admins can hide posts or remove accounts that break the vibe.</li>
      </ul>
      {pending && (
        <p className="mt-3 rounded-2xl border-2 border-ink bg-figyellow/60 px-3 py-2 text-sm font-bold">
          You&apos;re signed in! You can post now — your moments go live once an admin approves you.
        </p>
      )}
      {!signedIn && (
        <p className="mt-3 text-sm font-semibold text-ink/50">Read-only for now — sign in (top right) to join in.</p>
      )}
    </section>
  );
}
