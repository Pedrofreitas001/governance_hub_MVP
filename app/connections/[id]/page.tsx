import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { READ_ONLY_POLICY } from "@/lib/connection-policy";
import { ConnectionPreview } from "@/components/ConnectionPreview";
import { SyncButton, TestButton } from "@/components/ConnectionActions";
import { OpenRouterTest } from "@/components/OpenRouterTest";

const REQUESTS: Record<string, string[]> = {
  vtex: ["GET /api/oms/pvt/orders", "GET /api/catalog_system/pub/products/search"],
  zendesk: ["GET /api/v2/tickets/count.json", "GET /api/v2/tickets.json"],
  powerbi: ["GET /v1.0/myorg/groups/{workspaceId}/reports", "GET /v1.0/myorg/groups/{workspaceId}/datasets"],
  supabase: ["GET /rest/v1/ (Data API; RLS aplicado)"],
  openrouter: ["GET /api/v1/models"],
  ads: ["Amostra interna de campanhas (demo)"],
};

export default async function ConnectionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const db = getDb();
  const conn = db.prepare("SELECT * FROM connections WHERE id = ? AND workspace_id = 1").get(Number(id)) as { id: number; nome: string; tipo: string; status: string; config: string; ultima_sincronizacao: string | null } | undefined;
  if (!conn) notFound();
  const config = JSON.parse(conn.config ?? "{}"); delete config.demo;
  return <div className="space-y-5 max-w-5xl">
    <Link href="/connections" className="text-[13px] text-[var(--brand)] hover:underline">← Conexões</Link>
    <header className="flex items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold">{conn.nome}</h1><p className="text-sm text-[var(--ink-2)] mt-1">{conn.tipo} · status: {conn.status} · última sincronização: {conn.ultima_sincronizacao?.slice(0, 16) ?? "nunca"}</p></div><div className="flex gap-2"><TestButton connectionId={conn.id} /><SyncButton connectionId={conn.id} /></div></header>
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5"><h2 className="font-medium text-emerald-900">Modo somente leitura</h2><p className="text-sm text-emerald-800 mt-1">{READ_ONLY_POLICY.notice} Os únicos endpoints externos permitidos são consultas GET. A troca de token do Power BI ocorre somente no provedor de identidade.</p></section>
    <div className="grid md:grid-cols-2 gap-5"><section className="rounded-xl border border-black/10 bg-white p-5"><h2 className="font-medium mb-3">Configuração da conexão</h2><dl className="space-y-2 text-sm">{Object.entries(config).filter(([k]) => k !== "demo").map(([key, value]) => <div key={key} className="flex justify-between gap-4"><dt className="text-[var(--ink-muted)]">{key}</dt><dd className="font-mono text-right break-all">{String(value)}</dd></div>)}</dl><p className="text-[12px] text-[var(--ink-muted)] mt-4">Segredos não são exibidos aqui e só podem ser consultados de forma mascarada e auditada.</p></section><section className="rounded-xl border border-black/10 bg-white p-5"><h2 className="font-medium mb-3">Requisições permitidas</h2><ul className="space-y-2 text-sm font-mono">{(REQUESTS[conn.tipo] ?? []).map((request) => <li key={request} className="rounded bg-black/5 px-2 py-1.5">{request}</li>)}</ul><p className="text-[12px] text-[var(--ink-muted)] mt-4">Não há campo para URL livre, evitando SSRF e chamadas fora do escopo.</p></section></div>
    {conn.tipo === "openrouter" && <OpenRouterTest connectionId={conn.id} />}
    <ConnectionPreview connectionId={conn.id} />
  </div>;
}
