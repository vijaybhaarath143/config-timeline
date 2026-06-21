"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";
import { isBlobUrl } from "@/lib/blob-url";

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
  if (!rateLimit(`profile:${session.user.id}`, 10, 60_000)) {
    return { error: "Too many attempts — try again shortly." };
  }

  const name = input.name.trim();
  if (!name) return { error: "Please add your name." };
  if (name.length > 60) return { error: "Name is too long." };

  const bio = input.bio.trim().slice(0, 280);
  let handle = await uniqueHandle(name, session.user.id);

  // Retry on a handle collision race (two signups slugging to the same name).
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { name, bio, isPublic: input.isPublic, handle },
      });
      break;
    } catch (e) {
      if (
        e instanceof Prisma.PrismaClientKnownRequestError &&
        e.code === "P2002" &&
        attempt < 4
      ) {
        handle = await uniqueHandle(name, session.user.id);
        continue;
      }
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
        return { error: "Couldn't pick a unique handle — try a slightly different name." };
      }
      throw e;
    }
  }

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
  if (input.image && !isBlobUrl(input.image)) return { error: "Invalid image." };

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
