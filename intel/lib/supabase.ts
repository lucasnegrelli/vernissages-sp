import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;

/**
 * Cliente com a Service Role key: só pode rodar em código de servidor
 * (route handlers / cron), nunca em componentes de cliente.
 *
 * Instanciado sob demanda (não no import do módulo) para que o build
 * não quebre em ambientes onde as env vars ainda não foram configuradas —
 * só falha quando uma rota que realmente precisa do Supabase é chamada.
 */
export function getSupabaseAdmin(): SupabaseClient {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error(
      "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidas."
    );
  }
  if (!cachedClient) {
    cachedClient = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      { auth: { persistSession: false } }
    );
  }
  return cachedClient;
}
