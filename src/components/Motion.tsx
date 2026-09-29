import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import type { PointerEvent as ReactPointerEvent, ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Reveal({
  children,
  delay = 0,
  y = 28,
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
  const scrollOpacity = useTransform(scrollYProgress, [0, 0.14, 0.86, 1], [0.82, 1, 1, 0.92]);
  const scrollScale = useTransform(scrollYProgress, [0, 0.18, 0.82, 1], [0.978, 1, 1, 0.994]);

  return (
    <motion.div
      ref={revealRef}
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, y, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      style={
        reduce
          ? {}
          : { opacity: scrollOpacity, scale: scrollScale, transformOrigin: "center center" }
      }
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.95, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  return (
    <motion.main
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.992, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: reduce ? 0.25 : 0.85, ease: EASE }}
      className="relative"
    >
      {children}
    </motion.main>
  );
}

export function Magnetic({
  children,
  className,
  strength = 12,
}: {
  children: ReactNode;
  className?: string;
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 240, damping: 18, mass: 0.35 });
  const springY = useSpring(y, { stiffness: 240, damping: 18, mass: 0.35 });

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    x.set((dx / rect.width) * strength);
    y.set((dy / rect.height) * strength);
  };

  const onLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: springX, y: springY }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

export function TiltCard({
  children,
  className,
  max = 10,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 180, damping: 16, mass: 0.4 });
  const springY = useSpring(rotateY, { stiffness: 180, damping: 16, mass: 0.4 });

  const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (reduce || event.pointerType !== "mouse") return;
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * max * 2);
    rotateX.set((0.5 - py) * max * 2);
  };

  const onLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX: springX,
        rotateY: springY,
        transformPerspective: 1100,
        transformStyle: "preserve-3d",
      }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
    </motion.div>
  );
}

export function SplitWords({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");

  return (
    <span className={className}>
      {words.map((word, index) => (
        <motion.span
          key={`${word}-${index}`}
          className="inline-block pr-[0.28em]"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: "0.55em", filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.72, delay: delay + index * 0.06, ease: EASE }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export function CursorAura() {
  const reduce = useReducedMotion();
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const springX = useSpring(x, { stiffness: 90, damping: 22, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 90, damping: 22, mass: 0.6 });
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || !motionOk || reduce) return;

    setEnabled(true);
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX);
      y.set(event.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, x, y]);

  if (!enabled) return null;

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed z-[60] hidden h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full md:block"
      style={{
        x: springX,
        y: springY,
        background:
          "radial-gradient(circle, rgb(171 224 84 / 16%) 0%, rgb(250 85 60 / 8%) 38%, transparent 70%)",
        mixBlendMode: "screen",
        filter: "blur(8px)",
      }}
    />
  );
}
