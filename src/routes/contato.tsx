import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Instagram, Mail, MessageCircle, Smartphone } from "lucide-react";
import { useState } from "react";
import { PageTransition, Reveal } from "@/components/Motion";
import { GlassButton } from "@/components/GlassButton";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | Tramas Ocultas: Vozes da Vida" },
      {
        name: "description",
        content:
          "Fale com @designerandrecmg sobre a obra Tramas Ocultas: Vozes da Vida, parcerias, leituras e projetos.",
      },
      { property: "og:title", content: "Contato — Tramas Ocultas" },
      { property: "og:description", content: "Converse com o autor da obra." },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: ContactPage,
});

const channels = [
  {
    icon: Instagram,
    label: "Instagram",
    value: "@designerandrecmg",
    href: "https://instagram.com/designerandrecmg",
  },
  {
    icon: Mail,
    label: "E-mail",
    value: "designerandrecmg@gmail.com",
    href: "mailto:designerandrecmg@gmail.com",
  },
  {
    icon: MessageCircle,
    label: "Mensagem direta",
    value: "Envie uma DM no Instagram",
    href: "https://instagram.com/designerandrecmg",
  },
];

const pixKey = "14084657956";

function ContactPage() {
  const [copied, setCopied] = useState(false);

  const copyPix = async () => {
    try {
      await navigator.clipboard.writeText(pixKey);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      setCopied(false);
    }
  };

  return (
    <PageTransition>
      <div className="mx-auto max-w-3xl px-4 pb-10 pt-36 sm:px-6">
        <Reveal>
          <p className="text-[0.66rem] uppercase tracking-[0.32em] text-primary">Contato</p>
          <h1 className="title-gradient mt-4 font-display text-4xl font-semibold sm:text-5xl">
            Vamos conversar
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground">
            Impressões sobre a leitura, convites, parcerias ou apenas uma palavra nova para o próximo
            capítulo — toda mensagem é lida.
          </p>
        </Reveal>

        <div className="mt-10 grid gap-4">
          {channels.map((c, i) => (
            <Reveal key={c.label} delay={i * 0.08}>
              <a
                href={c.href}
                target={c.href.startsWith("http") ? "_blank" : undefined}
                rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="glass-panel group flex items-center gap-5 p-6 transition-transform duration-500 hover:-translate-y-1"
              >
                <span className="glass grid h-11 w-11 shrink-0 place-items-center rounded-2xl text-primary">
                  <c.icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <span>
                  <span className="block text-[0.64rem] uppercase tracking-[0.24em] text-muted-foreground">
                    {c.label}
                  </span>
                  <span className="mt-1 block font-display text-lg font-semibold group-hover:text-primary">
                    {c.value}
                  </span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.24}>
          <section className="glass-panel mt-10 overflow-hidden p-6 sm:p-8" aria-labelledby="doar">
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center lg:gap-10">
              <div className="flex min-w-0 items-start gap-4">
                <span className="glass grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-primary">
                  <Smartphone className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0">
                  <p className="text-[0.64rem] uppercase tracking-[0.24em] text-primary">Apoie o projeto</p>
                  <h2 id="doar" className="mt-2 max-w-md font-display text-2xl font-semibold leading-tight">
                    Faça uma doação via Pix
                  </h2>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    Se esta leitura tocou você, sua contribuição ajuda a manter o projeto vivo.
                  </p>
                </div>
              </div>

              <div className="w-full lg:w-72">
                <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <span className="block text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground">Chave Pix</span>
                  <code className="mt-2 block text-base font-semibold tracking-[0.08em] text-foreground">{pixKey}</code>
                </div>
                <GlassButton type="button" variant="glass" onClick={copyPix} className="mt-3 w-full">
                  {copied ? <Check className="h-4 w-4" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                  {copied ? "Pix copiado" : "Copiar chave Pix"}
                </GlassButton>
                <p className="mt-2 text-left text-[0.65rem] leading-relaxed text-muted-foreground">
                  Abra seu banco e cole em Pix Copia e Cola.
                </p>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </PageTransition>
  );
}
