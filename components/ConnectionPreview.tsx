"use client";

import { useState } from "react";

export function ConnectionPreview({ connectionId }: { connectionId: number }) {
  const [rows, setRows] = useState<Record<string, unknown>[] | null>(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function load() {
    setLoading(true); setError("");
    const res = await fetch(`/api/connections/${connectionId}/preview`);
    const data = await res.json(); setLoading(false);
    if (!res.ok) { setError(data.error ?? "Não foi possível carregar a amostra."); return; }
    setRows(data.rows ?? []); setNote(data.note ?? "");
  }
  const columns = rows?.[0] ? Object.keys(rows[0]) : [];
  return <section className="rounded-xl border border-black/10 bg-white p-5 space-y-3">
    <div className="flex items-center justify-between gap-3"><div><h2 className="font-medium">Dados recebidos</h2><p className="text-[12.5px] text-[var(--ink-muted)]">A consulta usa somente o espelho local; dados pessoais permanecem mascarados.</p></div><button onClick={load} disabled={loading} className="rounded-lg bg-[var(--brand)] text-white px-3.5 py-2 text-sm disabled:opacity-50">{loading ? "Carregando…" : "Ver amostra"}</button></div>
    {error && <p className="text-sm text-red-600">{error}</p>}
    {rows && (rows.length ? <div className="overflow-x-auto"><table className="w-full text-left text-[12px]"><thead><tr>{columns.map((c) => <th key={c} className="border-b border-black/10 px-2 py-2 font-medium whitespace-nowrap">{c}</th>)}</tr></thead><tbody>{rows.map((r, i) => <tr key={i}>{columns.map((c) => <td key={c} className="border-b border-black/5 px-2 py-2 whitespace-nowrap max-w-48 truncate">{String(r[c] ?? "—")}</td>)}</tr>)}</tbody></table></div> : <p className="text-sm text-[var(--ink-muted)]">Nenhum dado importado ainda. Faça uma sincronização de leitura.</p>)}
    {note && <p className="text-[12px] text-[var(--ink-muted)]">{note}</p>}
  </section>;
}
