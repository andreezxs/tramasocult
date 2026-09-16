import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, BookOpen, Feather, Sparkles, Clock } from "lucide-react";
import { useRef, useState, type CSSProperties } from "react";

import { chaptersQuery, BOOK } from "@/lib/chapters";
import { Reveal, PageTransition } from "@/components/Motion";
import { GlassLink } from "@/components/GlassButton";
import { ChapterCard } from "@/components/ChapterCard";
import { ImmersiveBookScene } from "@/components/ImmersiveBookScene";

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
    text: "Cada texto nasce de um termo e um tema definidos previamente, transformados em história, tensão e reflexão.",
  },
  {
    icon: BookOpen,
    title: "Leitura contínua",
    text: "Capítulos organizados em fluxo, com navegação fluida, ritmo editorial e leitura em atmosfera íntima.",
  },
  {
    icon: Sparkles,
    title: "Atmosfera imersiva",
    text: "Interface em vidro líquido, luz suave e trilha ambiental que acompanham o tom contemplativo da obra.",
  },
];

function Home() {
  const { data: chapters } = useSuspenseQuery(chaptersQuery());
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const coverY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const coverScale = useTransform(scrollYProgress, [0, 1], [1, 1.07]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, 42]);

  const first = chapters[0];
  const latest = [...chapters].slice(-3).reverse();

  return (
    <PageTransition>
      <section
        ref={heroRef}
        className="immersive-hero premium-spotlight relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-center px-3 pb-14 pt-28 sm:px-6 sm:pt-32"
      >
        <div className="grid items-center gap-10 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12">
          <motion.div style={{ y: textY }} className="max-w-full">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mb-5 flex items-center gap-3"
            >
              <span className="status-pill text-primary">@designerandrecmg</span>
              <span className="status-pill">designer · escritor</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="eyebrow"
            >
              Livro digital editorial
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 22, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="title-gradient editorial-title mt-5 text-[2.8rem] font-medium leading-[0.82] sm:text-[4.7rem] lg:text-[6rem]"
            >
              Tramas
              <span className="block text-foreground/88">Ocultas</span>
            </motion.h1>

            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.38 }}
              className="mt-3 font-display text-[1.12rem] font-medium tracking-[-0.06em] text-foreground/72 sm:text-[1.7rem]"
            >
              Vozes da Vida
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
              className="mt-6 max-w-xl text-[0.96rem] leading-relaxed text-muted-foreground sm:text-lg"
            >
              {BOOK.subtitle} Um livro pensado como experiência sensível: texto, imagem, memória e
              silêncio em uma sequência contemplativa.
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
                  Entrar na experiência
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </GlassLink>
              )}
              <GlassLink to="/livro" variant="glass">
                Abrir o mapa
              </GlassLink>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-7 text-[0.62rem] uppercase tracking-[0.22em] text-muted-foreground"
            >
              Escrito por {BOOK.author}
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{ y: coverY, scale: coverScale }}
            className="hero-3d-stage relative mx-auto w-full max-w-[32rem]"
          >
            <div className="hero-3d-scene scratch-stage">
              <ImmersiveBookScene />
              <div className="hero-3d-caption hero-3d-caption-top">
                <span className="hero-3d-dot" aria-hidden="true" /> Edição digital · 2026
              </div>
              <div className="hero-3d-caption hero-3d-caption-bottom">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> {chapters.length} capítulos vivos
              </div>
              <span className="immersive-stage-label">Aproxime o olhar</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="kinetic-band" aria-label="Manifesto da obra">
        <div className="kinetic-track" aria-hidden="true">
          <span>PALAVRAS QUE RESPIRAM</span>
          <span className="kinetic-mark">✦</span>
          <span>VOZES QUE FICAM</span>
          <span className="kinetic-mark">✦</span>
          <span>TRAMAS OCULTAS</span>
          <span className="kinetic-mark">✦</span>
          <span>PALAVRAS QUE RESPIRAM</span>
          <span className="kinetic-mark">✦</span>
          <span>VOZES QUE FICAM</span>
          <span className="kinetic-mark">✦</span>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="destaques">
        <Reveal>
          <div className="section-shell section-grid p-6 sm:p-8 lg:p-10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow text-accent">Destaques da obra</p>
                <h2 id="destaques" className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
                  Uma publicação que mistura literatura, imagem e atmosfera.
                </h2>
              </div>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {highlights.map((h, i) => (
                <Reveal key={h.title} delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -8 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="glass-panel h-full p-6"
                  >
                    <span className="glass grid h-11 w-11 place-items-center rounded-2xl text-primary">
                      <h.icon className="h-4.5 w-4.5" aria-hidden />
                    </span>
                    <h3 className="mt-5 font-display text-lg font-semibold">{h.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.text}</p>
                  </motion.div>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="origem">
        <Reveal>
          <div className="glass-panel grain relative overflow-hidden p-8 sm:p-12">
            <p className="eyebrow text-accent">Como os textos nasceram</p>
            <h2 id="origem" className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
              Palavras definidas, temas específicos, interpretações livres.
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
