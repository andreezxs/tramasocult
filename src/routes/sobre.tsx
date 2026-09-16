import { createFileRoute } from "@tanstack/react-router";
import { PageTransition, Reveal } from "@/components/Motion";
import { GlassLink } from "@/components/GlassButton";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre o Projeto | Tramas Ocultas: Vozes da Vida" },
      {
        name: "description",
        content:
          "Como a obra foi criada: cada texto parte de uma palavra definida e de um tema específico, explorados por meio da escrita criativa.",
      },
      { property: "og:title", content: "Sobre o Projeto — Tramas Ocultas" },
      {
        property: "og:description",
        content: "Palavras definidas, temas específicos e interpretações originais.",
      },
      { property: "og:url", content: "/sobre" },
    ],
    links: [{ rel: "canonical", href: "/sobre" }],
  }),
  component: AboutPage,
});

const steps = [
  {
    n: "01",
    title: "A palavra",
    text: "Cada capítulo começa com um único termo escolhido previamente nada além dele.",
  },
  {
    n: "02",
    title: "O tema",
    text: "A palavra recebe um recorte: memória, identidade, tempo, pertencimento, superação.",
  },
  {
    n: "03",
    title: "A escuta",
    text: "Antes de escrever, o exercício é observar o que a palavra carrega de silencioso.",
  },
  {
    n: "04",
    title: "A escrita",
    text: "O conceito simples se transforma em história, reflexão e interpretação original.",
  },
];

function AboutPage() {
  return (
    <PageTransition>
      <div className="mx-auto max-w-4xl px-3 pb-10 pt-28 sm:px-6 sm:pt-36">
        <Reveal>
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-primary sm:text-[0.66rem]">
            Sobre o projeto
          </p>
          <h1 className="title-gradient mt-4 font-display text-3xl font-semibold sm:text-5xl">
            Um livro construído a partir de palavras
          </h1>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="glass-panel grain relative mt-10 overflow-hidden p-8 sm:p-11">
            <p className="reading-body">
              <span className="text-primary">Tramas Ocultas: Vozes da Vida</span> não começou como
              livro. 
            </p>
            <p className="reading-body mt-6">
              O resultado são textos que atravessam sentimentos, perspectivas, histórias
              que existem por baixo do visível.
            </p>
            <p className="reading-body mt-6">
              Esta versão web substitui o PDF tradicional. Em lugar de páginas estáticas, a obra
              ganha profundidade, luz, movimento e som mantendo o conforto de leitura sempre em
              primeiro lugar.
            </p>
          </div>
        </Reveal>

        <div className="mt-10 grid gap-5 sm:grid-cols-2">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 0.08}>
              <div className="glass-panel h-full p-6">
                <span className="font-display text-3xl font-semibold text-primary/70">{s.n}</span>
                <h2 className="mt-4 font-display text-lg font-semibold">{s.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.1}>
          <div className="mt-12">
            <GlassLink to="/livro">Explorar Capítulos</GlassLink>
          </div>
        </Reveal>
      </div>
    </PageTransition>
  );
}
