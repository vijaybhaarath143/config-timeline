import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getEventDays, isEventOpen, timeLabel } from "@/lib/event";
import { Header } from "@/components/Header";
import { DayRail } from "@/components/DayRail";
import { AddPost } from "@/components/AddPost";
import { PostCard } from "@/components/PostCard";
import { PrivacyToggle } from "@/components/PrivacyToggle";
import type { PostView } from "@/components/types";

export const dynamic = "force-dynamic";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  const session = await auth();
  const viewer = session?.user ?? null;

  const user = await prisma.user.findUnique({ where: { handle } });
  if (!user) notFound();

  const isOwner = viewer?.id === user.id;
  const isAdmin = viewer?.role === "ADMIN";
  const canInteract = !!viewer;
  const eventOpen = isEventOpen();
  const days = getEventDays();

  // Private profiles are visible only to their owner (and admins).
  if (!user.isPublic && !isOwner && !isAdmin) {
    return (
      <div className="min-h-screen">
        <Header user={viewer} />
        <div className="mx-auto max-w-md px-4 py-24 text-center">
          <div className="text-5xl">🔒</div>
          <h1 className="mt-3 font-display text-2xl font-bold">This profile is private</h1>
          <p className="mt-2 text-ink/60">{user.name ?? "This person"} has kept their Config timeline to themselves.</p>
        </div>
      </div>
    );
  }

  const rows = await prisma.post.findMany({
    where: {
      authorId: user.id,
      ...(isOwner || isAdmin ? {} : { status: "VISIBLE" }),
    },
    orderBy: { happenedAt: "asc" },
    include: {
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
      authorName: user.name ?? "Someone",
      authorImage: user.image,
      held: false,
      images: p.images.map((i) => ({ id: i.id, url: i.url })),
      canDelete: isOwner || isAdmin,
      comments: p.comments.map((c) => ({
        id: c.id,
        body: c.body,
        authorId: c.authorId,
        authorName: c.author.name ?? "Someone",
        authorImage: c.author.image,
        edited: c.updatedAt.getTime() - c.createdAt.getTime() > 1000,
        mine: c.authorId === viewer?.id,
        canDelete: c.authorId === viewer?.id || isAdmin,
      })),
    };
    const list = byDay.get(p.day) ?? [];
    list.push(view);
    byDay.set(p.day, list);
  }

  const counts: Record<string, number> = {};
  for (const d of days) counts[d.key] = byDay.get(d.key)?.length ?? 0;
  const total = rows.length;

  return (
    <div className="min-h-screen">
      <Header user={viewer} />

      <main className="mx-auto max-w-3xl px-4 pb-24">
        {/* Profile hero */}
        <section className="py-8 text-center sm:py-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={user.image ?? "/avatar.svg"}
            alt=""
            className="mx-auto h-20 w-20 rounded-full border-[3px] border-ink object-cover"
          />
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">{user.name}</h1>
          {user.bio && <p className="mx-auto mt-2 max-w-md text-ink/70">{user.bio}</p>}
          <p className="mt-1 text-sm font-semibold text-ink/40">
            {total} {total === 1 ? "moment" : "moments"} · Config {new Date().getFullYear()}
          </p>

          <div className="mt-4 flex items-center justify-center gap-2">
            {isOwner ? (
              <PrivacyToggle isPublic={user.isPublic} bio={user.bio ?? ""} />
            ) : (
              <span className="rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold">
                {user.isPublic ? "🌍 Public profile" : "🔒 Private"}
              </span>
            )}
          </div>

          {isOwner && !eventOpen && (
            <p className="mx-auto mt-4 max-w-md rounded-2xl border-2 border-ink bg-figyellow px-4 py-2 text-sm font-bold">
              🎉 Config has wrapped — your timeline is now read-only.
            </p>
          )}
        </section>

        <DayRail days={days} counts={counts} />

        {/* Timeline */}
        <div className="relative mt-6">
          <div className="absolute bottom-0 left-[19px] top-2 w-1 rounded bg-ink/10" aria-hidden />
          <div className="space-y-12">
            {days.map((d) => {
              const posts = byDay.get(d.key) ?? [];
              return (
                <section key={d.key} id={`day-${d.dayNum}`} className="scroll-mt-32">
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
                    {isOwner && eventOpen && (
                      <AddPost dayKey={d.key} dayLabel={`${d.weekday} ${d.dayNum}`} color={d.color} />
                    )}
                  </div>

                  <div className="ml-12 space-y-4">
                    {posts.length === 0 ? (
                      <div className="rounded-3xl border-2 border-dashed border-ink/20 py-8 text-center text-sm font-semibold text-ink/40">
                        {isOwner && eventOpen ? "Tap the + to add a moment." : "Nothing here yet."}
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
          Config Timeline · be kind, be colourful ✦
        </footer>
      </main>
    </div>
  );
}
