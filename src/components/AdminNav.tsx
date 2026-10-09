import { Link, useRouterState } from "@tanstack/react-router";

import { logout } from "@/lib/auth.functions";

export function AdminNav() {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const onUsers = pathname.startsWith("/admin/usuarios");

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <nav className="glass flex items-center gap-1 rounded-2xl p-1" aria-label="Administração">
        <Link
          to="/admin"
          className={
            onUsers
              ? "rounded-xl px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
              : "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          }
        >
          Capítulos
        </Link>
        <Link
          to="/admin/usuarios"
          className={
            onUsers
              ? "rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              : "rounded-xl px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground"
          }
        >
          Usuários
        </Link>
      </nav>
      <button
        type="button"
        onClick={async () => {
          await logout();
          window.location.href = "/acesso";
        }}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm"
      >
        Sair
      </button>
    </div>
  );
}
