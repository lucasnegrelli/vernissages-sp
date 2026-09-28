import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { getSupabaseAdmin } from "@/lib/supabase";
import type { SubscriberStatus } from "@/types";
import { avisarDono } from "@/lib/avisar";

export const runtime = "nodejs";

function mapSubscriptionStatus(status: Stripe.Subscription.Status): SubscriberStatus {
  if (status === "active" || status === "trialing") return "active";
  if (status === "past_due" || status === "unpaid") return "past_due";
  return "canceled";
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature");
  const payload = await req.text();

  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente." }, { status: 400 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    return NextResponse.json(
      { error: `Webhook inválido: ${(err as Error).message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email =
        session.customer_email ?? session.metadata?.subscriber_email ?? null;

      if (email) {
        await supabaseAdmin
          .from("subscribers")
          .update({
            status: "active",
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            activated_at: new Date().toISOString(),
          })
          .eq("email", email.toLowerCase());
        await avisarDono(`Nova assinatura paga: ${email}`, [
          `${email} pagou e está ativo. Recebe a próxima edição de domingo.`,
          `Cliente no Stripe: ${session.customer}`,
        ]);
      }
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabaseAdmin
        .from("subscribers")
        .update({ status: mapSubscriptionStatus(subscription.status) })
        .eq("stripe_subscription_id", subscription.id);
      if (mapSubscriptionStatus(subscription.status) === "past_due") {
        await avisarDono("Pagamento atrasado", [`Assinatura ${subscription.id} ficou com pagamento pendente.`]);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabaseAdmin
        .from("subscribers")
        .update({ status: "canceled", canceled_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscription.id);
      await avisarDono("Cancelamento", [`Assinatura ${subscription.id} foi cancelada.`]);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
