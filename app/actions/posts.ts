"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isEventOpen, isValidDayKey } from "@/lib/event";

type CreatePostInput = {
  day: string; // "2026-06-19"
  time: string; // "07:30"
  caption: string;
  imageUrls: string[];
};

export async function createPost(input: CreatePostInput) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in to post." };
  if (!session.user.handle) return { error: "Create your profile first." };
  if (!isEventOpen()) return { error: "Config has wrapped — the timeline is now read-only." };
  if (!isValidDayKey(input.day)) return { error: "That day isn't part of Config." };

  const caption = input.caption.trim();
  const images = input.imageUrls.filter(Boolean).slice(0, 10);
  if (!caption && images.length === 0) {
    return { error: "Add a photo or a thought before posting." };
  }
  if (!/^\d{2}:\d{2}$/.test(input.time)) {
    return { error: "Pick a valid time of day." };
  }

  const happenedAt = new Date(`${input.day}T${input.time}:00`);
  if (Number.isNaN(happenedAt.getTime())) {
    return { error: "Pick a valid time of day." };
  }

  await prisma.post.create({
    data: {
      authorId: session.user.id,
      day: input.day,
      happenedAt,
      caption,
      status: "VISIBLE",
      images: {
        create: images.map((url, i) => ({ url, order: i })),
      },
    },
  });

  if (session.user.handle) revalidatePath(`/u/${session.user.handle}`);
  return { ok: true };
}

export async function editPost(postId: string, input: { caption: string; time: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in." };

  const post = await prisma.post.findUnique({ where: { id: postId }, include: { images: true } });
  if (!post) return { error: "Post not found." };
  if (post.authorId !== session.user.id) return { error: "You can only edit your own posts." };

  const caption = input.caption.trim();
  if (!caption && post.images.length === 0) {
    return { error: "A post needs a photo or a thought." };
  }
  if (!/^\d{2}:\d{2}$/.test(input.time)) return { error: "Pick a valid time of day." };

  const happenedAt = new Date(`${post.day}T${input.time}:00`);
  if (Number.isNaN(happenedAt.getTime())) return { error: "Pick a valid time of day." };

  await prisma.post.update({
    where: { id: postId },
    data: { caption, happenedAt },
  });

  if (session.user.handle) revalidatePath(`/u/${session.user.handle}`);
  return { ok: true };
}

export async function deletePost(postId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in." };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) return { error: "Post not found." };

  const isOwner = post.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return { error: "You can only delete your own posts." };

  await prisma.post.delete({ where: { id: postId } });
  revalidatePath("/", "layout");
  return { ok: true };
}
