import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Clock, Share2, Check } from "lucide-react";
import { useEffect, useState } from "react";

import { chaptersQuery, chapterNeighbors } from "@/lib/chapters";
import { PageTransition, Reveal } from "@/components/Motion";
import { ReadingProgress } from "@/components/ReadingProgress";
import { GlassButton } from "@/components/GlassButton";

export const Route = createFileRoute("/capitulos/$slug")({
  loader: async ({ context, params }) => {
    const chapters = await context.queryClient.ensureQueryData(chaptersQuery());
    const found = chapters.find((c) => c.slug === params.slug);
    if (!found) throw notFound();
    return { title: found.title, summary: found.summary };
  },
  head: ({ params, loaderData }) => {
    if (!loaderData) {
      return {
        meta: [{ title: "Capítulo indisponível | Tramas Ocultas" }, { name: "robots", content: "noindex" }],
      };
    }
    const title = `${loaderData.title} | Tramas Ocultas: Vozes da Vida`;
    return {
      meta: [
        { title },
        { name: "description", content: loaderData.summary },
        { property: "og:title", content: title },
        { property: "og:description", content: loaderData.summary },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/capitulos/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/capitulos/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: loaderData.title,
            description: loaderData.summary,
            inLanguage: "pt-BR",
            author: { "@type": "Person", name: "@designerandrecmg" },
            isPartOf: { "@type": "Book", name: "Tramas Ocultas: Vozes da Vida" },
          }),
        },
      ],
    };
  },
  component: ChapterPage,
});

function ChapterPage() {
  const { slug } = Route.useParams();
  const { data: chapters } = useSuspenseQuery(chaptersQuery());
  const { chapter, previous, next } = chapterNeighbors(chapters, slug);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const isEditable = (target: EventTarget | null) => {
      const element = target as HTMLElement | null;
      return element?.matches("input, textarea, select, [contenteditable='true']") ?? false;
    };

    const blockClipboard = (event: ClipboardEvent) => {
      if (!isEditable(event.target)) event.preventDefault();
    };

    const blockContextMenu = (event: MouseEvent) => {
      if (!isEditable(event.target)) event.preventDefault();
    };

    const blockSelection = (event: Event) => {
      if (!isEditable(event.target)) event.preventDefault();
    };

    const blockShortcuts = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const commandKey = event.ctrlKey || event.metaKey;
      const blockedCommand = commandKey && ["c", "x", "v", "p", "s", "u"].includes(key);
      const blockedDevTools = commandKey && event.shiftKey && ["i", "j", "c"].includes(key);
      const blockedSystemCapture = event.key === "PrintScreen";

      if (!isEditable(event.target) && (blockedCommand || blockedDevTools || blockedSystemCapture || event.key === "F12")) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.body.classList.add("protected-reading-active");
    document.addEventListener("copy", blockClipboard, true);
    document.addEventListener("cut", blockClipboard, true);
    document.addEventListener("paste", blockClipboard, true);
    document.addEventListener("contextmenu", blockContextMenu, true);
    document.addEventListener("selectstart", blockSelection, true);
    document.addEventListener("dragstart", blockSelection, true);
    document.addEventListener("keydown", blockShortcuts, true);

    return () => {
      document.body.classList.remove("protected-reading-active");
      document.removeEventListener("copy", blockClipboard, true);
      document.removeEventListener("cut", blockClipboard, true);
      document.removeEventListener("paste", blockClipboard, true);
      document.removeEventListener("contextmenu", blockContextMenu, true);
      document.removeEventListener("selectstart", blockSelection, true);
      document.removeEventListener("dragstart", blockSelection, true);
      document.removeEventListener("keydown", blockShortcuts, true);
    };
  }, []);

  if (!chapter) return null;

  const paragraphs = chapter.content.split("\n").filter((p) => p.trim().length > 0);

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: chapter.title, url });
      } else {
        await navigator.clipboard.writeText(url);
      }
      setShared(true);
      window.setTimeout(() => setShared(false), 2200);
    } catch {
      /* usuário cancelou */
    }
  };

  return (
    <PageTransition>
      <ReadingProgress />

      <article className="protected-reading mx-auto max-w-3xl select-none px-4 pb-10 pt-32 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="glass-panel edge-lit relative overflow-hidden p-6 sm:p-10">
            <div className="absolute inset-0 ambient-light opacity-60" aria-hidden />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-3 text-[0.64rem] uppercase tracking-[0.24em] text-muted-foreground">
                <span className="text-primary">
                  Capítulo {String(chapter.chapter_order).padStart(2, "0")}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-3 w-3" aria-hidden /> {chapter.reading_time} min de leitura
                </span>
                {chapter.theme && <span>{chapter.theme}</span>}
              </div>

              <h1 className="title-gradient mt-5 font-display text-3xl font-semibold leading-tight sm:text-5xl">
                {chapter.title}
              </h1>

              {chapter.keyword && (
                <p className="mt-4 text-sm text-muted-foreground">
                  Escrito a partir da palavra{" "}
                  <span className="text-accent">“{chapter.keyword}”</span>
                </p>
              )}

              <div className="mt-7 flex items-center gap-3">
                <GlassButton variant="glass" onClick={share} aria-label="Compartilhar capítulo">
                  {shared ? (
                    <>
                      <Check className="h-4 w-4" aria-hidden /> Link copiado
                    </>
                  ) : (
                    <>
                      <Share2 className="h-4 w-4" aria-hidden /> Compartilhar
                    </>
                  )}
                </GlassButton>
              </div>
            </div>
          </div>
        </motion.header>

        <div className="mt-12 space-y-6">
          {paragraphs.map((p, i) => (
            <Reveal key={i} delay={Math.min(i * 0.04, 0.4)} y={18}>
              <p className="reading-body">{p}</p>
            </Reveal>
          ))}
        </div>

        <nav
          aria-label="Navegação entre capítulos"
          className="mt-16 grid gap-4 sm:grid-cols-2"
        >
          {previous ? (
            <Link
              to="/capitulos/$slug"
              params={{ slug: previous.slug }}
              className="glass-panel group p-6 transition-transform duration-500 hover:-translate-y-1"
            >
              <span className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.24em] text-muted-foreground">
                <ArrowLeft className="h-3 w-3" aria-hidden /> Anterior
              </span>
              <p className="mt-3 font-display text-lg font-semibold group-hover:text-primary">
                {previous.title}
              </p>
            </Link>
          ) : (
            <span aria-hidden />
          )}

          {next ? (
            <Link
              to="/capitulos/$slug"
              params={{ slug: next.slug }}
              className="glass-panel group p-6 text-right transition-transform duration-500 hover:-translate-y-1"
            >
              <span className="inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.24em] text-muted-foreground">
                Próximo <ArrowRight className="h-3 w-3" aria-hidden />
              </span>
              <p className="mt-3 font-display text-lg font-semibold group-hover:text-primary">
                {next.title}
              </p>
            </Link>
          ) : (
            <Link
              to="/livro"
              className="glass-panel group p-6 text-right transition-transform duration-500 hover:-translate-y-1"
            >
              <span className="text-[0.64rem] uppercase tracking-[0.24em] text-muted-foreground">
                Fim da obra
              </span>
              <p className="mt-3 font-display text-lg font-semibold group-hover:text-primary">
                Voltar aos capítulos
              </p>
            </Link>
          )}
        </nav>
      </article>
    </PageTransition>
  );
}
