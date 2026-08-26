import { SubscribeForm } from "@/components/SubscribeForm";

const PROBLEMS = [
  {
    number: "01",
    title: "A peça já foi reservada",
    body: "Quando a exposição aparece no seu feed, as galerias já fecharam as melhores peças com a lista de convidados da vernissage. Você chega a tempo de ver o que sobrou.",
  },
  {
    number: "02",
    title: "A conexão já foi feita",
    body: "Curadores trocam de instituição, artistas trocam de galeria, colecionadores se movem entre coleções — e essas movimentações se decidem em conversa de corredor, não em press release.",
  },
  {
    number: "03",
    title: "A tendência já foi precificada",
    body: "Quando um nome começa a aparecer em toda coluna de cultura, o preço dele já subiu. Quem comprou antes da manchete comprou barato.",
  },
];

const SOLUTIONS = [
  {
    number: "1",
    title: "Agenda cronometrada da semana",
    body: "Quais vernissages importam, em que ordem e por quê — rankeadas por relevância de mercado, não por quem pagou assessoria.",
  },
  {
    number: "2",
    title: "Radar de movimentações",
    body: "Curadores mudando de instituição, artistas mudando de galeria, sinais de reposicionamento antes de virarem notícia.",
  },
  {
    number: "3",
    title: "Quem vai estar lá",
    body: "Inteligência de presença: quem monta, quem cura, quem compra — para você saber com quem conversar antes de entrar na sala.",
  },
  {
    number: "4",
    title: "Leitura de mercado",
    body: "Onde o capital está migrando dentro do circuito — de qual bairro, geração e mídium — e o que isso significa para quem coleciona ou expõe.",
  },
];

export default function Home() {
  return (
    <main>
      {/* NAV */}
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-8">
        <span className="text-sm font-semibold uppercase tracking-[0.2em] text-neutral-400">
          Vernissages SP <span className="text-gold">/ Intel</span>
        </span>
        <span className="hidden text-xs uppercase tracking-widest text-neutral-600 sm:block">
          Acesso restrito
        </span>
      </header>

      {/* HERO */}
      <section className="mx-auto flex max-w-4xl flex-col items-start gap-8 border-b border-neutral-900 px-6 pb-24 pt-12">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Acesso restrito — circuito de arte contemporânea de São Paulo
        </p>
        <h1 className="font-serif text-4xl leading-[1.1] text-neutral-50 sm:text-6xl">
          Quando você souber da exposição, a peça boa já foi vendida.
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-neutral-400">
          As decisões que movem preço, prestígio e acesso no circuito
          paulistano acontecem 72 horas antes da abertura pública — em
          conversas que você não está tendo. O{" "}
          <strong className="text-neutral-200">Vernissages SP: Intel</strong>{" "}
          te coloca na mesa antes da porta abrir.
        </p>
        <SubscribeForm className="pt-4" />
      </section>

      {/* PROBLEMA */}
      <section className="mx-auto max-w-5xl border-b border-neutral-900 px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          O problema
        </p>
        <h2 className="mt-4 font-serif text-3xl text-neutral-50 sm:text-4xl">
          O preço de chegar depois
        </h2>
        <p className="mt-4 max-w-2xl text-neutral-400">
          Você não perde para quem tem mais dinheiro. Perde para quem soube
          primeiro.
        </p>

        <div className="mt-14 grid gap-10 sm:grid-cols-3">
          {PROBLEMS.map((problem) => (
            <div key={problem.number} className="border-t border-neutral-800 pt-6">
              <span className="font-serif text-3xl text-neutral-700">
                {problem.number}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-neutral-100">
                {problem.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                {problem.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUÇÃO */}
      <section className="mx-auto max-w-5xl border-b border-neutral-900 px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          A solução
        </p>
        <h2 className="mt-4 font-serif text-3xl text-neutral-50 sm:text-4xl">
          O que chega toda segunda-feira
        </h2>
        <p className="mt-4 max-w-2xl text-neutral-400">
          Não é agenda cultural. É inteligência de mercado com data de
          validade de sete dias.
        </p>

        <div className="mt-14 grid gap-px overflow-hidden border border-neutral-900 sm:grid-cols-2">
          {SOLUTIONS.map((item) => (
            <div key={item.number} className="bg-black p-8">
              <span className="font-serif text-2xl text-gold">
                {item.number}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-neutral-100">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* PARA QUEM É */}
      <section className="mx-auto max-w-5xl border-b border-neutral-900 px-6 py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Para quem é
        </p>
        <h2 className="mt-4 max-w-2xl font-serif text-2xl leading-snug text-neutral-100 sm:text-3xl">
          Colecionadores, marchands, curadores e galeristas que tratam o
          circuito de São Paulo como o mercado que ele é — não como um
          calendário de eventos.
        </h2>
        <p className="mt-6 max-w-2xl text-sm text-neutral-500">
          Não é para quem quer indicação de "o que ver no fim de semana".
          Isso a internet já te dá de graça, com uma semana de atraso.
        </p>
      </section>

      {/* PREÇO / CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold">
          Acesso fechado
        </p>
        <p className="mt-6 font-serif text-6xl text-neutral-50 sm:text-7xl">
          R$ 47<span className="text-2xl text-neutral-500">/mês</span>
        </p>
        <p className="mt-3 text-sm text-neutral-500">
          Menos que o Uber até a próxima vernissage.
        </p>

        <ul className="mx-auto mt-10 flex max-w-md flex-col gap-3 text-left text-sm text-neutral-400">
          <li className="flex gap-3">
            <span className="text-gold">—</span>
            Edição semanal, toda segunda, antes da semana começar.
          </li>
          <li className="flex gap-3">
            <span className="text-gold">—</span>
            Sem anúncio, sem patrocínio de galeria, sem pauta comprada.
          </li>
          <li className="flex gap-3">
            <span className="text-gold">—</span>
            Cancelamento direto pelo portal de faturamento, sem letra
            miúda.
          </li>
        </ul>

        <div className="mt-12 flex justify-center">
          <SubscribeForm />
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 px-6 py-10 text-center">
        <p className="mx-auto max-w-xl text-xs leading-relaxed text-neutral-600">
          Vernissages SP: Intel é um produto editorial independente. Não
          representamos galerias, leiloeiros ou artistas — e é por isso que
          podemos falar a verdade sobre o mercado.
        </p>
      </footer>
    </main>
  );
}
