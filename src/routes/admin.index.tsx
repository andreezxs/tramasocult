import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { getChapters, saveChapter } from "@/db/chapters.functions";
import { chapters } from "@/db/schema";
import { getSessionUser } from "@/lib/auth.functions";

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

export const Route = createFileRoute("/admin/")({
  component: AdminChaptersPage,
});

function AdminChaptersPage() {
  const [status, setStatus] = useState("Carregando capítulos...");
  const [chapterRows, setChapterRows] = useState<ChapterRow[]>([]);
  const [form, setForm] = useState<ChapterForm>(emptyForm());
  const [loading, setLoading] = useState(false);

  const loadChapters = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChapters();
      setChapterRows(
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
          published_at: chapter.publishedAt?.toISOString() ?? new Date().toISOString(),
          is_published: chapter.isPublished ?? false,
        })),
      );
      const user = await getSessionUser();
      setStatus(user?.email ? `Sessão ativa como ${user.email}.` : "Capítulos atualizados.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
      setStatus(`Erro ao carregar capítulos: ${message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadChapters();
  }, [loadChapters]);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim() || !form.summary.trim()) {
      setStatus("Preencha título, resumo e conteúdo antes de salvar.");
      return;
    }

    const payload: typeof chapters.$inferInsert = {
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
      publishedAt: form.published_at ? new Date(form.published_at) : new Date(),
      isPublished: form.is_published,
    };

    try {
      await saveChapter({ data: payload });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro desconhecido";
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

  return (
    <>
      <section className="glass-panel rounded-3xl p-8 sm:p-10">
        <div>
          <p className="text-[0.66rem] uppercase tracking-[0.3em] text-primary">Área privada</p>
          <h1 className="mt-2 font-display text-3xl font-semibold">Gerenciar capítulos</h1>
        </div>

        <p className="mt-4 text-sm text-muted-foreground">{status}</p>

        <form onSubmit={handleSave} className="mt-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4">
            <label className="block text-sm font-medium">
              Título
              <input
                value={form.title}
                onChange={(event) =>
                  setForm({
                    ...form,
                    title: event.target.value,
                    slug: form.slug || slugify(event.target.value),
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
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                placeholder="slug-do-capitulo"
              />
            </label>

            <label className="block text-sm font-medium">
              Ordem do capítulo
              <input
                type="number"
                value={form.chapter_order}
                onChange={(event) =>
                  setForm({ ...form, chapter_order: Number(event.target.value) })
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block text-sm font-medium">
              Palavra-chave
              <input
                value={form.keyword}
                onChange={(event) => setForm({ ...form, keyword: event.target.value })}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                placeholder="Fio"
              />
            </label>

            <label className="block text-sm font-medium">
              Tema
              <input
                value={form.theme}
                onChange={(event) => setForm({ ...form, theme: event.target.value })}
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
                onChange={(event) => setForm({ ...form, summary: event.target.value })}
                className="mt-2 min-h-24 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                placeholder="Resumo curto"
              />
            </label>

            <label className="block text-sm font-medium">
              Conteúdo
              <textarea
                value={form.content}
                onChange={(event) => setForm({ ...form, content: event.target.value })}
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
                  onChange={(event) =>
                    setForm({ ...form, reading_time: Number(event.target.value) })
                  }
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-background/70 px-4 py-3 text-sm outline-none"
                />
              </label>

              <label className="flex items-center gap-2 pt-8 text-sm font-medium">
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(event) => setForm({ ...form, is_published: event.target.checked })}
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
          <h2 className="font-display text-2xl font-semibold">Capítulos cadastrados</h2>
          <button
            type="button"
            onClick={() => void loadChapters()}
            className="rounded-2xl border border-white/10 px-4 py-2 text-sm"
          >
            {loading ? "Carregando..." : "Atualizar"}
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {chapterRows.map((chapter) => (
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

          {!loading && chapterRows.length === 0 && (
            <p className="rounded-2xl border border-dashed border-white/10 p-6 text-sm text-muted-foreground">
              Nenhum capítulo encontrado ainda.
            </p>
          )}
        </div>
      </section>
    </>
  );
}
