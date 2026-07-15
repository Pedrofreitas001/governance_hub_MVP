import { NextResponse } from "next/server";

/** Connections and their audit trail are retained; removal is intentionally unavailable. */
export async function DELETE() {
  return NextResponse.json({ error: "Exclusão de conexões está desativada pela política de retenção e segurança." }, { status: 405 });
}
