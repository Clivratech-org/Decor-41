"use client";

import { useCallback, useEffect, useState } from "react";

type LeadRow = {
  id: string;
  name: string;
  contact: string;
  interest: string;
  notes?: string | null;
  fileUrl?: string | null;
  when: string;
  status: string;
};

const STATUSES = ["New", "Contacted", "Won", "Lost"] as const;

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<LeadRow[]>([]);
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
    if (res.ok) {
      setLeads((prev) => prev.map((l) => (l.id === id ? { ...l, status } : l)));
    }
  }

  if (loading) return <h1>Leads</h1>;

  return (
    <>
      <h1>Leads</h1>
      <div className="bx">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Contact</th>
              <th>Interested in</th>
              <th>File</th>
              <th>When</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>
                  {l.name}
                  {l.notes ? (
                    <>
                      <br />
                      <small style={{ color: "var(--mut)" }}>{l.notes}</small>
                    </>
                  ) : null}
                </td>
                <td>{l.contact}</td>
                <td>{l.interest}</td>
                <td>
                  {l.fileUrl ? (
                    <a href={l.fileUrl} target="_blank" rel="noreferrer" style={{ color: "var(--a)" }}>
                      Download
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>{l.when}</td>
                <td>
                  <select
                    value={l.status}
                    onChange={(e) => setStatus(l.id, e.target.value)}
                    aria-label={`Status for ${l.name}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
