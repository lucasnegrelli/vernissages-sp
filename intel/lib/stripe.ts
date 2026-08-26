import Stripe from "stripe";

let cachedClient: Stripe | null = null;

/**
 * Instanciado sob demanda (não no import do módulo) para que o build
 * não quebre em ambientes onde a env var ainda não foi configurada —
 * só falha quando uma rota que realmente precisa do Stripe é chamada.
 */
export function getStripe(): Stripe {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY precisa estar definida.");
  }
  if (!cachedClient) {
    cachedClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2024-06-20",
    });
  }
  return cachedClient;
}
