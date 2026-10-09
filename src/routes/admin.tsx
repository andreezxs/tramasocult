import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminNav } from "@/components/AdminNav";
import { PageTransition } from "@/components/Motion";
import { getSessionUser } from "@/lib/auth.functions";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [status, setStatus] = useState("Verificando sua sessão...");

  useEffect(() => {
    let active = true;

    void getSessionUser()
      .then((user) => {
        if (!active) return;
        if (user?.role === "admin") {
          setAuthorized(true);
          setStatus(`Sessão ativa como ${user.email}.`);
          return;
        }
        setAuthorized(false);
        setStatus(
          user
            ? "Sua conta não tem acesso de administrador."
            : "Entre com sua conta para acessar o painel.",
        );
      })
      .catch(() => {
        if (!active) return;
        setAuthorized(false);
        setStatus("Não foi possível verificar sua sessão.");
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return (
      <PageTransition>
        <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-16 sm:px-6">
          <p className="text-sm text-muted-foreground">Verificando acesso...</p>
        </main>
      </PageTransition>
    );
  }

  if (!authorized) {
    return (
      <PageTransition>
        <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-16 sm:px-6">
          <section className="glass-panel w-full rounded-3xl p-8 sm:p-10">
            <p className="text-[0.66rem] uppercase tracking-[0.3em] text-primary">Área privada</p>
            <h1 className="mt-4 font-display text-3xl font-semibold">Acesso de administrador</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Entre pela tela de acesso com uma conta de administrador para gerenciar capítulos e
              usuários.
            </p>
            <a
              href="/acesso"
              className="mt-8 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              Ir para o login
            </a>
            <p className="mt-4 text-sm text-muted-foreground">{status}</p>
          </section>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <AdminNav />
        <Outlet />
      </main>
    </PageTransition>
  );
}
