import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AdminUsersPanel } from "@/components/AdminUsersPanel";
import { PageTransition } from "@/components/Motion";
import { getSessionUser, logout } from "@/lib/auth.functions";

export const Route = createFileRoute("/admin/usuarios")({
  component: AdminUsersPage,
});

function AdminUsersPage() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    void getSessionUser().then((user) => {
      setAuthorized(user?.role === "admin");
      setChecking(false);
    });
  }, []);

  if (checking) {
    return <main className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Verificando acesso...</main>;
  }

  if (!authorized) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-4 py-28">
        <section className="glass-panel w-full p-8 text-center">
          <h1 className="font-display text-2xl font-semibold">Acesso de administrador necessário</h1>
          <Link to="/acesso" className="mt-6 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">Ir para o login</Link>
        </section>
      </main>
    );
  }

  return (
    <PageTransition>
      <main className="mx-auto max-w-6xl px-4 py-28 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav className="glass flex items-center gap-1 rounded-2xl p-1" aria-label="Administração">
            <Link to="/admin" className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground">Capítulos</Link>
            <Link to="/admin/usuarios" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Usuários</Link>
          </nav>
          <button type="button" onClick={async () => { await logout(); window.location.href = "/acesso"; }} className="rounded-xl border border-white/10 px-4 py-2 text-sm">Sair</button>
        </div>
        <AdminUsersPanel />
      </main>
    </PageTransition>
  );
}