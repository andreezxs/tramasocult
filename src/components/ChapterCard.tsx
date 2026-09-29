nesse

import { Link } from "@tanstack/react-router";
import { motion, useReducedMotion } from "motion/react";
import type { Chapter } from "@/lib/chapters";
import { TiltCard } from "@/components/Motion";

export function ChapterCard({ chapter }: { chapter: Chapter; index?: number }) {
  const reduce = useReducedMotion();

  return (
    <TiltCard className="h-full">
      <motion.article
        {...(reduce ? {} : { whileHover: { y: -6 } })}
        whileTap={{ scale: 0.985 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="glass-panel edge-lit group relative flex h-full flex-col overflow-hidden p-4 sm:p-5"
      >
        <span className="card-sheen" aria-hidden />

        <h3 className="font-display text-xl font-semibold tracking-[-0.05em] sm:text-[1.45rem]">
          {chapter.title}
        </h3>

        <Link
          to="/capitulos/$slug"
          params={{ slug: chapter.slug }}
          className="absolute inset-0"
          aria-label={`Ler o capítulo ${chapter.title}`}
        />
      </motion.article>
    </TiltCard>
  );
}

export function ChapterSkeleton() {
  return (
    <div className="glass-panel flex h-32 flex-col gap-4 p-6">
      <div className="skeleton-shimmer h-6 w-3/4 rounded-full" />
    </div>
  );
}
