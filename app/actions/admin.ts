"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }
  return session.user;
}

/** Approve a person: future posts go live, and any held posts are released. */
export async function approveUser(userId: string) {
  if (!(await requireAdmin())) return { error: "Admins only." };

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status: "APPROVED" } }),
    prisma.post.updateMany({
      where: { authorId: userId, status: "PENDING" },
      data: { status: "VISIBLE" },
    }),
  ]);
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

/** Ban a person: they can't post/comment, and their content is hidden (kept, not deleted). */
export async function banUser(userId: string) {
  if (!(await requireAdmin())) return { error: "Admins only." };

  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { status: "BANNED" } }),
    prisma.post.updateMany({ where: { authorId: userId }, data: { status: "HIDDEN" } }),
  ]);
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

/** Fully delete a person and all their content (cascades to posts/comments/images). */
export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admins only." };
  if (admin.id === userId) return { error: "You can't delete your own admin account." };

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}

/** Moderate a single post without touching the author's account. */
export async function setPostHidden(postId: string, hidden: boolean) {
  if (!(await requireAdmin())) return { error: "Admins only." };

  await prisma.post.update({
    where: { id: postId },
    data: { status: hidden ? "HIDDEN" : "VISIBLE" },
  });
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: true };
}
