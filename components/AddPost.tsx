"use client";

import { useRef, useState, useTransition } from "react";
import { upload } from "@vercel/blob/client";
import { createPost } from "@/app/actions/posts";

type Selected = { file: File; preview: string; url?: string };

export function AddPost({
  dayKey,
  dayLabel,
  color,
}: {
  dayKey: string;
  dayLabel: string;
  color: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={`Add a post for ${dayLabel}`}
        className={`card-pop-sm grid h-10 w-10 shrink-0 place-items-center rounded-full bg-${color} text-2xl font-bold leading-none text-ink transition active:translate-y-1`}
      >
        +
      </button>
      {open && <Composer dayKey={dayKey} dayLabel={dayLabel} color={color} onClose={() => setOpen(false)} />}
    </>
  );
}

function nowTimeValue() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// Downscale + re-encode photos in the browser before upload. A 12 MB phone
// shot becomes ~0.5-1 MB with no visible quality loss on screen, so uploads
// are far faster and storage lasts much longer. Falls back to the original
// file if anything can't be processed (e.g. animated GIFs, undecodable HEIC).
async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const maxEdge = 2000;
    const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close?.();

    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/jpeg", 0.82)
    );
    if (!blob || blob.size >= file.size) return file; // keep original if no gain
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

function Composer({
  dayKey,
  dayLabel,
  color,
  onClose,
}: {
  dayKey: string;
  dayLabel: string;
  color: string;
  onClose: () => void;
}) {
  const [items, setItems] = useState<Selected[]>([]);
  const [time, setTime] = useState(nowTimeValue());
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []).slice(0, 10 - items.length);
    setItems((prev) => [
      ...prev,
      ...files.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    ]);
    e.target.value = "";
  }

  function remove(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  async function post() {
    setError(null);
    if (items.length === 0 && !caption.trim()) {
      setError("Add a photo or a thought first.");
      return;
    }
    setUploading(true);
    let urls: string[] = [];
    try {
      urls = await Promise.all(
        items.map(async (it) => {
          const optimized = await compressImage(it.file);
          const blob = await upload(optimized.name, optimized, {
            access: "public",
            handleUploadUrl: "/api/upload",
          });
          return blob.url;
        })
      );
    } catch (err) {
      setUploading(false);
      setError((err as Error).message || "Upload failed. Try again.");
      return;
    }
    setUploading(false);

    start(async () => {
      const res = await createPost({ day: dayKey, time, caption, imageUrls: urls });
      if (res?.error) {
        setError(res.error);
      } else if (res?.held) {
        alert("Posted! Your first post is held for review — it'll appear once you're approved.");
        onClose();
      } else {
        onClose();
      }
    });
  }

  const busy = uploading || pending;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="card-pop max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-4xl bg-white p-5 sm:rounded-4xl animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">
            New post · <span className={`text-${color}`}>{dayLabel}</span>
          </h2>
          <button onClick={onClose} className="text-2xl leading-none text-ink/40 hover:text-ink">
            ✕
          </button>
        </div>

        {/* time */}
        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/50">
          When did this happen?
        </label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mb-4 rounded-xl border-2 border-ink px-3 py-2 font-display text-lg font-semibold"
        />

        {/* photos */}
        {items.length > 0 && (
          <div className="mb-3 grid grid-cols-3 gap-2">
            {items.map((it, idx) => (
              <div key={idx} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.preview} alt="" className="aspect-square w-full rounded-xl border-2 border-ink object-cover" />
                <button
                  onClick={() => remove(idx)}
                  className="absolute -right-1.5 -top-1.5 grid h-6 w-6 place-items-center rounded-full border-2 border-ink bg-figred text-xs font-bold text-white"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {items.length < 10 && (
          <button
            onClick={() => fileRef.current?.click()}
            className="mb-4 w-full rounded-2xl border-2 border-dashed border-ink/40 py-4 text-sm font-semibold text-ink/60 hover:border-ink hover:bg-figyellow/20"
          >
            📷 Add photos {items.length > 0 && `(${items.length}/10)`}
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={onPick} />

        {/* caption */}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="What happened? Share the moment…"
          rows={3}
          className="mb-4 w-full resize-none rounded-2xl border-2 border-ink px-3 py-2 outline-none focus:bg-figyellow/10"
        />

        {error && <p className="mb-3 text-sm font-semibold text-figred">{error}</p>}

        <button
          onClick={post}
          disabled={busy}
          className={`card-pop-sm w-full rounded-2xl bg-${color} py-3 font-display text-lg font-bold text-ink disabled:opacity-50`}
        >
          {uploading ? "Optimizing & uploading…" : pending ? "Posting…" : "Post it"}
        </button>
      </div>
    </div>
  );
}
