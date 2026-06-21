"use client";

import { useState, useTransition } from "react";
import type { PostView } from "./types";
import { Gallery } from "./Gallery";
import { Comments } from "./Comments";
import { deletePost, editPost } from "@/app/actions/posts";

export function PostCard({
  post,
  accent,
  canInteract,
}: {
  post: PostView;
  accent: string; // tailwind colour token, e.g. "figblue"
  canInteract: boolean;
}) {
  const [galleryAt, setGalleryAt] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [caption, setCaption] = useState(post.caption);
  const [time, setTime] = useState(post.timeValue);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const imgs = post.images;

  function saveEdit() {
    setError(null);
    start(async () => {
      const res = await editPost(post.id, { caption, time });
      if (res?.error) setError(res.error);
      else setEditing(false);
    });
  }

  return (
    <article className={`card-pop relative rounded-4xl bg-white p-4 ${post.held ? "ring-4 ring-figyellow/60" : ""}`}>
      {/* time bubble on the spine side */}
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.authorImage ?? "/avatar.svg"}
            alt=""
            className="h-9 w-9 rounded-full border-2 border-ink object-cover"
          />
          <div className="leading-tight">
            <div className="text-sm font-bold">{post.authorName}</div>
            <div className={`text-xs font-semibold text-${accent}`}>{post.timeLabel}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {post.canEdit && !editing && (
            <button
              onClick={() => setEditing(true)}
              disabled={pending}
              className="text-xs font-semibold text-ink/40 hover:text-figblue"
            >
              Edit
            </button>
          )}
          {post.canDelete && !editing && (
            <button
              onClick={() => {
                if (confirm("Delete this post?")) start(async () => void (await deletePost(post.id)));
              }}
              disabled={pending}
              className="text-xs font-semibold text-ink/40 hover:text-figred"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      {editing ? (
        <div className="mb-3 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-ink/50">Time</span>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="rounded-lg border-2 border-ink px-2 py-1 font-display font-semibold"
            />
          </div>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border-2 border-ink px-3 py-2 text-[15px] outline-none focus:bg-figyellow/10"
          />
          {error && <p className="text-xs font-semibold text-figred">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              disabled={pending}
              className="card-pop-sm rounded-xl bg-figblue px-3 py-1.5 text-sm font-bold text-white disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setCaption(post.caption);
                setTime(post.timeValue);
                setError(null);
              }}
              className="rounded-xl px-3 py-1.5 text-sm font-semibold text-ink/50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        post.caption && <p className="mb-3 whitespace-pre-wrap text-[15px] leading-snug">{post.caption}</p>
      )}

      {imgs.length > 0 && (
        <div
          className={`grid gap-1.5 overflow-hidden rounded-2xl ${
            imgs.length === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {imgs.slice(0, 4).map((img, idx) => {
            const isLastTile = idx === 3 && imgs.length > 4;
            return (
              <button
                key={img.id}
                onClick={() => setGalleryAt(idx)}
                className={`relative ${imgs.length === 3 && idx === 0 ? "col-span-2" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.url}
                  alt=""
                  className="aspect-[4/3] h-full w-full object-cover transition hover:opacity-90"
                />
                {isLastTile && (
                  <span className="absolute inset-0 grid place-items-center bg-ink/55 text-2xl font-bold text-white">
                    +{imgs.length - 4}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      <Comments postId={post.id} comments={post.comments} canInteract={canInteract} />

      {galleryAt !== null && (
        <Gallery images={imgs} startIndex={galleryAt} onClose={() => setGalleryAt(null)} />
      )}
    </article>
  );
}
