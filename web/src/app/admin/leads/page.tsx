"use client";

import { useCallback, useEffect, useState } from "react";

type LeadRow = {
  id: string;
  name: string;
  contact: string;
  interest: string;
  notes?: string | null;
  fileUrl?: string | null;
  kind?: string;
  when: string;
  status: string;
};

const STATUSES = ["New", "Contacted", "Won", "Lost"] as const;

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
  const [tab, setTab] = useState<"inquiry" | "custom">("inquiry");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/leads");
    if (res.ok) setLeads(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function setStatus(id: string, status: string) {
    const res = await fetch("/api/admin/leads", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (res.ok) setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
  }

  const shown = leads.filter((l) => (tab === "custom" ? l.kind === "custom" || !!l.fileUrl : l.kind !== "custom" && !l.fileUrl));

  if (loading) return <h1>Leads</h1>;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Leads</h1>
          <p className="lead">Requests from the homepage, and custom orders with design files.</p>
        </div>
      </div>
      <div className="tabs">
        <button type="button" className={tab === "inquiry" ? "on" : ""} onClick={() => setTab("inquiry")}>
          Requests
        </button>
        <button type="button" className={tab === "custom" ? "on" : ""} onClick={() => setTab("custom")}>
          Custom orders
        </button>
      </div>
      {shown.length === 0 ? (
        <div className="bx empty">Nothing here yet.</div>
      ) : (
        <div className="stack">
          {shown.map((l) => (
            <article key={l.id} className="lead-card">
              <div>
                <b>{l.name}</b>
                <p>{l.contact}</p>
                <p>{l.interest}</p>
                {l.notes ? <p className="hint">{l.notes}</p> : null}
                {l.fileUrl ? (
                  <a href={l.fileUrl} target="_blank" rel="noreferrer">
                    Download design file
                  </a>
                ) : null}
              </div>
              <div>
                <span className="hint">{l.when}</span>
                <select value={l.status} aria-label={`Status for ${l.name}`} onChange={(e) => setStatus(l.id, e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
