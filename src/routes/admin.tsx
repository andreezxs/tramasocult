import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { PageTransition } from "@/components/Motion";
import { getChapters, saveChapter } from "@/db/chapters.functions";
import { getSessionUser, logout } from "@/lib/auth.functions";

type ChapterRow = {
  id?: string;
  title: string;
  slug: string;
  chapter_order: number;
  content: string;
  summary: string;
  keyword: string;
  theme: string;
  cover_image: string | null;
  reading_time: number;
  published_at: string;
  is_published: boolean;
};

type ChapterForm = {
  id: string;
  title: string;
  slug: string;
  chapter_order: number;
  content: string;
  summary: string;
  keyword: string;
  theme: string;
  cover_image: string;
  reading_time: number;
  published_at: string;
  is_published: boolean;
};

const emptyForm = (): ChapterForm => ({
  id: "",
  title: "",
  slug: "",
  chapter_order: 1,
  content: "",
  summary: "",
  keyword: "",
  theme: "",
  cover_image: "",
  reading_time: 4,
  published_at: new Date().toISOString(),
  is_published: true,
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const [authorized, setAuthorized] = useState(false);
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState(
    "Verificando sua sessão...",
  );
  const [chapters, setChapters] = useState<ChapterRow[]>([]);
  const [form, setForm] = useState<ChapterForm>(emptyForm());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const user = await getSessionUser();
      if (user?.role === "admin") {
        setAuthorized(true);
        await loadChapters();
        setStatus(`Sessão ativa como ${user.email}.`);
      } else {
        setStatus(user ? "Sua conta não tem acesso de administrador." : "Entre com sua conta para acessar o painel.");
      }
    } catch {
      setStatus("Não foi possível verificar sua sessão.");
    } finally {
      setChecking(false);
    }
  }

  async function loadChapters() {
    setLoading(true);

    try {
      const data = await getChapters();

      setChapters(
        data.map((chapter) => ({
          id: chapter.id,
          title: chapter.title ?? "",
          slug: chapter.slug ?? "",
          chapter_order: chapter.chapterOrder ?? 1,
          content: chapter.content ?? "",
          summary: chapter.summary ?? "",
          keyword: chapter.keyword ?? "",
          theme: chapter.theme ?? "",
          cover_image: chapter.coverImage ?? null,
          reading_time: chapter.readingTime ?? 4,
          published_at:
            chapter.publishedAt?.toISOString() ?? new Date().toISOString(),
          is_published: chapter.isPublished ?? false,
        })),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";

      setStatus(`Erro ao carregar capítulos: ${message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();

    if (!form.title.trim() || !form.content.trim() || !form.summary.trim()) {
      setStatus("Preencha título, resumo e conteúdo antes de salvar.");
      return;
    }

    const payload = {
      ...(form.id ? { id: form.id } : {}),
      title: form.title.trim(),
      slug: form.slug.trim() || slugify(form.title),
      chapterOrder: Number(form.chapter_order || 1),
      content: form.content,
      summary: form.summary,
      keyword: form.keyword.trim() || null,
      theme: form.theme.trim() || null,
      coverImage: form.cover_image.trim() || null,
      readingTime: Number(form.reading_time || 4),
      publishedAt: form.published_at
        ? new Date(form.published_at)
        : new Date(),
      isPublished: form.is_published,
    };

    try {
      await saveChapter({
        data: payload as any,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";

      setStatus(`Não foi possível salvar: ${message}`);
      return;
    }

    setStatus("Capítulo salvo com sucesso.");
    setForm(emptyForm());
    await loadChapters();
  }

  function editChapter(chapter: ChapterRow) {
    setForm({
      id: chapter.id || "",
      title: chapter.title,
      slug: chapter.slug,
      chapter_order: chapter.chapter_order,
      content: chapter.content,
      summary: chapter.summary,
      keyword: chapter.keyword || "",
      theme: chapter.theme || "",
      cover_image: chapter.cover_image || "",
      reading_time: chapter.reading_time,
      published_at: chapter.published_at,
      is_published: chapter.is_published,
    });
  }

  if (checking) {
    return (
      <PageTransition>
        <main className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-28 sm:px-6">
          <p className="text-sm text-muted-foreground">Verificando acesso...</p>
        </main>
      </PageTransition>
    );
  }

  if (!authorized) {
    return (
      <PageTransition>
        <main className="mx-auto flex min-h-screen max-w-2xl items-center px-4 py-28 sm:px-6">
          <section className="glass-panel w-full rounded-3xl p-8 sm:p-10">
            <p className="text-[0.66rem] uppercase tracking-[0.3em] text-primary">
              Área privada
            </p>

            <h1 className="mt-4 font-display text-3xl font-semibold">
              Acesso de administrador
            </h1>

            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Entre pela tela de acesso com uma conta de administrador para gerenciar capítulos e usuários.
            </p>
            <a href="/acesso" className="mt-8 inline-flex rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90">Ir para o login</a>
            <p className="mt-4 text-sm text-muted-foreground">{status}</p>
          </section>
        </main>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <main className="mx-auto max-w-6xl px-4 py-28 sm:px-6">
        <section className="glass-panel rounded-3xl p-8 sm:p-10">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[0.66rem] uppercase tracking-[0.3em] text-primary">
                Área privada
              </p>

              <h1 className="mt-2 font-display text-3xl font-semibold">
                Gerenciar capítulos
              </h1>
            </div>

            <nav className="glass flex items-center gap-1 rounded-2xl p-1" aria-label="Administração">
              <Link to="/admin" className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Capítulos</Link>
              <Link to="/admin/usuarios" className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition hover:bg-white/5 hover:text-foreground">Usuários</Link>
            </nav>

            <button
              type="button"
              onClick={async () => { await logout(); window.location.href = "/acesso"; }}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm"
            >
              Sair
            </button>
          </div>

          <p className="mt-4 text-sm text-muted-foreground">{status}</p>

          <form
            onSubmit={handleSave}
            className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]"
          >
            <div className="space-y-4">
              <label className="block text-sm font-medium">
                Título

                <input
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                      slug: form.slug || slugify(e.target.value),
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                  placeholder="Título do capítulo"
                />
              </label>

              <label className="block text-sm font-medium">
                Slug

                <input
                  value={form.slug}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      slug: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                  placeholder="slug-do-capitulo"
                />
              </label>

              <label className="block text-sm font-medium">
                Ordem do capítulo

                <input
                  type="number"
                  value={form.chapter_order}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      chapter_order: Number(e.target.value),
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="block text-sm font-medium">
                Palavra-chave

                <input
                  value={form.keyword}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      keyword: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                  placeholder="Fio"
                />
              </label>

              <label className="block text-sm font-medium">
                Tema

                <input
                  value={form.theme}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      theme: e.target.value,
                    })
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                  placeholder="Conexões humanas"
                />
              </label>
            </div>

            <div className="space-y-4">
              <label className="block text-sm font-medium">
                Resumo

                <textarea
                  value={form.summary}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      summary: e.target.value,
                    })
                  }
                  className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                  placeholder="Resumo curto"
                />
              </label>

              <label className="block text-sm font-medium">
                Conteúdo

                <textarea
                  value={form.content}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      content: e.target.value,
                    })
                  }
                  className="mt-2 min-h-64 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                  placeholder="Texto completo do capítulo"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium">
                  Tempo de leitura

                  <input
                    type="number"
                    value={form.reading_time}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        reading_time: Number(e.target.value),
                      })
                    }
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                  />
                </label>

                <label className="flex items-center gap-2 pt-8 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        is_published: e.target.checked,
                      })
                    }
                  />
                  Publicado
                </label>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
              >
                Salvar capítulo
              </button>
            </div>
          </form>
        </section>

        <section className="glass-panel mt-6 rounded-3xl p-8 sm:p-10">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-semibold">
              Capítulos cadastrados
            </h2>

            <button
              type="button"
              onClick={() => void loadChapters()}
              className="rounded-2xl border border-white/10 px-4 py-2 text-sm"
            >
              {loading ? "Carregando..." : "Atualizar"}
            </button>
          </div>

          <div className="mt-6 space-y-3">
            {chapters.map((chapter) => (
              <button
                key={chapter.id || chapter.slug}
                type="button"
                onClick={() => editChapter(chapter)}
                className="flex w-full items-center justify-between rounded-2xl border border-white/10 bg-background/50 px-4 py-3 text-left"
              >
                <span>
                  <span className="font-semibold">{chapter.title}</span>

                  <span className="ml-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                    {chapter.slug}
                  </span>
                </span>

                <span className="text-sm text-muted-foreground">
                  {chapter.is_published ? "Publicado" : "Rascunho"}
                </span>
              </button>
            ))}

            {!loading && chapters.length === 0 && (
              <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
                Nenhum capítulo encontrado ainda.
              </p>
            )}
          </div>
        </section>
      </main>
    </PageTransition>
  );
}