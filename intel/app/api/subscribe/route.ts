import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";

export const runtime = "nodejs";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const rawEmail = typeof body?.email === "string" ? body.email : "";
  const email = rawEmail.trim().toLowerCase();

  if (!EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "E-mail inválido." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const stripe = getStripe();

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
      { error: "Este e-mail já tem acesso ativo ao Intel." },
      { status: 409 }
    );
  }

  const { error: upsertError } = await supabaseAdmin
    .from("subscribers")
    .upsert({ email, status: "pending" }, { onConflict: "email" });

  if (upsertError) {
    return NextResponse.json(
      { error: "Falha ao registrar e-mail." },
      { status: 500 }
    );
  }

  const origin =
    req.headers.get("origin") ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "https://intel.vernissagessp.com";

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/?checkout=cancelado`,
    allow_promotion_codes: true,
    metadata: { subscriber_email: email },
    subscription_data: {
      metadata: { subscriber_email: email },
    },
  });

  if (!session.url) {
    return NextResponse.json(
      { error: "Falha ao iniciar checkout." },
      { status: 502 }
    );
  }

  return NextResponse.json({ url: session.url });
}
