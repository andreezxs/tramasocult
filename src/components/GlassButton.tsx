import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import type { ReactNode } from "react";

const base =
  "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full border border-white/10 px-6 py-3 text-sm font-semibold tracking-[-0.01em] shadow-[0_12px_32px_rgba(0,0,0,0.26)] transition-all duration-400 backdrop-blur-xl before:absolute before:inset-0 before:bg-[linear-gradient(135deg,rgba(255,255,255,0.28),transparent_40%,transparent_60%,rgba(255,255,255,0.1))] before:opacity-90 before:content-['']";

const variants = {
  primary:
    "bg-[linear-gradient(135deg,rgba(255,196,126,0.98),rgba(255,162,78,0.94),rgba(255,214,161,0.92))] text-[#1a1209] shadow-[0_18px_42px_rgba(255,169,92,0.38)] hover:brightness-105",
  glass:
    "glass text-foreground hover:border-primary/40 hover:bg-white/8",
  accent:
    "bg-[linear-gradient(135deg,rgba(167,125,255,0.92),rgba(255,154,120,0.9))] text-white shadow-[0_18px_42px_rgba(128,93,255,0.34)] hover:brightness-110",
} as const;

type Variant = keyof typeof variants;

type MotionButtonProps = React.ComponentProps<typeof motion.button>;

export function GlassButton({
  children,
  variant = "primary",
  className = "",
  ...rest
}: MotionButtonProps & { variant?: Variant }) {
  return (
    <motion.button
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.97 }}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

export function GlassLink({
  children,
  variant = "primary",
  className = "",
  to,
  params,
  ariaLabel,
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  to: string;
  params?: Record<string, string>;
  ariaLabel?: string;
}) {
  return (
    <motion.span
      whileHover={{ scale: 1.035 }}
      whileTap={{ scale: 0.97 }}
      className="inline-block"
    >
      <Link
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        to={to as any}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        params={params as any}
        aria-label={ariaLabel}
        className={`${base} ${variants[variant]} ${className}`}
      >
        {children}
      </Link>
    </motion.span>
  );
}
