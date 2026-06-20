"use client";

import { useTransition } from "react";
import { approveUser, banUser, deleteUser, setPostHidden } from "@/app/actions/admin";

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

export function UserActions({
  userId,
  status,
  isSelf,
}: {
  userId: string;
  status: "PENDING" | "APPROVED" | "BANNED";
  isSelf: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {status !== "APPROVED" && (
        <Btn onClick={() => approveUser(userId)} className="bg-figgreen text-ink">
          Approve
        </Btn>
      )}
      {status !== "BANNED" && !isSelf && (
        <Btn onClick={() => banUser(userId)} className="bg-figorange text-ink" confirm="Ban this user and hide their content?">
          Ban
        </Btn>
      )}
      {!isSelf && (
        <Btn
          onClick={() => deleteUser(userId)}
          className="bg-figred text-white"
          confirm="Permanently delete this user and ALL their posts & comments? This cannot be undone."
        >
          Delete
        </Btn>
      )}
    </div>
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
