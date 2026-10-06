import { AnimatePresence, motion } from "motion/react";
import { Cookie } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "tramas-cookie-consent";

export function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY) === "accepted") return;

    const show = window.setTimeout(() => setVisible(true), 2100);
    return () => window.clearTimeout(show);
  }, []);

  const accept = () => {
    window.localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.aside
          key="cookie-notice"
          role="dialog"
          aria-labelledby="cookie-notice-title"
          aria-describedby="cookie-notice-copy"
          initial={{ opacity: 0, y: 36, filter: "blur(12px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: 28, filter: "blur(10px)" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="cookie-notice"
        >
          <span className="cookie-notice-glow" aria-hidden />
          <div className="cookie-notice-icon" aria-hidden>
            <Cookie className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p
              id="cookie-notice-title"
              className="text-[0.58rem] uppercase tracking-[0.28em] text-primary"
            >
              Um pedacinho doce
            </p>
            <p
              id="cookie-notice-copy"
              className="mt-1.5 text-sm leading-relaxed text-foreground/88"
            >
              Usamos cookies leves para lembrar seu acesso e deixar a leitura mais fluida. Nada de
              tracking pesado — só o essencial para o site funcionar bem.
            </p>
          </div>
          <button type="button" onClick={accept} className="cookie-notice-cta">
            Aceitar
          </button>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
