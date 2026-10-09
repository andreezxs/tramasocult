import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useRouterState } from "@tanstack/react-router";
import { motion, useMotionValueEvent, useScroll } from "motion/react";
import {
  BookOpen,
  Feather,
  Home,
  Lock,
  LogOut,
  Mail,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useState } from "react";
import { useAmbientAudio } from "./AmbientAudioProvider";
import { BOOK } from "@/lib/chapters";
import { Magnetic } from "@/components/Motion";
import { logout } from "@/lib/auth.functions";
import { firstNameOf, sessionQuery } from "@/lib/session";

const links = [
  { to: "/", label: "Início", icon: Home },
  { to: "/sobre", label: "Sobre", icon: Sparkles },
  { to: "/livro", label: "Livro", icon: BookOpen },
  { to: "/autor", label: "Autor", icon: Feather },
  { to: "/contato", label: "Contato", icon: Mail },
] as const;

function isActivePath(pathname: string, to: string) {
  if (to === "/") return pathname === "/";
  return pathname === to || pathname.startsWith(`${to}/`);
}

function SoundControl({ compact = false }: { compact?: boolean }) {
  const { playing, volume, toggle, setVolume } = useAmbientAudio();

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (!playing && value > 0) toggle();
  };

  return (
    <div className={`group/sound flex items-center ${compact ? "gap-2" : "gap-1"}`}>
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pausar trilha sonora" : "Ativar trilha sonora"}
        aria-pressed={playing}
        className="nav-icon-btn"
      >
        {playing ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
      </button>
      <label
        className={
          compact
            ? "flex items-center"
            : "grid w-0 overflow-hidden opacity-0 transition-all duration-300 group-hover/sound:w-[4.5rem] group-hover/sound:opacity-100 group-focus-within/sound:w-[4.5rem] group-focus-within/sound:opacity-100"
        }
      >
        <span className="sr-only">Volume da trilha sonora</span>
        <input
          type="range"
          min={0}
          max={0.8}
          step={0.02}
          value={volume}
          onChange={(e) => handleVolumeChange(Number(e.target.value))}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/15 accent-primary"
        />
      </label>
    </div>
  );
}

export function GlassNav() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const queryClient = useQueryClient();
  const { data: user } = useQuery(sessionQuery());
  const greetingName = firstNameOf(user?.name);

  useMotionValueEvent(scrollY, "change", (value) => {
    setScrolled(value > 18);
  });

  return (
    <>
      <header className="pointer-events-none fixed inset-x-0 top-0 z-50 px-3 pt-[max(0.7rem,env(safe-area-inset-top))] sm:px-6 sm:pt-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
          <Magnetic strength={7} className="pointer-events-auto">
            <Link
              to="/"
              aria-label={BOOK.title}
              className={`nav-mark group ${scrolled ? "nav-island-solid" : ""}`}
            >
              <span className="nav-mark-sigil" aria-hidden="true">
                T
              </span>
              <span className="flex min-w-0 flex-col leading-none">
                <span className="font-display text-[0.82rem] font-medium tracking-[-0.06em] text-foreground">
                  Tramas
                </span>
                <span className="mt-0.5 text-[0.5rem] uppercase tracking-[0.28em] text-primary/80">
                  Ocultas
                </span>
              </span>
            </Link>
          </Magnetic>

          <nav
            aria-label="Principal"
            className={`nav-island pointer-events-auto hidden px-1.5 py-1 md:flex ${
              scrolled ? "nav-island-solid" : ""
            }`}
          >
            <ul className="flex items-center">
              {links.map((link) => {
                const active = isActivePath(pathname, link.to);
                return (
                  <li key={link.to} className="relative">
                    <Link
                      to={link.to}
                      aria-current={active ? "page" : undefined}
                      className={`relative z-10 inline-flex items-center rounded-full px-3.5 py-1.5 text-[0.78rem] font-medium transition-colors duration-300 ${
                        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="nav-indicator"
                          className="nav-indicator"
                          transition={{ type: "spring", stiffness: 420, damping: 32 }}
                        />
                      )}
                      <span className="relative z-10">{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div
            className={`nav-island pointer-events-auto flex items-center gap-1 px-1.5 py-1 ${
              scrolled ? "nav-island-solid" : ""
            }`}
          >
            {user ? (
              <span className="hidden max-w-[8.5rem] truncate px-2 text-[0.72rem] font-medium text-primary sm:inline">
                Olá, {greetingName}
              </span>
            ) : (
              <Link
                to="/acesso"
                aria-label="Entrar na leitura"
                title="Entrar na leitura"
                className="hidden rounded-full px-2.5 py-1 text-[0.72rem] font-medium text-muted-foreground transition hover:text-foreground sm:inline"
              >
                Entrar
              </Link>
            )}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                aria-label="Área do administrador"
                title="Área do administrador"
                className="nav-icon-btn"
              >
                <Lock className="h-3.5 w-3.5" />
              </Link>
            )}
            {user ? (
              <button
                type="button"
                aria-label="Sair da leitura"
                title="Sair"
                className="nav-icon-btn"
                onClick={async () => {
                  await logout();
                  await queryClient.invalidateQueries({ queryKey: ["session-user"] });
                  window.location.href = "/acesso";
                }}
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            ) : (
              <Link
                to="/acesso"
                aria-label="Acesso privado"
                title="Acesso privado"
                className="nav-icon-btn sm:hidden"
              >
                <Lock className="h-3.5 w-3.5" />
              </Link>
            )}
            <SoundControl />
          </div>
        </div>
      </header>

      <nav
        aria-label="Navegação móvel"
        className="nav-dock pointer-events-none fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))] md:hidden"
      >
        <ul className="nav-island nav-island-solid pointer-events-auto mx-auto flex max-w-md items-stretch justify-between px-1.5 py-1.5">
          {links.map((link) => {
            const active = isActivePath(pathname, link.to);
            const Icon = link.icon;
            return (
              <li key={link.to} className="flex-1">
                <Link
                  to={link.to}
                  aria-current={active ? "page" : undefined}
                  className={`relative flex flex-col items-center gap-1 rounded-2xl px-1 py-1.5 text-[0.58rem] font-medium tracking-[0.04em] transition-colors ${
                    active ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-dock-indicator"
                      className="absolute inset-0 rounded-2xl bg-primary/12"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className="relative z-10 h-4 w-4" />
                  <span className="relative z-10">{link.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
