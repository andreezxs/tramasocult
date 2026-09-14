import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { ReactNode } from "react";
import { useRef } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 26,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const revealRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: revealRef,
    offset: ["start end", "end start"],
  });
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.16, 0.82, 1], [0.84, 1, 1, 0.9]);
  const scrollScale = useTransform(scrollYProgress, [0, 0.2, 0.78, 1], [0.985, 1, 1, 0.992]);

  return (
    <motion.div
      ref={revealRef}
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      style={reduce ? undefined : { opacity: scrollOpacity, scale: scrollScale, transformOrigin: "center center" }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 14, scale: 0.995 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {children}
    </motion.main>
  );
}
