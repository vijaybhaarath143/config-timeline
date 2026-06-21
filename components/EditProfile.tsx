"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { updateProfile } from "@/app/actions/profile";
import { compressImage, safeUploadName } from "@/lib/image";

type Props = {
  name: string;
  bio: string;
  isPublic: boolean;
  image: string | null;
};

export function EditProfile(props: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="card-pop-sm rounded-full border-2 border-ink bg-white px-3 py-1 text-xs font-bold"
      >
        ✎ Edit profile
      </button>
      {open && <Modal {...props} onClose={() => setOpen(false)} />}
    </>
  );
}

function Modal({ name, bio, isPublic, image, onClose }: Props & { onClose: () => void }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [n, setN] = useState(name);
  const [b, setB] = useState(bio);
  const [pub, setPub] = useState(isPublic);
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(image);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const objUrlRef = useRef<string | null>(null);

  // Close on Escape; revoke the object-URL preview on unmount.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (objUrlRef.current) URL.revokeObjectURL(objUrlRef.current);
    };
  }, [onClose]);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) {
      if (objUrlRef.current) URL.revokeObjectURL(objUrlRef.current);
      const url = URL.createObjectURL(f);
      objUrlRef.current = url;
      setPhoto(f);
      setPreview(url);
    }
    e.target.value = "";
  }

  async function save() {
    setError(null);
    if (!n.trim()) {
      setError("Name can't be empty.");
      return;
    }
    let imageUrl: string | undefined;
    if (photo) {
      setBusy(true);
      try {
        const optimized = await compressImage(photo, 600);
        const blob = await upload(safeUploadName(optimized.name), optimized, {
          access: "public",
          handleUploadUrl: "/api/upload",
        });
        imageUrl = blob.url;
      } catch (err) {
        setBusy(false);
        setError((err as Error).message || "Photo upload failed.");
        return;
      }
      setBusy(false);
    }
    start(async () => {
      const res = await updateProfile({ name: n, bio: b, isPublic: pub, image: imageUrl });
      if (res?.error) setError(res.error);
      else {
        onClose();
        router.refresh();
      }
    });
  }

  const working = busy || pending;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/60 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div
        className="card-pop max-h-[92vh] w-full max-w-md overflow-y-auto rounded-t-4xl bg-white p-5 animate-pop sm:rounded-4xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">Edit profile</h2>
          <button onClick={onClose} className="text-2xl leading-none text-ink/40 hover:text-ink">✕</button>
        </div>

        {/* photo */}
        <div className="mb-4 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview ?? "/avatar.svg"} alt="" className="h-16 w-16 rounded-full border-2 border-ink object-cover" />
          <button
            onClick={() => fileRef.current?.click()}
            className="card-pop-sm rounded-xl bg-white px-3 py-1.5 text-sm font-semibold"
          >
            Change photo
          </button>
          <input ref={fileRef} type="file" accept="image/*" hidden onChange={pick} />
        </div>

        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/50">Name</label>
        <input
          value={n}
          onChange={(e) => setN(e.target.value)}
          maxLength={60}
          className="mb-4 w-full rounded-xl border-2 border-ink px-3 py-2 font-display text-lg font-semibold outline-none focus:bg-figyellow/15"
        />

        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/50">Bio</label>
        <textarea
          value={b}
          onChange={(e) => setB(e.target.value)}
          rows={2}
          maxLength={280}
          className="mb-4 w-full resize-none rounded-xl border-2 border-ink px-3 py-2 outline-none focus:bg-figyellow/10"
        />

        <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-ink/50">Visibility</label>
        <div className="mb-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPub(true)}
            className={`rounded-xl border-2 border-ink p-3 text-left text-sm font-bold ${pub ? "bg-figgreen" : "bg-white"}`}
          >
            🌍 Public<span className="block text-xs font-medium text-ink/60">Anyone can view</span>
          </button>
          <button
            type="button"
            onClick={() => setPub(false)}
            className={`rounded-xl border-2 border-ink p-3 text-left text-sm font-bold ${!pub ? "bg-figpurple text-white" : "bg-white"}`}
          >
            🔒 Private<span className={`block text-xs font-medium ${!pub ? "text-white/70" : "text-ink/60"}`}>Only you</span>
          </button>
        </div>

        {error && <p className="mb-3 text-sm font-semibold text-figred">{error}</p>}

        <button
          onClick={save}
          disabled={working}
          className="card-pop-sm w-full rounded-2xl bg-ink py-3 font-display text-lg font-bold text-white disabled:opacity-50"
        >
          {busy ? "Uploading photo…" : pending ? "Saving…" : "Save changes"}
        </button>
      </div>
    </div>
  );
}
