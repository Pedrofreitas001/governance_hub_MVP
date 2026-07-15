/** External business applications are strictly read-only in this product. */
export const READ_ONLY_POLICY = {
  externalMethods: ["GET"] as const,
  allowExternalWrites: false,
  notice: "Esta integração nunca cria, altera ou exclui dados no aplicativo conectado.",
};

export function assertReadOnlyMethod(method?: string) {
  const normalized = (method ?? "GET").toUpperCase();
  if (normalized !== "GET") throw new Error(`Política somente leitura bloqueou ${normalized} em aplicativo externo.`);
}
