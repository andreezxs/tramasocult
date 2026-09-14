import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight, Clock } from "lucide-react";
import type { Chapter } from "@/lib/chapters";

export function ChapterCard({ chapter, index = 0 }: { chapter: Chapter; index?: number }) {
  return (
    <motion.article
      whileHover={{ y: -8, rotateX: 2.5, rotateY: -2.5 }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      style={{ transformPerspective: 1000 }}
      className="glass-panel edge-lit group flex h-full flex-col p-4 sm:p-5"
    >
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3 text-[0.58rem] uppercase tracking-[0.18em] text-muted-foreground sm:text-[0.62rem]">
        <span>Capítulo {String(chapter.chapter_order).padStart(2, "0")}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2 py-1">
          <Clock className="h-3 w-3" aria-hidden />
          {chapter.reading_time} min
        </span>
      </div>

      <h3 className="mt-4 font-display text-xl font-semibold tracking-[-0.05em] sm:text-[1.45rem]">
        {chapter.title}
      </h3>

      {chapter.keyword && (
        <p className="mt-2 text-[0.68rem] uppercase tracking-[0.16em] text-primary sm:text-[0.7rem]">
          Palavra-base · {chapter.keyword}
        </p>
      )}

      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground sm:text-[0.96rem]">
        {chapter.summary}
      </p>

      <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="text-[0.68rem] uppercase tracking-[0.18em] text-muted-foreground">
          {index + 1} / {"_"}
        </span>
        <Link
          to="/capitulos/$slug"
          params={{ slug: chapter.slug }}
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-primary"
          aria-label={`Ler o capítulo ${chapter.title}`}
        >
          Ler capítulo
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>
    </motion.article>
  );
}

export function ChapterSkeleton() {
  return (
    <div className="glass-panel flex h-56 flex-col gap-4 p-6">
      <div className="skeleton-shimmer h-3 w-24 rounded-full" />
      <div className="skeleton-shimmer h-6 w-3/4 rounded-full" />
      <div className="skeleton-shimmer h-3 w-full rounded-full" />
      <div className="skeleton-shimmer h-3 w-5/6 rounded-full" />
      <div className="skeleton-shimmer mt-auto h-3 w-28 rounded-full" />
    </div>
  );
}
