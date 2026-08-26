import Link from "next/link";

export const metadata = {
  title: "Acesso confirmado — Vernissages SP: Intel",
};

export default function SuccessPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
        Acesso confirmado
      </p>
      <h1 className="mt-6 font-serif text-4xl text-neutral-50 sm:text-5xl">
        Você está dentro.
      </h1>
      <p className="mt-6 max-w-md text-neutral-400">
        Sua assinatura do Vernissages SP: Intel foi ativada. A primeira
        edição chega na próxima segunda-feira, antes da semana começar. O
        recibo e o link para gerenciar sua assinatura foram enviados pelo
        Stripe para o seu e-mail.
      </p>
      <Link
        href="/"
        className="mt-10 text-sm uppercase tracking-widest text-gold hover:text-gold-bright"
      >
        Voltar para a página inicial
      </Link>
    </main>
  );
}
