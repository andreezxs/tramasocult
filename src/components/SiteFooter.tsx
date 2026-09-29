import { Link } from "@tanstack/react-router";
import { motion } from "motion/react";
import { ArrowUpRight, Instagram, Mail } from "lucide-react";
import { BOOK } from "@/lib/chapters";

const footerLinks = [
  { to: "/", label: "Início" },
  { to: "/livro", label: "O Livro" },
  { to: "/sobre", label: "Sobre" },
  { to: "/autor", label: "Autor" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteFooter() {
  return (
    <footer className="relative mx-auto mt-16 w-full max-w-6xl px-3 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:mt-24 sm:px-6 sm:pb-10">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="footer-shell"
      >
        <span className="footer-glow" aria-hidden />
        <span className="footer-line" aria-hidden />

        <div className="relative grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
          <div>
            <p className="text-[0.58rem] uppercase tracking-[0.32em] text-primary">Obra digital</p>
            <p className="mt-3 font-display text-[1.7rem] font-medium leading-[0.92] tracking-[-0.06em] sm:text-4xl">
              Tramas Ocultas
              <span className="mt-1 block text-[0.72em] text-foreground/55">Vozes da Vida</span>
            </p>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              {BOOK.subtitle} Escrito por {BOOK.author}.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between lg:flex-col lg:items-end">
            <nav aria-label="Links do rodapé" className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {footerLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com/designerandrecmg"
                target="_blank"
                rel="noopener noreferrer"
                className="nav-icon-btn"
                aria-label="Instagram do autor"
              >
                <Instagram className="h-3.5 w-3.5" />
              </a>
              <a
                href="mailto:designerandrecmg@gmail.com"
                className="nav-icon-btn"
                aria-label="Enviar e-mail"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
              <Link to="/livro" className="footer-cta">
                Ler agora
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="relative mt-8 flex flex-col gap-2 border-t border-white/8 pt-4 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <span>Leitura digital contínua</span>
          <span>{BOOK.author}</span>
        </div>
      </motion.div>
    </footer>
  );
}
