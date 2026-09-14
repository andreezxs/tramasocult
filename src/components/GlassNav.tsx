import { Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "motion/react";
import { Menu, X, Volume2, VolumeX, BookOpen, Lock } from "lucide-react";
import { useState } from "react";
import { useAmbientAudio } from "./AmbientAudioProvider";
import { BOOK } from "@/lib/chapters";

const links = [
  { to: "/", label: "Início" },
  { to: "/sobre", label: "Sobre o Projeto" },
  { to: "/livro", label: "O Livro" },
  { to: "/autor", label: "Autor" },
  { to: "/contato", label: "Contato" },
] as const;

function SoundControl({ compact = false }: { compact?: boolean }) {
  const { playing, volume, toggle, setVolume } = useAmbientAudio();

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (!playing && value > 0) {
      toggle();
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausar trilha sonora" : "Ativar trilha sonora"}
        aria-pressed={playing}
        className="glass grid h-9 w-9 place-items-center rounded-full text-foreground/85 transition-all duration-300 hover:scale-105 hover:text-primary"
      >
        {playing ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>
      <label className={compact ? "flex items-center gap-2" : "hidden items-center gap-2 lg:flex"}>
        <span className="sr-only">Volume da trilha sonora</span>
        <input
          type="range"
          min={0}
          max={0.8}
          step={0.02}
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/15 accent-primary"
        />
      </label>
    </div>
  );
}

export function GlassNav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-2 pt-2.5 sm:px-6 sm:pt-5">
      <motion.nav
        initial={{ y: -28, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="glass-bar edge-lit mx-auto flex max-w-6xl items-center justify-between rounded-[22px] px-2.5 py-2 sm:px-4"
      >
        <Link to="/" className="group flex min-w-0 items-center gap-2.5" aria-label={BOOK.title}>
          <span className="glass grid h-9 w-9 shrink-0 place-items-center rounded-2xl text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.2)] transition-transform duration-500 group-hover:rotate-6">
            <BookOpen className="h-4 w-4" />
          </span>
          <span className="flex min-w-0 flex-col leading-none">
            <span className="truncate font-display text-[0.72rem] font-medium tracking-[-0.05em] text-foreground/95 sm:text-[0.82rem]">
              Tramas Ocultas
            </span>
            <span className="hidden text-[0.58rem] uppercase tracking-[0.2em] text-muted-foreground sm:block">
              Vozes da Vida
            </span>
          </span>
        </Link>

        <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 py-1.5 text-[0.6rem] font-medium uppercase tracking-[0.22em] text-muted-foreground xl:flex">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(74,222,128,0.7)]" />
          Leitura em fluxo
        </div>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                activeOptions={{ exact: l.to === "/" }}
                activeProps={{ className: "text-primary" }}
                inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
                className="relative rounded-full px-3 py-1.5 text-[0.8rem] font-medium transition-colors duration-300 hover:bg-white/5"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            to="/admin"
            aria-label="Área privada"
            className="glass grid h-9 w-9 place-items-center rounded-full text-foreground/85 transition-all duration-300 hover:scale-105 hover:text-primary"
          >
            <Lock className="h-4 w-4" />
          </Link>
          <div className="hidden sm:block">
            <SoundControl />
          </div>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            aria-expanded={open}
            className="glass grid h-9 w-9 place-items-center rounded-full md:hidden"
          >
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="glass-panel mx-auto mt-2 max-w-6xl p-3 md:hidden"
          >
            <ul className="flex flex-col">
              {links.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: l.to === "/" }}
                    activeProps={{ className: "text-primary" }}
                    className="block rounded-2xl px-4 py-3 text-sm font-medium transition-colors hover:bg-white/5"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
