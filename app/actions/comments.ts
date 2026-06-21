"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isEventOpen } from "@/lib/event";

export async function addComment(postId: string, body: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in to comment." };
  if (!isEventOpen()) return { error: "Config has wrapped — comments are closed." };

  const text = body.trim();
  if (!text) return { error: "Write something first." };
  if (text.length > 500) return { error: "Keep comments under 500 characters." };

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post || post.status === "HIDDEN") return { error: "Post not found." };

  await prisma.comment.create({
    data: { postId, authorId: session.user.id, body: text },
  });
  revalidatePath("/");
  return { ok: true };
}

export async function editComment(commentId: string, body: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in." };

  const text = body.trim();
  if (!text) return { error: "Comment can't be empty." };
  if (text.length > 500) return { error: "Keep comments under 500 characters." };

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return { error: "Comment not found." };
  if (comment.authorId !== session.user.id) return { error: "You can only edit your own comments." };

  await prisma.comment.update({ where: { id: commentId }, data: { body: text } });
  revalidatePath("/");
  return { ok: true };
}

export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in." };

  const comment = await prisma.comment.findUnique({ where: { id: commentId } });
  if (!comment) return { error: "Comment not found." };

  const isOwner = comment.authorId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) return { error: "You can only delete your own comments." };

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath("/");
  return { ok: true };
}
