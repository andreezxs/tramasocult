import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { chaptersQuery } from "@/lib/chapters";
import { PageTransition, Reveal } from "@/components/Motion";
import { ChapterCard } from "@/components/ChapterCard";
import { GlassLink } from "@/components/GlassButton";

export const Route = createFileRoute("/livro")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(chaptersQuery());
  },
  head: () => ({
    meta: [
      { title: "O Livro — todos os capítulos | Tramas Ocultas" },
      {
        name: "description",
        content:
          "Todos os capítulos de Tramas Ocultas: Vozes da Vida em ordem, com resumo, palavra-base e tempo estimado de leitura.",
      },
      { property: "og:title", content: "O Livro — Tramas Ocultas: Vozes da Vida" },
      {
        property: "og:description",
        content: "A obra completa, capítulo por capítulo, em leitura digital contínua.",
      },
      { property: "og:url", content: "/livro" },
    ],
    links: [{ rel: "canonical", href: "/livro" }],
  }),
  component: BookPage,
});

function BookPage() {
  const { data: chapters } = useSuspenseQuery(chaptersQuery());
  const total = chapters.reduce((acc, c) => acc + c.reading_time, 0);
  const first = chapters[0];

  return (
    <PageTransition>
      <div className="mx-auto max-w-6xl px-3 pb-8 pt-28 sm:px-6 sm:pt-36">
        <Reveal>
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-primary sm:text-[0.66rem]">
            O Livro
          </p>
          <h1 className="title-gradient mt-4 font-display text-3xl font-semibold sm:text-5xl">
            Capítulos em ordem
          </h1>
          <p className="mt-5 max-w-2xl text-[0.95rem] leading-relaxed text-muted-foreground sm:text-base">
            {chapters.length} capítulos, aproximadamente {total} minutos de leitura. Comece pelo
            início ou escolha a voz que combina com o seu momento.
          </p>
          {first && (
            <div className="mt-8">
              <GlassLink to="/capitulos/$slug" params={{ slug: first.slug }}>
                Iniciar do começo
              </GlassLink>
            </div>
          )}
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {chapters.map((c, i) => (
            <Reveal key={c.id} delay={(i % 3) * 0.08}>
              <ChapterCard chapter={c} index={i} />
            </Reveal>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
