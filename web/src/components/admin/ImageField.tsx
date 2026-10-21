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

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError("");
    const fd = new FormData();
    fd.set("folder", folder);
    fd.set("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Upload failed");
      return;
    }
    onChange(data.url);
  }

  return (
    <div className="upload">
      <label>{label}</label>
      <div className="upload-row">
        <div className="preview">{value ? <img src={value} alt="" /> : <span>No image yet</span>}</div>
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
            <button className="btn g" type="button" onClick={() => onChange("")}>
              Remove image
            </button>
          ) : null}
          {error ? <p className="err">{error}</p> : null}
        </div>
      </div>
    </div>
  );
}
