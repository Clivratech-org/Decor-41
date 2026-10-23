"use client";

import { useState } from "react";

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

  async function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Choose a JPG, PNG or WEBP image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be under 5 MB");
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
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    onChange(data.url);
    setLocalPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return "";
    });
  }

  return (
    <div className="upload">
      <label>{label}</label>
      <div className="upload-row">
        <div className="preview">
          {localPreview || value ? <img src={localPreview || value} alt="" /> : <span>No image yet</span>}
        </div>
        <div>
          <input
            type="file"
            accept="image/*"
            aria-label={label}
            disabled={busy}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <p className="hint">{busy ? "Uploading…" : "JPG, PNG or WEBP. Up to 5 MB."}</p>
          {value ? (
            <button
              className="btn g"
              type="button"
              onClick={() => {
                setLocalPreview((prev) => {
                  if (prev) URL.revokeObjectURL(prev);
                  return "";
                });
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
