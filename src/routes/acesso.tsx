import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LockKeyhole, ArrowRight } from "lucide-react";
import { useState } from "react";

import { PageTransition } from "@/components/Motion";
import { loginUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/acesso")({
  head: () => ({
    meta: [
      { title: "Acesso privado | Tramas Ocultas" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AccessPage,
});

function AccessPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const user = await loginUser({ data: { email, password } });
      await navigate({ to: user.role === "admin" ? "/admin" : "/livro" });
    } catch {
      setError("Código de acesso inválido.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <main className="mx-auto flex min-h-[calc(100svh-8rem)] max-w-xl items-center px-4 py-28 sm:px-6">
        <section className="glass-panel w-full p-7 sm:p-10">
          <span className="glass grid h-12 w-12 place-items-center rounded-2xl text-primary">
            <LockKeyhole className="h-5 w-5" aria-hidden />
          </span>
          <p className="mt-7 text-[0.64rem] uppercase tracking-[0.3em] text-primary">Acesso privado</p>
          <h1 className="title-gradient mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Uma leitura para convidados.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            Entre com o e-mail e a senha liberados pelo administrador.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <label className="block text-sm font-medium">
              E-mail
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none transition focus:border-primary/60"
                placeholder="voce@email.com"
              />
            </label>

            <label className="block text-sm font-medium">
              Senha
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none transition focus:border-primary/60"
                placeholder="Digite sua senha"
              />
            </label>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:cursor-wait disabled:opacity-60"
            >
              {loading ? "Verificando..." : "Entrar na leitura"}
              {!loading && <ArrowRight className="h-4 w-4" aria-hidden />}
            </button>
          </form>
        </section>
      </main>
    </PageTransition>
  );
}