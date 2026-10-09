import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { firstNameOf, sessionQuery } from "@/lib/session";

export function WelcomeOverlay() {
  const search = useRouterState({ select: (state) => state.location.searchStr });
  const { data: user } = useQuery(sessionQuery());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    if (params.get("welcome") === "1" && user?.name) setOpen(true);
  }, [search, user?.name]);

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      setOpen(false);
      const url = new URL(window.location.href);
      url.searchParams.delete("welcome");
      window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
    }, 6200);
    return () => window.clearTimeout(timer);
  }, [open]);

  const dismiss = () => {
    setOpen(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("welcome");
    const next = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", next);
  };

  const name = firstNameOf(user?.name);

  return (
    <AnimatePresence>
      {open && (
        <motion.button
          key="welcome"
          type="button"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(18px)", scale: 1.03 }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[110] grid place-items-center bg-background/94 px-6 text-center"
          onClick={dismiss}
          aria-label={`Seja bem-vindo, ${name}`}
        >
          <div className="absolute inset-0 ambient-light opacity-70" />
          <div className="relative flex max-w-xl flex-col items-center gap-5">
            <motion.span
              initial={{ opacity: 0, letterSpacing: "0.7em" }}
              animate={{ opacity: 1, letterSpacing: "0.28em" }}
              transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-[0.62rem] uppercase text-muted-foreground"
            >
              Tramas Ocultas
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16, filter: "blur(12px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="title-gradient font-display text-3xl font-semibold sm:text-5xl"
            >
              Seja bem-vindo, {name}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base"
            >
              Está pronto para esta viagem em Tramas Ocultas?
            </motion.p>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="mt-2 rounded-full border border-white/10 px-4 py-2 text-[0.68rem] uppercase tracking-[0.22em] text-primary"
            >
              Toque para continuar
            </motion.span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
