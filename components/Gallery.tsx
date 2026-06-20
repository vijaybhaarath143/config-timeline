"use client";

import { useEffect, useState } from "react";

type Img = { id: string; url: string };

export function Gallery({
  images,
  startIndex,
  onClose,
}: {
  images: Img[];
  startIndex: number;
  onClose: () => void;
}) {
  const [i, setI] = useState(startIndex);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setI((p) => (p + 1) % images.length);
      if (e.key === "ArrowLeft") setI((p) => (p - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [images.length, onClose]);

  const next = () => setI((p) => (p + 1) % images.length);
  const prev = () => setI((p) => (p - 1 + images.length) % images.length);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-ink/95 p-4 backdrop-blur"
      onClick={onClose}
    >
      <div className="flex items-center justify-between text-white">
        <span className="font-display font-semibold">
          {i + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="rounded-full border-2 border-white/40 px-3 py-1 text-sm font-semibold hover:bg-white/10"
        >
          Close ✕
        </button>
      </div>

      <div className="relative flex flex-1 items-center justify-center" onClick={(e) => e.stopPropagation()}>
        {images.length > 1 && (
          <button
            onClick={prev}
            aria-label="Previous"
            className="absolute left-0 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
          >
            ‹
          </button>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[i].url}
          alt=""
          className="max-h-[80vh] max-w-full rounded-2xl object-contain"
        />
        {images.length > 1 && (
          <button
            onClick={next}
            aria-label="Next"
            className="absolute right-0 grid h-12 w-12 place-items-center rounded-full bg-white/15 text-2xl text-white hover:bg-white/25"
          >
            ›
          </button>
        )}
      </div>

      {images.length > 1 && (
        <div className="no-scrollbar mt-3 flex justify-center gap-2 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setI(idx)}
              className={`h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 ${
                idx === i ? "border-figyellow" : "border-white/20"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
