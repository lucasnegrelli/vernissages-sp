import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { getResend } from "@/lib/resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { NewsletterEmail } from "@/emails/NewsletterEmail";
import type { NewsletterIssue } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const SENDER = "Vernissages SP: Intel <intel@vernissagessp.com>";
const BATCH_SIZE = 100;

function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

/**
 * Disparada pelo Vercel Cron todo domingo às 23:00 UTC (20h em Brasília).
 * Vercel injeta "Authorization: Bearer $CRON_SECRET" automaticamente
 * quando a env var CRON_SECRET existe no projeto.
 */
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const resend = getResend();

  const { data: issue, error: issueError } = await supabaseAdmin
    .from("newsletter_issues")
    .select("*")
    .is("sent_at", null)
    .lte("scheduled_for", new Date().toISOString())
    .order("scheduled_for", { ascending: true })
    .limit(1)
    .maybeSingle<NewsletterIssue>();

  if (issueError) {
    return NextResponse.json(
      { error: "Falha ao buscar edição pendente." },
      { status: 500 }
    );
  }

  if (!issue) {
    return NextResponse.json({ message: "Nenhuma edição pendente para envio." });
  }

  const { data: subscribers, error: subscribersError } = await supabaseAdmin
    .from("subscribers")
    .select("email")
    .eq("status", "active");

  if (subscribersError) {
    return NextResponse.json(
      { error: "Falha ao buscar assinantes ativos." },
      { status: 500 }
    );
  }

  if (!subscribers || subscribers.length === 0) {
    return NextResponse.json({
      message: "Nenhum assinante ativo. Edição mantida como pendente.",
    });
  }

  const html = await render(<NewsletterEmail issue={issue} />);

  const batches = chunk(subscribers, BATCH_SIZE);
  let sent = 0;
  const failures: string[] = [];

  for (const batch of batches) {
    const { data, error } = await resend.batch.send(
      batch.map((subscriber) => ({
        from: SENDER,
        to: subscriber.email,
        subject: issue.subject,
        html,
      }))
    );

    if (error) {
      failures.push(error.message);
      continue;
    }

    sent += data?.data?.length ?? batch.length;
  }

  await supabaseAdmin
    .from("newsletter_issues")
    .update({ sent_at: new Date().toISOString() })
    .eq("id", issue.id);

  return NextResponse.json({
    issue: issue.issue_number,
    recipients: subscribers.length,
    sent,
    failures,
  });
}
