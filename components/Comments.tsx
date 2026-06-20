"use client";

import { useState, useTransition } from "react";
import type { CommentView } from "./types";
import { addComment, editComment, deleteComment } from "@/app/actions/comments";

export function Comments({
  postId,
  comments,
  canInteract,
}: {
  postId: string;
  comments: CommentView[];
  canInteract: boolean;
}) {
  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    if (!draft.trim()) return;
    setError(null);
    start(async () => {
      const res = await addComment(postId, draft);
      if (res?.error) setError(res.error);
      else setDraft("");
    });
  }

  function saveEdit(id: string) {
    start(async () => {
      const res = await editComment(id, editText);
      if (res?.error) setError(res.error);
      else setEditingId(null);
    });
  }

  return (
    <div className="mt-3 border-t-2 border-dashed border-ink/15 pt-3">
      {comments.length > 0 && (
        <ul className="mb-3 space-y-2">
          {comments.map((c) => (
            <li key={c.id} className="flex gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.authorImage ?? "/avatar.svg"}
                alt=""
                className="h-7 w-7 shrink-0 rounded-full border-2 border-ink object-cover"
              />
              <div className="min-w-0 flex-1">
                {editingId === c.id ? (
                  <div className="flex gap-2">
                    <input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="flex-1 rounded-lg border-2 border-ink px-2 py-1 text-sm"
                    />
                    <button onClick={() => saveEdit(c.id)} className="text-sm font-semibold text-figblue">
                      Save
                    </button>
                    <button onClick={() => setEditingId(null)} className="text-sm text-ink/50">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="rounded-2xl rounded-tl-sm bg-ink/[0.04] px-3 py-1.5">
                    <span className="mr-1 text-sm font-bold">{c.authorName}</span>
                    <span className="text-sm">{c.body}</span>
                    {c.edited && <span className="ml-1 text-[11px] text-ink/40">(edited)</span>}
                  </div>
                )}
                {(c.mine || c.canDelete) && editingId !== c.id && (
                  <div className="mt-0.5 flex gap-3 pl-1 text-[11px] font-semibold text-ink/45">
                    {c.mine && (
                      <button
                        onClick={() => {
                          setEditingId(c.id);
                          setEditText(c.body);
                        }}
                      >
                        Edit
                      </button>
                    )}
                    {c.canDelete && (
                      <button
                        onClick={() => start(async () => void (await deleteComment(c.id)))}
                        className="text-figred"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {canInteract ? (
        <div className="flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Add a quick comment…"
            maxLength={500}
            className="flex-1 rounded-xl border-2 border-ink px-3 py-1.5 text-sm outline-none focus:bg-figyellow/20"
          />
          <button
            onClick={submit}
            disabled={pending || !draft.trim()}
            className="card-pop-sm rounded-xl bg-figblue px-3 py-1.5 text-sm font-bold text-white disabled:opacity-40"
          >
            Send
          </button>
        </div>
      ) : (
        <p className="text-xs text-ink/45">Sign in to join the conversation.</p>
      )}
      {error && <p className="mt-1 text-xs font-semibold text-figred">{error}</p>}
    </div>
  );
}
