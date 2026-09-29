import { motion, useReducedMotion } from "motion/react";
import { TiltCard } from "@/components/Motion";

export function ChapterCard() {
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
          Regras do conteúdo
        </h3>

        <p className="mt-3 text-sm leading-relaxed text-white/65">
          Este espaço reúne conteúdos relacionados à obra Tramas Ocultas:
          Vozes da Vida. As informações editoriais, descrições e
          contextualizações apresentadas no site servem apenas como apoio e
          não fazem parte do conteúdo original do livro.
        </p>

        <p className="mt-3 text-xs leading-relaxed text-white/45">
          O conteúdo original da obra deve ser preservado integralmente,
          sem alterações, adaptações ou interpretações apresentadas como
          parte do texto original.
        </p>
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
