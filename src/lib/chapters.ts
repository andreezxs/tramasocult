import { queryOptions } from "@tanstack/react-query";

import { getPublishedChapters } from "@/db/chapters.functions";

export interface Chapter {
  id: string;
  title: string;
  slug: string;
  chapter_order: number;
  content: string;
  summary: string;
  keyword: string | null;
  theme: string | null;
  cover_image: string | null;
  reading_time: number;
  published_at: string;
}

const FALLBACK_CHAPTERS: Chapter[] = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    title: "Acesso ao livro",
    slug: "acesso-ao-livro",
    chapter_order: 1,
    content:
      "Quer acessar Tramas Ocultas: Vozes da Vida?\n\n" +
      "Chame na DM e solicite o acesso." +
    summary:
      "Sobre os laços que sustentam pessoas mesmo quando ninguém está olhando.",
    keyword: "Fio",
    theme: "Conexões humanas",
    cover_image: null,
    reading_time: 4,
    published_at: new Date().toISOString(),
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    title: "Solicite seu acesso",
    slug: "solicite-seu-acesso",
    chapter_order: 2,
    content:
      "O livro está disponível para leitura mediante acesso liberado.\n\n" +
      "Chame na DM para receber as orientações. " +
    summary:
      "O que resta quando desligamos o barulho que usamos para não nos ouvir.",
    keyword: "Silêncio",
    theme: "Excesso e escuta",
    cover_image: null,
    reading_time: 5,
    published_at: new Date().toISOString(),
  },
];

export async function fetchChapters(): Promise<Chapter[]> {
  try {
    const data = await getPublishedChapters();

    return data.map((chapter) => ({
      id: chapter.id,
      title: chapter.title,
      slug: chapter.slug,
      chapter_order: chapter.chapterOrder,
      content: chapter.content,
      summary: chapter.summary,
      keyword: chapter.keyword,
      theme: chapter.theme,
      cover_image: chapter.coverImage,
      reading_time: chapter.readingTime,
      published_at: chapter.publishedAt.toISOString(),
    }));
  } catch (error) {
    console.warn(
      "[PostgreSQL] fetchChapters failed, falling back to local chapter data:",
      error instanceof Error ? error.message : error,
    );

    return FALLBACK_CHAPTERS;
  }
}

export const chaptersQuery = () =>
  queryOptions({
    queryKey: ["chapters"],
    queryFn: fetchChapters,
    staleTime: 5 * 60 * 1000,
  });

export function chapterNeighbors(chapters: Chapter[], slug: string) {
  const index = chapters.findIndex((c) => c.slug === slug);

  return {
    index,
    chapter: index >= 0 ? chapters[index] : undefined,
    previous: index > 0 ? chapters[index - 1] : undefined,
    next:
      index >= 0 && index < chapters.length - 1
        ? chapters[index + 1]
        : undefined,
  };
}

export const BOOK = {
  title: "Tramas Ocultas: Vozes da Vida",
  author: "@designerandrecmg",
  subtitle: "Um livro digital sobre o que existe por baixo do visível.",
} as const;
