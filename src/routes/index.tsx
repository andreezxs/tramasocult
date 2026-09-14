import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, BookOpen, Feather, Sparkles, Clock } from "lucide-react";
import { useRef } from "react";

import { chaptersQuery, BOOK } from "@/lib/chapters";
import { Reveal, PageTransition } from "@/components/Motion";
import { GlassLink } from "@/components/GlassButton";
import { ChapterCard } from "@/components/ChapterCard";
import cover from "@/assets/book-cover.svg";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(chaptersQuery());
  },
  head: () => ({
    meta: [
      { title: "Tramas Ocultas: Vozes da Vida — eBook interativo" },
      {
        name: "description",
        content:
          "Livro digital interativo de @designerandrecmg. Textos criados a partir de palavras e temas definidos, em uma experiência de leitura imersiva.",
      },
      { property: "og:title", content: "Tramas Ocultas: Vozes da Vida" },
      {
        property: "og:description",
        content: "Uma obra digital viva: leitura imersiva, design premium e trilha ambiente.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const highlights = [
  {
    icon: Feather,
    title: "Escrita a partir de palavras",
    text: "Cada texto nasce de um termo e um tema definidos previamente, transformados em história e reflexão.",
  },
  {
    icon: BookOpen,
    title: "Leitura contínua",
    text: "Capítulos carregados dinamicamente, com progresso, navegação fluida e tipografia editorial.",
  },
  {
    icon: Sparkles,
    title: "Atmosfera imersiva",
    text: "Interface em vidro líquido, luz ambiente e trilha sonora contemplativa em loop.",
  },
];

function Home() {
  const { data: chapters } = useSuspenseQuery(chaptersQuery());
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const coverY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const coverScale = useTransform(scrollYProgress, [0, 1], [1, 1.06]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 50]);

  const first = chapters[0];
  const latest = [...chapters].slice(-3).reverse();

  return (
    <PageTransition>
      <section
        ref={heroRef}
        className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-3 pb-14 pt-28 sm:px-6 sm:pt-32"
      >
        <div className="grid items-center gap-8 sm:gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-12">
          <motion.div style={{ y: textY }} className="max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 flex flex-wrap items-center gap-2"
            >
              <span className="ios-chip text-primary">eBook interativo</span>
              <span className="ios-chip">{chapters.length} capítulos</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="title-gradient mt-5 max-w-[12ch] font-display text-[2.7rem] font-medium leading-[0.82] tracking-[-0.085em] sm:max-w-none sm:text-[4.2rem] lg:text-[5.1rem]"
            >
              Tramas Ocultas
              <span className="block text-foreground/85">Vozes da Vida</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-[0.98rem] leading-relaxed text-muted-foreground sm:text-lg"
            >
              {BOOK.subtitle} Um livro escrito a partir de palavras e temas definidos — cada termo
              simples virou história, interpretação e reflexão. Aqui ele deixa de ser PDF e passa a
              ser experiência.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="mt-8 flex flex-wrap items-center gap-2.5 sm:gap-3"
            >
              {first && (
                <GlassLink
                  to="/capitulos/$slug"
                  params={{ slug: first.slug }}
                  ariaLabel={`Começar a leitura pelo capítulo ${first.title}`}
                >
                  Começar a Leitura
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </GlassLink>
              )}
              <GlassLink to="/livro" variant="glass">
                Explorar Capítulos
              </GlassLink>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.7 }}
              className="mt-6 flex flex-wrap gap-2 text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground sm:text-[0.66rem]"
            >
              <span className="ios-chip">Leitura imersiva</span>
              <span className="ios-chip">Design editorial</span>
              <span className="ios-chip">Trilha sonora</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-7 text-xs text-muted-foreground"
            >
              Escrito por {BOOK.author}
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40, rotateY: -8 }}
            animate={{ opacity: 1, y: 0, rotateY: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: coverY, scale: coverScale, transformPerspective: 1200 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="glass-panel edge-lit float-slow overflow-hidden p-3">
              <img
                src={cover}
                alt="Capa do livro Tramas Ocultas: Vozes da Vida — camadas de vidro translúcido com fios entrelaçados em verde e laranja"
                width={1024}
                height={1536}
                className="w-full rounded-2xl object-cover"
              />
            </div>
            <div className="glass-bar absolute -bottom-5 left-1/2 -translate-x-1/2 rounded-full px-5 py-2 text-[0.7rem] tracking-wide">
              Edição digital · 2026
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="destaques">
        <Reveal>
          <h2 id="destaques" className="font-display text-2xl font-semibold sm:text-3xl">
            Destaques da obra
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {highlights.map((h, i) => (
            <Reveal key={h.title} delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -6 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                className="glass-panel h-full p-6"
              >
                <span className="glass grid h-10 w-10 place-items-center rounded-2xl text-primary">
                  <h.icon className="h-4.5 w-4.5" aria-hidden />
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.text}</p>
              </motion.div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="origem">
        <Reveal>
          <div className="glass-panel grain relative overflow-hidden p-8 sm:p-12">
            <p className="text-[0.66rem] uppercase tracking-[0.28em] text-accent">
              Como os textos nasceram
            </p>
            <h2 id="origem" className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
              Palavras definidas, temas específicos, interpretações livres
            </h2>
            <p className="reading-body mt-5 max-w-3xl">
              Antes de cada capítulo existia apenas uma palavra — fio, silêncio, casa, voz, tempo — e
              um tema para guiar o olhar. A tarefa era transformar esse ponto de partida mínimo em
              narrativa: escutar o que o termo carregava, encontrar as vozes escondidas nele e
              escrever até que virasse história, reflexão ou memória.
            </p>
            <Link
              to="/sobre"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              Conhecer o processo completo
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6" aria-labelledby="ultimos">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="ultimos" className="font-display text-2xl font-semibold sm:text-3xl">
              Últimos capítulos publicados
            </h2>
            <Link
              to="/livro"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              Ver todos <Clock className="h-3.5 w-3.5" aria-hidden />
            </Link>
          </div>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {latest.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.1}>
              <ChapterCard chapter={c} index={i} />
            </Reveal>
          ))}
        </div>
      </section>
    </PageTransition>
  );
}
