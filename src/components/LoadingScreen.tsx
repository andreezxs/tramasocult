import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDone(true), 1700);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          exit={{ opacity: 0, filter: "blur(18px)", scale: 1.04 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[100] grid place-items-center bg-background"
        >
          <div className="absolute inset-0 ambient-light opacity-70" />
          <div className="loader-orbit" aria-hidden />
          <div className="relative flex flex-col items-center gap-6 px-6 text-center">
            <motion.span
              initial={{ opacity: 0, letterSpacing: "0.7em" }}
              animate={{ opacity: 1, letterSpacing: "0.28em" }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[0.62rem] uppercase text-muted-foreground"
            >
              Tramas Ocultas
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="title-gradient font-display text-3xl font-semibold sm:text-4xl"
            >
              Vozes da Vida
            </motion.h1>
            <div className="glass h-[3px] w-40 overflow-hidden rounded-full p-0 sm:w-44">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "0% 50%" }}
                className="h-full w-full bg-linear-to-r from-primary to-accent"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
