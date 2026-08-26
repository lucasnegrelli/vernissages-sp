import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vernissages SP: Intel — Inteligência de mercado da arte contemporânea de São Paulo",
  description:
    "Boletim semanal para quem não pode chegar depois: agenda cronometrada, radar de movimentações e leitura de mercado do circuito de arte contemporânea de São Paulo. R$ 47/mês.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="bg-black text-neutral-100 antialiased">
        {children}
      </body>
    </html>
  );
}
