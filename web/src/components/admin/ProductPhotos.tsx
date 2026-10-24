"use client";

import { useEffect, useRef, useState } from "react";
import { MAX_PRODUCT_PHOTOS } from "@/lib/photos";

type Pending = { id: string; preview: string };

export function ProductPhotos({
  images,
  onChange,
}: {
  images: string[];
  onChange: (images: string[]) => void;
}) {
  const [busy, setBusy] = useState(0);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<Pending[]>([]);
  const imagesRef = useRef(images);
  const pendingRef = useRef(pending);
  imagesRef.current = images;
  pendingRef.current = pending;
  const room = MAX_PRODUCT_PHOTOS - images.length - pending.length;

  useEffect(() => {
    return () => {
      pendingRef.current.forEach((item) => URL.revokeObjectURL(item.preview));
    };
  }, []);

  function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= images.length) return;
    const copy = [...images];
    const [item] = copy.splice(index, 1);
    copy.splice(next, 0, item);
    onChange(copy);
  }

  async function addFiles(list: FileList | null, input: HTMLInputElement) {
    const files = Array.from(list || []);
    input.value = "";
    if (!files.length) return;
    if (room < 1) {
      setError("This product already has 3 photos.");
      return;
    }
    const accepted = files.filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);
    const skipped = files.length - accepted.length;
    const batch = accepted.slice(0, room);
    const extra = accepted.length - batch.length;
    if (!batch.length) {
      setError("Choose a JPG, PNG or WEBP image under 5 MB.");
      return;
    }
    if (skipped || extra) {
      setError(
        extra
          ? `Only ${room} more photo${room === 1 ? "" : "s"} can be added.`
          : "A file was skipped. Use JPG, PNG or WEBP under 5 MB.",
      );
    } else {
      setError("");
    }

    const previews = batch.map((file) => ({ id: `${file.name}-${file.size}-${Math.random()}`, preview: URL.createObjectURL(file) }));
    setPending((current) => [...current, ...previews]);
    setBusy((count) => count + batch.length);

    const uploaded: string[] = [];
    for (let i = 0; i < batch.length; i++) {
      const file = batch[i];
      const fd = new FormData();
      fd.set("folder", "products");
      fd.set("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd, cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      setPending((current) => {
        const gone = current.find((item) => item.id === previews[i].id);
        if (gone) URL.revokeObjectURL(gone.preview);
        return current.filter((item) => item.id !== previews[i].id);
      });
      setBusy((count) => Math.max(0, count - 1));
      if (!res.ok || typeof data.url !== "string" || !data.url) {
        setError(data.error || `Could not upload ${file.name}`);
        continue;
      }
      uploaded.push(data.url);
    }
    if (uploaded.length) {
      onChange([...imagesRef.current, ...uploaded].slice(0, MAX_PRODUCT_PHOTOS));
    }
  }

  return (
    <div className="photos">
      <label>Photos</label>
      <p className="hint">
        Add up to 3. Photo 1 is the cover on category cards. Use the arrows to change the order.
        {busy ? ` Uploading ${busy}…` : ` ${images.length} of ${MAX_PRODUCT_PHOTOS}.`}
      </p>
      <div className="photo-grid">
        {images.map((url, index) => (
          <article className="photo-card" key={`${url}-${index}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={`Product photo ${index + 1}`} />
            <div className="photo-meta">
              <b>{index === 0 ? "Cover" : `Photo ${index + 1}`}</b>
              <div className="photo-actions">
                <button className="btn g" type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`Move photo ${index + 1} earlier`}>
                  ←
                </button>
                <button
                  className="btn g"
                  type="button"
                  disabled={index === images.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label={`Move photo ${index + 1} later`}
                >
                  →
                </button>
                <button className="btn d" type="button" onClick={() => onChange(images.filter((_, i) => i !== index))}>
                  Remove
                </button>
              </div>
            </div>
          </article>
        ))}
        {pending.map((item) => (
          <article className="photo-card" key={item.id}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={item.preview} alt="" />
            <div className="photo-meta">
              <b>Uploading…</b>
            </div>
          </article>
        ))}
        {room > 0 && busy === 0 ? (
          <label className="photo-add">
            <b>Add photo{room > 1 ? "s" : ""}</b>
            <span>{room} remaining · JPG, PNG or WEBP · 5 MB</span>
            <input
              type="file"
              accept="image/*"
              multiple
              aria-label="Add product photos"
              onChange={(e) => addFiles(e.target.files, e.currentTarget)}
            />
          </label>
        ) : null}
      </div>
      {error ? <p className="err">{error}</p> : null}
    </div>
  );
}
