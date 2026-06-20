import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

// TEMPORARY diagnostic: server-side blob write using the runtime
// BLOB_READ_WRITE_TOKEN. Confirms whether the store itself works.
// Remove after debugging.
export async function GET() {
  try {
    const r = await put(`diag/test-${Date.now()}.txt`, "hello from diag", {
      access: "public",
      addRandomSuffix: true,
    });
    return NextResponse.json({ ok: true, url: r.url });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: (e as Error).message },
      { status: 500 }
    );
  }
}
