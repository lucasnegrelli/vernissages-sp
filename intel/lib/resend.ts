import { Resend } from "resend";

let cachedClient: Resend | null = null;

/**
 * Instanciado sob demanda (não no import do módulo) para que o build
 * não quebre em ambientes onde a env var ainda não foi configurada —
 * só falha quando uma rota que realmente precisa do Resend é chamada.
 */
export function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY precisa estar definida.");
  }
  if (!cachedClient) {
    cachedClient = new Resend(process.env.RESEND_API_KEY);
  }
  return cachedClient;
}
