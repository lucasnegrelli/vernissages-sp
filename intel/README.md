# Vernissages SP: Intel

Boletim semanal pago (R$ 47/mês) sobre o circuito de arte contemporânea de
São Paulo. Next.js (App Router) + TailwindCSS + Stripe + Supabase + Resend,
pensado para deploy na Vercel (inclusive o cron de envio).

Este app vive isolado em `/intel` dentro do repositório do site principal
(estático, gerado pelos scripts na raiz) porque tem stack, ciclo de deploy
e superfície de dados (pagamento, e-mail de assinante) completamente
diferentes — misturar os dois só criaria acoplamento sem ganho.

## Arquitetura de diretórios

```
intel/
├── app/
│   ├── layout.tsx                    # shell HTML + metadata global (SEO/OG)
│   ├── page.tsx                      # landing page (copy + seções)
│   ├── globals.css                   # entrypoint do Tailwind
│   ├── success/page.tsx              # retorno pós-checkout do Stripe
│   └── api/
│       ├── subscribe/route.ts        # cria lead + Checkout Session (Stripe)
│       ├── webhooks/stripe/route.ts  # confirma pagamento, ativa/cancela assinante
│       └── cron/send-newsletter/route.tsx  # disparo semanal do boletim
├── components/
│   └── SubscribeForm.tsx             # único client component: captura e-mail e redireciona ao checkout
├── emails/
│   └── NewsletterEmail.tsx           # template React Email do boletim
├── lib/
│   ├── stripe.ts                     # client Stripe (server-only)
│   ├── supabase.ts                   # client Supabase com Service Role (server-only)
│   └── resend.ts                     # client Resend (server-only)
├── types/
│   └── index.ts                      # contratos compartilhados entre API, cron e email
├── supabase/
│   └── schema.sql                    # tabelas subscribers / newsletter_issues + RLS
├── vercel.json                       # agenda do cron (domingo, 23h UTC)
└── .env.example                      # variáveis exigidas em produção
```

Por que cada pasta existe:
- **`app/`** — App Router do Next: cada rota (página ou API) fica isolada em seu próprio arquivo, sem um `pages/` paralelo.
- **`app/api/`** — toda integração com serviço externo (Stripe, Supabase, Resend) roda em route handlers server-only, nunca no client.
- **`components/`** — a landing page inteira é Server Component por padrão; só o formulário de e-mail precisa de estado no browser, então é o único arquivo `"use client"`.
- **`emails/`** — o template do boletim é código React, não uma string HTML solta, então é testável e reaproveita o mesmo TypeScript do resto do app.
- **`lib/`** — um client por serviço externo, instanciado uma vez, para não vazar chave de Service Role/API para o bundle do client por engano.
- **`types/`** — contratos usados tanto pela rota que grava no banco quanto pela que lê e monta o e-mail, evitando drift de schema entre as duas.
- **`supabase/`** — schema versionado como SQL puro (sem ORM) porque são duas tabelas; RLS fica ligada com zero policies públicas, já que os dados nunca precisam ser lidos do client.

## Setup

```bash
cd intel
npm install
cp .env.example .env.local   # preencha com as chaves reais
npm run dev
```

### Serviços externos necessários

1. **Stripe** — crie um Produto recorrente de R$ 47/mês, pegue o `price_id`
   (`STRIPE_PRICE_ID`). Configure um endpoint de webhook apontando para
   `/api/webhooks/stripe` escutando `checkout.session.completed`,
   `customer.subscription.updated` e `customer.subscription.deleted`.
2. **Supabase** — crie um projeto, rode `supabase/schema.sql` no SQL
   Editor, copie a URL e a **Service Role key** (não a `anon`).
3. **Resend** — verifique o domínio de envio (`vernissagessp.com`) e gere
   uma API key.
4. **CRON_SECRET** — qualquer string aleatória longa. Ao definir essa env
   var no projeto Vercel, a própria Vercel passa a enviar
   `Authorization: Bearer $CRON_SECRET` nas chamadas do cron — é isso que
   a rota valida.

### Publicando uma edição

Inserir uma linha em `newsletter_issues` com `scheduled_for` no passado (ou
no momento do cron) e `sent_at` nulo é o suficiente para que o cron de
domingo a pegue e dispare para todos os `subscribers` com `status = active`.

## Deploy

Deploy padrão na Vercel (`vercel --prod`), com as env vars de
`.env.example` cadastradas no projeto. O `vercel.json` já registra o cron
semanal — nenhuma configuração adicional de infraestrutura é necessária.
