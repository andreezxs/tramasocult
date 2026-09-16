import { createFileRoute } from "@tanstack/react-router";
import { Instagram, Feather } from "lucide-react";
import { PageTransition, Reveal } from "@/components/Motion";
import { GlassLink } from "@/components/GlassButton";
import { BOOK } from "@/lib/chapters";

export const Route = createFileRoute("/autor")({
  head: () => ({
    meta: [
      { title: "O Autor — @designerandrecmg | Tramas Ocultas" },
      {
        name: "description",
        content:
          "Conheça @designerandrecmg, autor e designer por trás de Tramas Ocultas: Vozes da Vida.",
      },
      { property: "og:title", content: "O Autor — @designerandrecmg" },
      {
        property: "og:description",
        content: "Design, escrita e experiência digital em uma única obra.",
      },
      { property: "og:url", content: "/autor" },
    ],
    links: [{ rel: "canonical", href: "/autor" }],
  }),
  component: AuthorPage,
});

function AuthorPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-4 pb-10 pt-36 sm:px-6">
        <Reveal>
          <p className="text-[0.66rem] uppercase tracking-[0.32em] text-primary">O autor</p>
          <h1 className="title-gradient mt-4 font-display text-4xl font-semibold sm:text-5xl">
            {BOOK.author}
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-panel edge-lit mt-10 flex flex-col gap-8 p-8 sm:flex-row sm:items-start sm:p-11">
            <span className="glass float-slow grid h-20 w-20 shrink-0 place-items-center rounded-3xl text-primary">
              <Feather className="h-7 w-7" aria-hidden />
            </span>
            <div>
              <p className="reading-body">
                Designer e escritor, {BOOK.author} trabalha na fronteira entre imagem e palavra. Em
                <span className="text-primary"> Tramas Ocultas: Vozes da Vida</span>, uniu os dois
                ofícios: a escrita nasceu de palavras e temas definidos, e a apresentação nasceu do
                desejo de que ler também fosse uma experiência visual.
              </p>
              <p className="reading-body mt-6">
                A obra reúne textos criados como exercício contínuo de criação cada capítulo é uma
                tentativa de escutar o que existe por baixo de um conceito simples e devolvê-lo em
                forma de história real com pensamento crítico.
              </p>
              <a
                href="https://instagram.com/designerandrecmg"
                target="_blank"
                rel="noopener noreferrer"
                className="glass mt-8 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-transform hover:-translate-y-0.5"
              >
                <Instagram className="h-4 w-4" aria-hidden />
                @designerandrecmg
              </a>
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-12 flex flex-wrap gap-3">
            <GlassLink to="/livro">Ler a obra</GlassLink>
            <GlassLink to="/contato" variant="glass">
              Entrar em contato
            </GlassLink>
          </div>
        </Reveal>
      </div>
    </PageTransition>
  );
}
