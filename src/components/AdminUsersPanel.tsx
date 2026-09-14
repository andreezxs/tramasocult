import { useEffect, useState } from "react";

import { createUser, getUsers, updateUserAccess } from "@/lib/auth.functions";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
};

export function AdminUsersPanel() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [status, setStatus] = useState("");

  async function loadUsers() {
    setUsers((await getUsers()) as ManagedUser[]);
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    try {
      await createUser({ data: newUser });
      setNewUser({ name: "", email: "", password: "" });
      setStatus("Usuário criado e autorizado.");
      await loadUsers();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível criar o usuário.");
    }
  }

  async function handleToggleUser(user: ManagedUser) {
    try {
      await updateUserAccess({ data: { id: user.id, isActive: !user.isActive } });
      await loadUsers();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível atualizar o usuário.");
    }
  }

  return (
    <section className="glass-panel rounded-3xl p-8 sm:p-10">
      <div>
        <p className="text-[0.66rem] uppercase tracking-[0.3em] text-primary">Controle de acesso</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Usuários autorizados</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Crie contas individuais e revogue o acesso de quem não deve mais entrar na leitura.
        </p>
      </div>

      <form onSubmit={handleCreateUser} className="mt-8 grid gap-3 sm:grid-cols-3">
        <input required value={newUser.name} onChange={(event) => setNewUser({ ...newUser, name: event.target.value })} placeholder="Nome" className="rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none" />
        <input required type="email" value={newUser.email} onChange={(event) => setNewUser({ ...newUser, email: event.target.value })} placeholder="E-mail" className="rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none" />
        <input required minLength={8} type="password" value={newUser.password} onChange={(event) => setNewUser({ ...newUser, password: event.target.value })} placeholder="Senha (8+ caracteres)" className="rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none" />
        <button type="submit" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105 sm:col-span-3">Liberar usuário</button>
      </form>

      {status && <p className="mt-4 text-sm text-muted-foreground">{status}</p>}

      <div className="mt-6 space-y-3">
        {users.map((user) => (
          <div key={user.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-background/40 px-4 py-3">
            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.email} · {user.role}</p>
            </div>
            <button type="button" disabled={user.role === "admin"} onClick={() => void handleToggleUser(user)} className="rounded-xl border border-white/10 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40">
              {user.isActive ? "Revogar acesso" : "Liberar acesso"}
            </button>
          </div>
        ))}
        {users.length === 0 && <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">Nenhum usuário cadastrado.</p>}
      </div>
    </section>
  );
}