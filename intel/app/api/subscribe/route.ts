import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import { avisarDono } from "@/lib/avisar";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * De graça desde 28/09/2026 — sem checkout do Stripe, sem "pending" à espera
 * de pagamento. O e-mail digitado já entra "active" e recebe a próxima
 * edição de domingo. O fluxo pago (Stripe) fica pronto no código (webhook,
 * STRIPE_PRICE_ID) para o dia em que o Lucas decidir cobrar de novo — só
 * este endpoint muda.
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const rawEmail = typeof body?.email === "string" ? body.email : "";
  const email = rawEmail.trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();

  const { data: existing, error: lookupError } = await supabaseAdmin
    .from("subscribers")
    .select("status")
    .eq("email", email)
    .maybeSingle();

  if (lookupError) {
    return NextResponse.json(
      { error: "Falha ao consultar assinante." },
      { status: 500 }
    );
  }

  if (existing?.status === "active") {
    return NextResponse.json(
      { error: "Este e-mail já está inscrito no Intel." },
      { status: 409 }
    );
  }

  const { error: upsertError } = await supabaseAdmin
    .from("subscribers")
    .upsert(
      { email, status: "active", activated_at: new Date().toISOString() },
      { onConflict: "email" }
    );

  if (upsertError) {
    return NextResponse.json(
      { error: "Falha ao registrar e-mail." },
      { status: 500 }
    );
  }

  await avisarDono(`Nova inscrição (de graça): ${email}`, [
    `${email} se inscreveu no Intel. Recebe a próxima edição de domingo.`,
    existing ? `Já existia como "${existing.status}".` : "Primeiro contato deste e-mail.",
  ]);

  return NextResponse.json({ ok: true });
}
