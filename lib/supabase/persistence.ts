import { getSupabaseAdmin } from "./server";

function workspaceId() { return process.env.SUPABASE_WORKSPACE_ID; }

/** Best-effort mirror: local MVP keeps working if Supabase is temporarily unavailable. */
export async function mirrorAuditLog(input: { action: string; target: string; detail?: string; actorName: string }) {
  const client = getSupabaseAdmin(); const workspace_id = workspaceId();
  if (!client || !workspace_id) return;
  const { error } = await client.from("audit_logs").insert({ workspace_id, action: input.action, target: input.target, detail: input.detail ?? null });
  if (error) console.error("Supabase audit mirror failed", error.message);
}

export async function mirrorConnection(input: { localId: number; type: string; name: string; status: string; config: Record<string, string>; encryptedSecret: string }) {
  const client = getSupabaseAdmin(); const workspace_id = workspaceId();
  if (!client || !workspace_id) return;
  const { error } = await client.from("connections").insert({
    workspace_id, type: input.type, name: input.name, status: input.status, read_only: true,
    config: { ...input.config, local_connection_id: input.localId }, encrypted_secret: input.encryptedSecret,
  });
  if (error) console.error("Supabase connection mirror failed", error.message);
}
