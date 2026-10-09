import { useCallback, useEffect, useState } from "react";

import {
  createUser,
  getAssignableChapters,
  getUsers,
  updateUserAccess,
  updateUserChapters,
} from "@/lib/auth.functions";

type ManagedUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  chapterIds: string[];
};

type AssignableChapter = {
  id: string;
  title: string;
  slug: string;
  chapterOrder: number;
  isPublished: boolean;
};

export function AdminUsersPanel() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [chapters, setChapters] = useState<AssignableChapter[]>([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [newUserChapterIds, setNewUserChapterIds] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [draftChapterIds, setDraftChapterIds] = useState<string[]>([]);
  const [status, setStatus] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [nextUsers, nextChapters] = await Promise.all([getUsers(), getAssignableChapters()]);
      setUsers(nextUsers as ManagedUser[]);
      setChapters(nextChapters as AssignableChapter[]);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível carregar os usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  function toggleChapter(chapterId: string, current: string[], setter: (ids: string[]) => void) {
    setter(
      current.includes(chapterId)
        ? current.filter((id) => id !== chapterId)
        : [...current, chapterId],
    );
  }

  async function handleCreateUser(event: React.FormEvent) {
    event.preventDefault();
    try {
      await createUser({ data: { ...newUser, chapterIds: newUserChapterIds } });
      setNewUser({ name: "", email: "", password: "" });
      setNewUserChapterIds([]);
      setStatus("Usuário criado com os textos selecionados.");
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

  function openUserTexts(user: ManagedUser) {
    setSelectedUserId(user.id);
    setDraftChapterIds(user.chapterIds);
    setStatus("");
  }

  function selectAllChapters() {
    setDraftChapterIds(chapters.map((chapter) => chapter.id));
  }

  async function handleSaveTexts() {
    if (!selectedUserId) return;
    setSaving(true);
    try {
      const result = await updateUserChapters({
        data: { id: selectedUserId, chapterIds: draftChapterIds },
      });
      const savedIds = result.chapterIds ?? draftChapterIds;
      setDraftChapterIds(savedIds);
      setStatus(`${savedIds.length} textos liberados para este usuário.`);
      await loadUsers();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Não foi possível atualizar os textos.");
    } finally {
      setSaving(false);
    }
  }

  const selectedUser = users.find((user) => user.id === selectedUserId) ?? null;

  return (
    <section className="glass-panel rounded-3xl p-8 sm:p-10">
      <div>
        <p className="text-[0.66rem] uppercase tracking-[0.3em] text-primary">Controle de acesso</p>
        <h1 className="mt-2 font-display text-3xl font-semibold">Usuários e textos</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Cada pessoa entra só nos textos que você marcar. Selecione um usuário para ver e alterar o
          que ele pode ler.
        </p>
      </div>

      <form onSubmit={handleCreateUser} className="mt-8 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <input
            required
            value={newUser.name}
            onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
            placeholder="Nome"
            className="rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
          />
          <input
            required
            type="email"
            value={newUser.email}
            onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
            placeholder="E-mail"
            className="rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
          />
          <input
            required
            minLength={8}
            type="password"
            value={newUser.password}
            onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
            placeholder="Senha (8+ caracteres)"
            className="rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
          />
        </div>

        {chapters.length > 0 && (
          <div className="rounded-2xl border border-white/10 bg-background/30 p-4">
            <p className="text-sm font-medium">Textos para este novo usuário</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              {chapters.map((chapter) => (
                <label
                  key={chapter.id}
                  className="flex items-start gap-2 rounded-xl px-2 py-1.5 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={newUserChapterIds.includes(chapter.id)}
                    onChange={() =>
                      toggleChapter(chapter.id, newUserChapterIds, setNewUserChapterIds)
                    }
                    className="mt-1"
                  />
                  <span>
                    {chapter.title}
                    {!chapter.isPublished && (
                      <span className="ml-2 text-xs text-muted-foreground">rascunho</span>
                    )}
                  </span>
                </label>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105"
        >
          Liberar usuário
        </button>
      </form>

      {status && <p className="mt-4 text-sm text-muted-foreground">{status}</p>}
      {loading && <p className="mt-4 text-sm text-muted-foreground">Carregando usuários...</p>}

      <div className="mt-6 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-3">
          {users.map((user) => (
            <div
              key={user.id}
              className={`rounded-2xl border bg-background/40 px-4 py-3 ${selectedUserId === user.id ? "border-primary/50" : "border-white/10"}`}
            >
              <button
                type="button"
                onClick={() => openUserTexts(user)}
                className="w-full text-left"
              >
                <p className="font-semibold">{user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {user.email} · {user.role}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {user.role === "admin"
                    ? "Acesso a todos os textos"
                    : `${selectedUserId === user.id ? draftChapterIds.length : user.chapterIds.length} textos liberados`}
                </p>
              </button>
              <button
                type="button"
                disabled={user.role === "admin"}
                onClick={() => void handleToggleUser(user)}
                className="mt-3 rounded-xl border border-white/10 px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-40"
              >
                {user.isActive ? "Revogar acesso" : "Liberar acesso"}
              </button>
            </div>
          ))}
          {!loading && users.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
              Nenhum usuário cadastrado.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-background/30 p-5">
          {!selectedUser && (
            <p className="text-sm text-muted-foreground">
              Selecione um usuário à esquerda para ver e editar os textos que ele pode acessar.
            </p>
          )}

          {selectedUser && selectedUser.role === "admin" && (
            <p className="text-sm text-muted-foreground">
              Administradores já enxergam todos os textos. Não é preciso marcar capítulos.
            </p>
          )}

          {selectedUser && selectedUser.role !== "admin" && (
            <>
              <h2 className="font-display text-xl font-semibold">{selectedUser.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {draftChapterIds.length} de {chapters.length} textos marcados.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={selectAllChapters}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs"
                >
                  Marcar todos
                </button>
                <button
                  type="button"
                  onClick={() => setDraftChapterIds([])}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs"
                >
                  Limpar
                </button>
              </div>
              <div className="mt-4 space-y-2">
                {chapters.map((chapter) => (
                  <label
                    key={chapter.id}
                    className="flex items-start gap-3 rounded-xl border border-white/5 bg-background/40 px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={draftChapterIds.includes(chapter.id)}
                      onChange={() =>
                        toggleChapter(chapter.id, draftChapterIds, setDraftChapterIds)
                      }
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">{chapter.title}</span>
                      <span className="ml-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {chapter.slug}
                      </span>
                      {!chapter.isPublished && (
                        <span className="ml-2 text-xs text-muted-foreground">rascunho</span>
                      )}
                    </span>
                  </label>
                ))}
                {chapters.length === 0 && (
                  <p className="rounded-xl border border-dashed border-white/10 p-4 text-sm text-muted-foreground">
                    Cadastre capítulos na aba Capítulos para poder liberá-los.
                  </p>
                )}
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => void handleSaveTexts()}
                className="mt-4 w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:brightness-105 disabled:opacity-60"
              >
                {saving ? "Salvando..." : "Salvar textos deste usuário"}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
