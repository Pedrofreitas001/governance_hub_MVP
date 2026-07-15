import { NextResponse } from "next/server";
import { getDb, audit } from "@/lib/db";
import { decrypt } from "@/lib/vault";
import { getCurrentUser } from "@/lib/auth";

/** A deliberately small, audited model invocation. API keys never reach the browser. */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params; const db = getDb(); const user = await getCurrentUser();
  const conn = db.prepare("SELECT id, nome, tipo FROM connections WHERE id = ? AND workspace_id = 1").get(Number(id)) as { id: number; nome: string; tipo: string } | undefined;
  if (!conn || conn.tipo !== "openrouter") return NextResponse.json({ error: "Conexão OpenRouter não encontrada." }, { status: 404 });
  const cred = db.prepare("SELECT valor_criptografado FROM credentials WHERE connection_id = ? ORDER BY id DESC LIMIT 1").get(conn.id) as { valor_criptografado: string } | undefined;
  if (!cred) return NextResponse.json({ error: "Nenhuma chave cadastrada." }, { status: 400 });
  const apiKey = (JSON.parse(decrypt(cred.valor_criptografado)) as { apiKey: string }).apiKey;
  audit(user.nome, "vault.read", `Credencial ${conn.nome}`, "Leitura para teste controlado de IA.");
  const model = process.env.OPENROUTER_MODEL || "openai/gpt-4o-mini";
  try {
    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json", "X-OpenRouter-Metadata": "enabled" },
      body: JSON.stringify({ model, max_tokens: 40, messages: [{ role: "user", content: "Responda apenas: conexão do Governance Hub validada." }] }),
      signal: AbortSignal.timeout(20_000),
    });
    const data = await res.json().catch(() => ({})) as { choices?: { message?: { content?: string } }[]; error?: { message?: string } };
    if (!res.ok) throw new Error(data.error?.message ?? `OpenRouter respondeu HTTP ${res.status}`);
    const answer = data.choices?.[0]?.message?.content?.trim() || "Resposta vazia";
    audit(user.nome, "ai.connection_test", conn.nome, `Teste do modelo ${model} concluído.`);
    return NextResponse.json({ ok: true, model, answer });
  } catch (e) {
    audit(user.nome, "ai.connection_test_failed", conn.nome, `Falha: ${(e as Error).message}`);
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 502 });
  }
}
