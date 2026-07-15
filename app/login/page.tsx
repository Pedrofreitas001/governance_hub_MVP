import LoginForm from "@/components/LoginForm";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export default function LoginPage() {
  const configured = isSupabaseConfigured();
  return <div className="space-y-6"><header><p className="text-[13px] font-medium text-[var(--brand)]">ACESSO SEGURO</p><h1 className="text-2xl font-semibold mt-1">Entrar no Governance Hub</h1><p className="text-sm text-[var(--ink-2)] mt-1 max-w-xl">Use o usuário criado em Supabase Authentication. Credenciais nunca são enviadas ao banco local.</p></header><LoginForm configured={configured} /><p className="text-[12.5px] text-[var(--ink-muted)]">Enquanto o Supabase não estiver configurado, o seletor de usuários demo continua disponível para visualizar o MVP.</p></div>;
}
