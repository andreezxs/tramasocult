import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react";
import { useEffect } from "react";

import { ShaderField } from "@/components/ShaderField";

const ORBS = [
  { className: "left-[-8%] top-[8%] h-72 w-72 bg-primary/10", delay: 0 },
  { className: "right-[-10%] top-[28%] h-80 w-80 bg-accent/8", delay: 1.6 },
  { className: "bottom-[-8%] left-[22%] h-72 w-72 bg-primary/8", delay: 3.2 },
  { className: "bottom-[18%] right-[18%] h-56 w-56 bg-[var(--blue)]/8", delay: 2.1 },
];

export function AmbientBackground() {
  const reduce = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const springX = useSpring(x, { stiffness: 40, damping: 20, mass: 0.8 });
  const springY = useSpring(y, { stiffness: 40, damping: 20, mass: 0.8 });
  const left = useTransform(springX, [0, 1], ["18%", "82%"]);
  const top = useTransform(springY, [0, 1], ["12%", "78%"]);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine || reduce) return;
    const onMove = (event: PointerEvent) => {
      x.set(event.clientX / window.innerWidth);
      y.set(event.clientY / window.innerHeight);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, x, y]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <ShaderField className="shader-ambient" intensity={0.92} />
      <div className="absolute inset-0 grain" />

      <motion.div
        className="absolute h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left,
          top,
          background:
            "radial-gradient(circle, rgb(171 224 84 / 10%) 0%, rgb(250 85 60 / 6%) 36%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      {ORBS.map((orb) => (
        <div
          key={orb.className}
          className={`float-orb absolute rounded-full blur-[110px] ${orb.className}`}
          style={{ animationDelay: `${orb.delay}s` }}
        />
      ))}
    </div>
  );
}
