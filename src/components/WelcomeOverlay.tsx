import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useState } from "react";

import { firstNameOf, sessionQuery } from "@/lib/session";

function clearWelcomeParam() {
  const url = new URL(window.location.href);
  url.searchParams.delete("welcome");
  window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
}

function passportCode(id: string) {
  const compact = id.replace(/-/g, "").slice(-8).toUpperCase();
  return `TO-${compact.slice(0, 4)}-${compact.slice(4)}`;
}

function initialsOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "TO";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function lastNameOf(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return "—";
  return parts.slice(1).join(" ").toUpperCase();
}

function formatIssueDate() {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());
}

export function WelcomeOverlay() {
  const search = useRouterState({ select: (state) => state.location.searchStr });
  const { data: user } = useQuery(sessionQuery());
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [spread, setSpread] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
    if (params.get("welcome") === "1" && user?.name) {
      setSpread(false);
      setOpen(true);
    }
  }, [search, user?.name]);

  useEffect(() => {
    if (!open) return;
    const openAt = reduce ? 80 : 720;
    const leaveAt = reduce ? 1400 : 4200;
    const openTimer = window.setTimeout(() => setSpread(true), openAt);
    const leaveTimer = window.setTimeout(() => {
      setOpen(false);
      clearWelcomeParam();
    }, leaveAt);
    return () => {
      window.clearTimeout(openTimer);
      window.clearTimeout(leaveTimer);
    };
  }, [open, reduce]);

  const close = () => {
    setOpen(false);
    clearWelcomeParam();
  };

  const fullName = user?.name?.trim() || "Leitor";
  const name = firstNameOf(fullName);
  const code = useMemo(() => passportCode(user?.id ?? "tramas"), [user?.id]);
  const issued = formatIssueDate();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="passport-welcome"
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, filter: "blur(10px)" }}
          transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
          className="passport-stage"
          onClick={close}
        >
          <div className="passport-room" />
          <motion.div
            className={`passport-scene${spread ? " is-open" : ""}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="passport-book">
              <div className="passport-page">
                <div className="passport-page-head">
                  <span>República das Tramas Ocultas</span>
                  <span>Passaporte · Passport</span>
                </div>
                <div className="passport-bio">
                  <div className="passport-photo" aria-hidden>
                    <span>{initialsOf(fullName)}</span>
                  </div>
                  <dl className="passport-fields">
                    <div>
                      <dt>Tipo / Type</dt>
                      <dd>P</dd>
                    </div>
                    <div>
                      <dt>Código / Code</dt>
                      <dd>TO</dd>
                    </div>
                    <div className="passport-span">
                      <dt>N.º / No.</dt>
                      <dd>{code}</dd>
                    </div>
                    <div className="passport-span">
                      <dt>Sobrenome / Surname</dt>
                      <dd>{lastNameOf(fullName)}</dd>
                    </div>
                    <div className="passport-span">
                      <dt>Nome / Given name</dt>
                      <dd>{name.toUpperCase()}</dd>
                    </div>
                    <div>
                      <dt>Nacionalidade</dt>
                      <dd>{user?.role === "admin" ? "Guardião" : "Leitor"}</dd>
                    </div>
                    <div>
                      <dt>Emissão</dt>
                      <dd>{issued}</dd>
                    </div>
                  </dl>
                </div>
                <p className="passport-welcome">Seja bem-vindo, {name}</p>
                <div className="passport-stamp" aria-hidden>
                  <span>Visto</span>
                  <strong>Entrada liberada</strong>
                </div>
                <p className="passport-mrz" aria-hidden>
                  {`P<TO${fullName.replace(/[^a-zA-Z]+/g, "<").toUpperCase()}`}
                </p>
              </div>
              <div className="passport-cover">
                <div className="passport-cover-inner">
                  <p className="passport-cover-kicker">República das Tramas</p>
                  <div className="passport-crest" aria-hidden>
                    <span>TO</span>
                  </div>
                  <h2>Passaporte</h2>
                  <p className="passport-cover-sub">Vozes da Vida</p>
                </div>
              </div>
            </div>
            <p className="passport-hint">Toque para entrar</p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
