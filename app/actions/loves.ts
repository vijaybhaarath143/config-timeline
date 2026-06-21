"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

/** Toggle the current user's love on a post. Returns the new loved state. */
export async function toggleLove(postId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in to love a post." };
  if (!rateLimit(`love:${session.user.id}`, 60, 60_000)) {
    return { error: "Slow down a little." };
  }

  const existing = await prisma.love.findUnique({
    where: { postId_userId: { postId, userId: session.user.id } },
  });

  if (existing) {
    await prisma.love.delete({ where: { id: existing.id } });
    return { ok: true, loved: false };
  }

  // Only allow loving posts you can actually see.
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: { select: { id: true, isPublic: true } } },
  });
  if (!post || post.status === "HIDDEN") return { error: "Post not found." };
  if (!post.author.isPublic && post.author.id !== session.user.id) {
    return { error: "Post not found." };
  }

  await prisma.love.create({ data: { postId, userId: session.user.id } });
  return { ok: true, loved: true };
}
