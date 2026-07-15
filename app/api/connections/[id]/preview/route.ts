import { NextResponse } from "next/server";
import { getDb, maskCpf, maskEmail } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

const SOURCE_TABLE: Record<string, string> = { vtex: "vtex_orders", zendesk: "zendesk_tickets", powerbi: "powerbi_reports", ads: "marketing_campaigns" };

/** Returns a redacted sample from the local read-model. It never sends an arbitrary request to an external app. */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  await getCurrentUser();
  const { id } = await ctx.params;
  const db = getDb();
  const conn = db.prepare("SELECT id, tipo, nome FROM connections WHERE id = ? AND workspace_id = 1").get(Number(id)) as { id: number; tipo: string; nome: string } | undefined;
  if (!conn) return NextResponse.json({ error: "Conexão não encontrada." }, { status: 404 });
  const table = SOURCE_TABLE[conn.tipo];
  if (!table) return NextResponse.json({ rows: [], note: "Este conector não possui amostra tabular." });
  const rows = db.prepare(`SELECT * FROM ${table} WHERE connection_id = ? LIMIT 10`).all(conn.id) as Record<string, unknown>[];
  const safeRows = rows.map((row) => Object.fromEntries(Object.entries(row).map(([key, value]) => {
    if (key.includes("email") && typeof value === "string") return [key, maskEmail(value)];
    if (key.includes("cpf") && typeof value === "string") return [key, maskCpf(value)];
    return [key, value];
  })));
  return NextResponse.json({ rows: safeRows, note: "Amostra do espelho local, com PII mascarada." });
}
