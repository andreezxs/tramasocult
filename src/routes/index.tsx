import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowRight, BookOpen, Feather, Sparkles, Clock } from "lucide-react";
import { useRef } from "react";

import { chaptersQuery, BOOK } from "@/lib/chapters";
import { Reveal, PageTransition, Magnetic } from "@/components/Motion";
import { GlassLink } from "@/components/GlassButton";
import { ChapterCard } from "@/components/ChapterCard";
import { ImmersiveBookScene } from "@/components/ImmersiveBookScene";
import { firstNameOf, sessionQuery, welcomeMessage } from "@/lib/session";

export const Route = createFileRoute("/")({
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(chaptersQuery());
  },
  head: () => ({
    meta: [
      { title: "Tramas Ocultas: Vozes da Vida | @designerandrecmg" },
      {
        name: "description",
        content:
          "Tramas Ocultas: Vozes da Vida, de @designerandrecmg. Uma palavra, um tema, escuta e escrita: uma obra viva de leitura contemplativa.",
      },
      { property: "og:title", content: "Tramas Ocultas: Vozes da Vida" },
      {
        property: "og:description",
        content:
          "Não nasceu como livro. Nasceu como exercício. Interface em vidro líquido, luz suave e trilha ambiente, sem competir com a leitura.",
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
    title: "A palavra vem primeiro",
    text: "Cada capítulo começa com um único termo e um tema. Nenhuma escrita antes da escuta: nunca uma explicação, sempre uma tentativa de ouvir até o fim.",
  },
  {
    icon: BookOpen,
    title: "Obra viva",
    text: "Capítulos independentes, publicados aos poucos. Uma coleção em expansão, não um produto fechado.",
  },
  {
    icon: Sparkles,
    title: "Atmosfera contemplativa",
    text: "Vidro líquido, iluminação suave e trilha sonora ambiente acompanham os textos sem nunca competir com a leitura.",
  },
];

function Home() {
  const { data: chapters } = useSuspenseQuery(chaptersQuery());
  const { data: user } = useQuery(sessionQuery());
  const readerName = firstNameOf(user?.name);
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
              <span className="status-pill">vozes da vida</span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="eyebrow"
            >
              {user?.name ? `Bem-vindo, ${readerName}` : "Apresentação do projeto"}
            </motion.p>

            <h1 className="editorial-title mt-5 text-[clamp(2.4rem,8vw,6rem)] font-medium leading-[0.92]">
              <motion.span
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="title-gradient block"
              >
                Tramas
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.36, ease: [0.22, 1, 0.36, 1] }}
                className="mt-1 block text-foreground/88"
              >
                Ocultas
              </motion.span>
            </h1>

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
              {user?.name
                ? welcomeMessage(user.name)
                : `${BOOK.subtitle} Escrever é terapia pessoal: mistérios, sentimentos e conexões do dia a dia, para que a leitura também encontre o seu próprio espaço.`}
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
                  {user?.name ? `Continuar, ${readerName}` : "Entrar na experiência"}
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
              <div className="hero-3d-caption hero-3d-caption-bottom">
                <BookOpen className="h-3.5 w-3.5" aria-hidden="true" /> {chapters.length} capítulos
                vivos
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="kinetic-band" aria-label="Manifesto da obra">
        <div className="kinetic-track" aria-hidden="true">
          <span>A PALAVRA VEM PRIMEIRO</span>
          <span className="kinetic-mark">✦</span>
          <span>VOZES DA VIDA</span>
          <span className="kinetic-mark">✦</span>
          <span>TRAMAS OCULTAS</span>
          <span className="kinetic-mark">✦</span>
          <span>A PALAVRA VEM PRIMEIRO</span>
          <span className="kinetic-mark">✦</span>
          <span>VOZES DA VIDA</span>
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
                  Escrita e design pensados juntos, como uma experiência só.
                </h2>
              </div>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-3">
              {highlights.map((h, i) => (
                <Reveal key={h.title} delay={i * 0.1}>
                  <Magnetic strength={8} className="h-full">
                    <motion.div
                      whileHover={{ y: -8 }}
                      whileTap={{ scale: 0.985 }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="glass-panel interactive-panel h-full p-6"
                    >
                      <span className="glass grid h-11 w-11 place-items-center rounded-2xl text-primary">
                        <h.icon className="h-4.5 w-4.5" aria-hidden />
                      </span>
                      <h3 className="mt-5 font-display text-lg font-semibold">{h.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.text}</p>
                    </motion.div>
                  </Magnetic>
                </Reveal>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6" aria-labelledby="origem">
        <Reveal>
          <div className="glass-panel grain relative overflow-hidden p-8 sm:p-12">
            <p className="eyebrow text-accent">Sobre o projeto</p>
            <h2 id="origem" className="mt-4 font-display text-2xl font-semibold sm:text-3xl">
              Não nasceu como livro. Nasceu como exercício.
            </h2>
            <p className="reading-body mt-5 max-w-3xl">
              A proposta é simples de descrever e difícil de cumprir: receber uma única palavra,
              receber um tema que a acompanha, e escrever até que esse ponto de partida mínimo
              revele algo que ainda não tinha sido dito. O resultado atravessa sentimentos, memórias
              e perspectivas distintas: histórias que existem por baixo do visível, no mesmo lugar
              onde vivem as coisas que sentimos mas raramente nomeamos.
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
