import { getResend } from "@/lib/resend";

/**
 * Remetente único do app. Até 28/09/2026 o cron usava
 * "intel@vernissagessp.com" — domínio que não é o do projeto (.com.br) e que
 * o Resend recusaria por não estar verificado. INTEL_FROM permite trocar sem
 * deploy de código.
 */
export const SENDER =
  process.env.INTEL_FROM ?? "Vernissages SP: Intel <intel@vernissagessp.com.br>";

/**
 * Avisa o dono do boletim (OWNER_EMAIL) de tudo que acontece com assinante.
 *
 * Por que existe: até 28/09/2026 um cadastro ou pagamento não gerava aviso
 * nenhum — o Lucas só saberia abrindo o painel do Supabase ou do Stripe.
 *
 * Nunca lança: aviso que falha não pode derrubar o cadastro de quem está
 * pagando. Sem OWNER_EMAIL configurado, não faz nada.
 */
export async function avisarDono(assunto: string, linhas: string[]): Promise<void> {
  const para = process.env.OWNER_EMAIL;
  if (!para) return;
  try {
    await getResend().emails.send({
      from: SENDER,
      to: para,
      subject: `[Intel] ${assunto}`,
      text: linhas.join("\n"),
    });
  } catch (err) {
    console.error("avisarDono falhou:", (err as Error).message);
  }
}
