"use client";

import { useState, useTransition } from "react";
import { createProfile } from "@/app/actions/profile";

export function OnboardingForm({
  defaultName,
  image,
}: {
  defaultName: string;
  image: string | null;
}) {
  const [name, setName] = useState(defaultName);
  const [bio, setBio] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function submit() {
    setError(null);
    if (!name.trim()) {
      setError("Please add your name.");
      return;
    }
    start(async () => {
      const res = await createProfile({ name, bio, isPublic });
      // success path redirects server-side; only errors return here
      if (res?.error) setError(res.error);
    });
  }

  return (
    <div className="card-pop w-full max-w-md rounded-4xl bg-white p-6">
      <div className="mb-5 flex items-center gap-3">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image ?? "/avatar.svg"}
          alt=""
          className="h-14 w-14 rounded-full border-2 border-ink object-cover"
        />
        <div>
          <h1 className="font-display text-2xl font-bold leading-none">Create your profile</h1>
          <p className="text-sm font-semibold text-ink/50">This becomes your Config timeline</p>
        </div>
      </div>

      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/50">
        Your name
      </label>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={60}
        placeholder="e.g. Vishal Kumar"
        className="mb-4 w-full rounded-xl border-2 border-ink px-3 py-2 font-display text-lg font-semibold outline-none focus:bg-figyellow/15"
      />

      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/50">
        A short bio <span className="font-medium normal-case text-ink/40">(optional)</span>
      </label>
      <textarea
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        rows={2}
        maxLength={280}
        placeholder="Designer at … · here for the talks & the parties ✦"
        className="mb-4 w-full resize-none rounded-xl border-2 border-ink px-3 py-2 outline-none focus:bg-figyellow/10"
      />

      <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/50">
        Profile visibility
      </label>
      <div className="mb-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setIsPublic(true)}
          className={`rounded-xl border-2 border-ink p-3 text-left text-sm font-bold ${
            isPublic ? "bg-figgreen" : "bg-white"
          }`}
        >
          🌍 Public
          <span className="block text-xs font-medium text-ink/60">Anyone can view</span>
        </button>
        <button
          type="button"
          onClick={() => setIsPublic(false)}
          className={`rounded-xl border-2 border-ink p-3 text-left text-sm font-bold ${
            !isPublic ? "bg-figpurple text-white" : "bg-white"
          }`}
        >
          🔒 Private
          <span className={`block text-xs font-medium ${!isPublic ? "text-white/70" : "text-ink/60"}`}>
            Only you can see it
          </span>
        </button>
      </div>

      {error && <p className="mb-3 text-sm font-semibold text-figred">{error}</p>}

      <button
        onClick={submit}
        disabled={pending}
        className="card-pop-sm w-full rounded-2xl bg-ink py-3 font-display text-lg font-bold text-white disabled:opacity-50"
      >
        {pending ? "Creating…" : "Create my profile →"}
      </button>
    </div>
  );
}
