"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isEventOpen } from "@/lib/event";
import { rateLimit } from "@/lib/rate-limit";

export async function addComment(postId: string, body: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in to comment." };
  if (!session.user.handle) return { error: "Create your profile first." };
  if (!isEventOpen()) return { error: "Config has wrapped — comments are closed." };
  if (!rateLimit(`comment:${session.user.id}`, 30, 60_000)) {
    return { error: "You're commenting too fast — give it a moment." };
  }

  const text = body.trim();
  if (!text) return { error: "Write something first." };
  if (text.length > 500) return { error: "Keep comments under 500 characters." };

  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: { author: { select: { id: true, isPublic: true, handle: true } } },
  });
  if (!post || post.status === "HIDDEN") return { error: "Post not found." };
  // Don't allow commenting on a private profile's posts unless you own it.
  if (!post.author.isPublic && post.author.id !== session.user.id) {
    return { error: "Post not found." };
  }

  await prisma.comment.create({
    data: { postId, authorId: session.user.id, body: text },
  });
  if (post.author.handle) revalidatePath(`/u/${post.author.handle}`);
  return { ok: true };
}

export async function editComment(commentId: string, body: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in." };
  if (!isEventOpen()) return { error: "Config has wrapped — comments are closed." };

  const text = body.trim();
  if (!text) return { error: "Comment can't be empty." };
  if (text.length > 500) return { error: "Keep comments under 500 characters." };

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return { error: "Comment not found." };
  if (comment.authorId !== session.user.id) return { error: "You can only edit your own comments." };

  await prisma.comment.update({ where: { id: commentId }, data: { body: text } });
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in." };

  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { post: { select: { authorId: true } } },
  });
  if (!comment) return { error: "Comment not found." };

  const isCommentAuthor = comment.authorId === session.user.id;
  const isProfileOwner = comment.post.authorId === session.user.id; // owner of the post moderates
  const isAdmin = session.user.role === "ADMIN";
  if (!isCommentAuthor && !isProfileOwner && !isAdmin) {
    return { error: "You can't delete this comment." };
  }

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath("/", "layout");
  return { ok: true };
}
