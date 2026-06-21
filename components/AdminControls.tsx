"use client";

import { useTransition } from "react";
import { deleteUser, setPostHidden } from "@/app/actions/admin";

function Btn({
  onClick,
  className,
  children,
  confirm: confirmMsg,
}: {
  onClick: () => Promise<unknown>;
  className: string;
  children: React.ReactNode;
  confirm?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => {
        if (confirmMsg && !confirm(confirmMsg)) return;
        start(async () => void (await onClick()));
      }}
      className={`card-pop-sm rounded-lg px-2.5 py-1 text-xs font-bold disabled:opacity-40 ${className}`}
    >
      {children}
    </button>
  );
}

export function UserActions({ userId, isSelf }: { userId: string; isSelf: boolean }) {
  if (isSelf) return <span className="text-xs font-semibold text-ink/40">you</span>;
  return (
    <Btn
      onClick={() => deleteUser(userId)}
      className="bg-figred text-white"
      confirm="Permanently delete this person and ALL their posts & comments? This cannot be undone."
    >
      Delete
    </Btn>
  );
}

export function PostModeration({ postId, hidden }: { postId: string; hidden: boolean }) {
  return (
    <Btn
      onClick={() => setPostHidden(postId, !hidden)}
      className={hidden ? "bg-figgreen text-ink" : "bg-figorange text-ink"}
    >
      {hidden ? "Unhide" : "Hide"}
    </Btn>
  );
}
