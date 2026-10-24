"use client";

import { useEffect, useState } from "react";

export function ImageField({
  label,
  folder,
  value,
  onChange,
}: {
  label: string;
  folder: "products" | "categories";
  value: string;
  onChange: (url: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [localPreview, setLocalPreview] = useState("");

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  function clearLocal() {
    setLocalPreview("");
  }

  async function onFile(file: File | undefined, input: HTMLInputElement) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose a JPG, PNG or WEBP image");
      input.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
      input.value = "";
      return;
    }
    const preview = URL.createObjectURL(file);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return preview;
    });
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.set("folder", folder);
    fd.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd, cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    input.value = "";
    if (!res.ok || typeof data.url !== "string" || !data.url) {
      setError(data.error || "Upload failed");
      return;
    }
    const uploaded = `${data.url}${data.url.includes("?") ? "&" : "?"}v=${Date.now()}`;
    const probe = new Image();
    probe.onload = () => {
      onChange(data.url);
      clearLocal();
    };
    probe.onerror = () => {
      setError("The upload finished, but the new image did not load. Try again.");
    };
    probe.src = uploaded;
  }

  const shown = localPreview || value;

  return (
    <div className="upload">
      <label>{label}</label>
      <div className="upload-row">
        <div className="preview" aria-hidden={!shown}>
          {shown ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={shown} alt="" />
          ) : (
            <span>No image yet</span>
          )}
        </div>
        <div className="upload-copy">
          <input
            type="file"
            accept="image/*"
            aria-label={label}
            disabled={busy}
            onChange={(e) => onFile(e.target.files?.[0], e.currentTarget)}
          />
          <p className="hint">{busy ? "Uploading…" : "JPG, PNG or WEBP. Up to 5 MB."}</p>
          {value ? (
            <button
              className="btn g"
              type="button"
              onClick={() => {
                clearLocal();
                onChange("");
              }}
            >
              Remove image
            </button>
          ) : null}
          {error ? <p className="err">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
