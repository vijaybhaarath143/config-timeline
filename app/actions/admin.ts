"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return null;
  return session.user;
}

/** Fully delete a person and all their content (cascades to posts/comments/images). */
export async function deleteUser(userId: string) {
  const admin = await requireAdmin();
  if (!admin) return { error: "Admins only." };
  if (admin.id === userId) return { error: "You can't delete your own admin account." };

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/", "layout");
  return { ok: true };
}

/** Moderate a single post without touching the author's account. */
export async function setPostHidden(postId: string, hidden: boolean) {
  if (!(await requireAdmin())) return { error: "Admins only." };

  await prisma.post.update({
    where: { id: postId },
    data: { status: hidden ? "HIDDEN" : "VISIBLE" },
  });
  revalidatePath("/", "layout");
  return { ok: true };
}
