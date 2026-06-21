"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 30);
}

/** Generate a unique handle from a display name, appending -2, -3… on collision. */
async function uniqueHandle(name: string, selfId: string): Promise<string> {
  const base = slugify(name) || "guest";
  let handle = base;
  let n = 1;
  // Loop until the handle is free (or owned by this user).
  while (true) {
    const existing = await prisma.user.findUnique({ where: { handle } });
    if (!existing || existing.id === selfId) return handle;
    n += 1;
    handle = `${base}-${n}`;
  }
}

export async function createProfile(input: {
  name: string;
  bio: string;
  isPublic: boolean;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in." };

  const name = input.name.trim();
  if (!name) return { error: "Please add your name." };
  if (name.length > 60) return { error: "Name is too long." };

  const handle = await uniqueHandle(name, session.user.id);

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name,
      bio: input.bio.trim().slice(0, 280),
      isPublic: input.isPublic,
      handle,
    },
  });

  revalidatePath("/", "layout");
  redirect(`/u/${handle}`);
}

export async function updateProfile(input: {
  name?: string;
  bio: string;
  isPublic: boolean;
  image?: string; // new photo URL, if changed
}) {
  const session = await auth();
  if (!session?.user) return { error: "Please sign in." };

  const name = input.name?.trim();
  if (input.name !== undefined && !name) return { error: "Name can't be empty." };

  const updated = await prisma.user.update({
    where: { id: session.user.id },
    data: {
      ...(name ? { name: name.slice(0, 60) } : {}),
      ...(input.image ? { image: input.image } : {}),
      bio: input.bio.trim().slice(0, 280),
      isPublic: input.isPublic,
    },
  });

  revalidatePath(`/u/${updated.handle}`);
  revalidatePath("/", "layout");
  return { ok: true };
}
