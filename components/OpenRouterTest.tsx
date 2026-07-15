"use client";
import { useState } from "react";

export function OpenRouterTest({ connectionId }: { connectionId: number }) {
  const [result, setResult] = useState(""); const [loading, setLoading] = useState(false);
  async function run() { setLoading(true); setResult(""); const res = await fetch(`/api/connections/${connectionId}/ai-test`, { method: "POST" }); const data = await res.json(); setLoading(false); setResult(res.ok ? `${data.model}: ${data.answer}` : data.error ?? "Teste falhou."); }
  return <section className="rounded-xl border border-violet-200 bg-violet-50 p-5"><div className="flex items-center justify-between gap-3"><div><h2 className="font-medium text-violet-950">Teste de agente</h2><p className="text-[12.5px] text-violet-800">Envia uma única mensagem curta pelo servidor. A chave não sai do Vault; uso e resultado ficam auditados.</p></div><button onClick={run} disabled={loading} className="rounded-lg bg-violet-700 text-white px-3.5 py-2 text-sm disabled:opacity-50">{loading ? "Consultando…" : "Executar teste"}</button></div>{result && <p className="mt-3 text-sm text-violet-950 whitespace-pre-wrap">{result}</p>}</section>;
}
