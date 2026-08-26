"use client";

import { useState, type FormEvent } from "react";

export function SubscribeForm({ className = "" }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMessage(data.error ?? "Algo deu errado. Tente novamente.");
        return;
      }

      window.location.href = data.url;
    } catch {
      setStatus("error");
      setErrorMessage("Falha de conexão. Tente novamente.");
    }
  }

  return (
    <div className={`w-full max-w-md ${className}`}>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-3 sm:flex-row"
      >
        <input
          type="email"
          required
          placeholder="seu@email.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full border border-neutral-700 bg-transparent px-4 py-4 text-sm text-neutral-100 placeholder:text-neutral-600 focus:border-gold focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="whitespace-nowrap bg-gold px-6 py-4 text-sm font-semibold uppercase tracking-wider text-black transition hover:bg-gold-bright disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "loading" ? "Processando..." : "Assinar Acesso Fechado"}
        </button>
      </form>
      {status === "error" && (
        <p className="mt-2 text-xs text-red-400">{errorMessage}</p>
      )}
      <p className="mt-3 text-xs text-neutral-600">
        Vagas por edição. Cancele quando quiser, sem letra miúda.
      </p>
    </div>
  );
}
