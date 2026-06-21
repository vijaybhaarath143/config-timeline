import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { rateLimit } from "@/lib/rate-limit";

// Client-side uploads go straight to Vercel Blob; this route only mints
// short-lived upload tokens for signed-in, non-banned users.
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await auth();
        if (!session?.user || !session.user.handle) {
          throw new Error("Not authorized to upload.");
        }
        // Throttle token minting to curb storage abuse (uploads bypass the
        // client-side compression if called directly).
        if (!rateLimit(`upload:${session.user.id}`, 40, 60_000)) {
          throw new Error("Too many uploads — slow down a little.");
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic"],
          maximumSizeInBytes: 8 * 1024 * 1024, // 8 MB per image
          // @vercel/blob v2 defaults this to false; keep unique names so two
          // people uploading "IMG_0001.jpg" never collide or overwrite.
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId: session.user.id }),
        };
      },
      onUploadCompleted: async () => {
        // No-op: the post is created via a server action with the returned URLs.
      },
    });

    return NextResponse.json(json);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}
