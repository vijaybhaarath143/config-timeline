"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/app/actions/profile";

export function PrivacyToggle({ isPublic, bio }: { isPublic: boolean; bio: string }) {
  const [pub, setPub] = useState(isPublic);
  const [pending, start] = useTransition();

  function toggle() {
    const next = !pub;
    setPub(next); // optimistic
    start(async () => {
      const res = await updateProfile({ bio, isPublic: next });
      if (res?.error) setPub(!next); // revert on failure
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      title="Toggle who can see your profile"
      className={`card-pop-sm rounded-full border-2 border-ink px-3 py-1 text-xs font-bold disabled:opacity-50 ${
        pub ? "bg-figgreen text-ink" : "bg-figpurple text-white"
      }`}
    >
      {pub ? "🌍 Public" : "🔒 Private"} · tap to switch
    </button>
  );
}
