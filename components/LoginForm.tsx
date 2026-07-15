"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/browser";

export default function LoginForm({ configured }: { configured: boolean }) {
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [message, setMessage] = useState(""); const [loading, setLoading] = useState(false);
  async function signIn(e: React.FormEvent) {
    e.preventDefault(); setLoading(true); setMessage("");
    try {
      const { error } = await getSupabaseBrowser().auth.signInWithPassword({ email, password });
      setMessage(error ? error.message : "Login confirmado. A sessão Supabase está ativa neste navegador.");
    } catch (error) { setMessage((error as Error).message); }
    setLoading(false);
  }
  return <form onSubmit={signIn} className="rounded-xl border border-black/10 bg-white p-6 space-y-4 max-w-md">
    <label className="block text-sm"><span className="text-[var(--ink-2)]">E-mail</span><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-1 w-full rounded-lg border border-black/12 px-3 py-2" placeholder="voce@empresa.com" /></label>
    <label className="block text-sm"><span className="text-[var(--ink-2)]">Senha</span><input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-1 w-full rounded-lg border border-black/12 px-3 py-2" /></label>
    <button disabled={!configured || loading} className="w-full rounded-lg bg-[var(--brand)] px-4 py-2.5 text-sm font-medium text-white disabled:opacity-40">{loading ? "Entrando…" : "Entrar com Supabase"}</button>
    {!configured && <p className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-[12.5px] text-amber-800">Supabase não configurado neste ambiente. Crie `.env.local` a partir de `.env.example` e reinicie o servidor.</p>}
    {message && <p className="text-sm text-[var(--ink-2)]">{message}</p>}
  </form>;
}
