import { NextRequest, NextResponse } from "next/server";
import { render } from "@react-email/render";
import { getResend } from "@/lib/resend";
import { getSupabaseAdmin } from "@/lib/supabase";
import { NewsletterEmail } from "@/emails/NewsletterEmail";
import type { NewsletterIssue } from "@/types";
import { SENDER, avisarDono } from "@/lib/avisar";

export const runtime = "nodejs";
export const maxDuration = 300;

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

  /* Resumo semanal para o dono, saia a edição ou não: quantos em cada status. */
  const { data: todos } = await supabaseAdmin.from("subscribers").select("status");
  const conta: Record<string, number> = {};
  (todos ?? []).forEach((s: { status: string }) => { conta[s.status] = (conta[s.status] ?? 0) + 1; });
  const resumo = `ativos ${conta.active ?? 0} · pendentes ${conta.pending ?? 0} · atrasados ${conta.past_due ?? 0} · cancelados ${conta.canceled ?? 0}`;

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
    await avisarDono("Domingo SEM edição", [
      "Não havia edição agendada no Supabase (newsletter_issues). Nada foi enviado.",
      resumo,
    ]);
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
    await avisarDono(`Edição ${issue.issue_number} não saiu: nenhum assinante ativo`, [resumo]);
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

  await avisarDono(`Edição ${issue.issue_number} enviada: ${sent} de ${subscribers.length}`, [
    `Assunto: ${issue.subject}`,
    resumo,
    failures.length ? "Falhas: " + failures.join(" | ") : "Sem falhas.",
  ]);

  return NextResponse.json({
    issue: issue.issue_number,
    recipients: subscribers.length,
    sent,
    failures,
  });
}
