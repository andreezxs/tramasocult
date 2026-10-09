import { createServerFn } from "@tanstack/react-start";
import { asc, eq, inArray } from "drizzle-orm";

import { db } from "./client";
import { chapters } from "./schema";
import { getReadableChapterIds, requireAdmin, requireReaderAccess } from "@/lib/auth";

export const getPublishedChapters = createServerFn({
  method: "GET",
}).handler(async () => {
  const user = await requireReaderAccess();
  const allowedIds = await getReadableChapterIds(user.id, user.role);

  if (allowedIds && allowedIds.length === 0) {
    return [];
  }

  if (allowedIds) {
    return await db
      .select()
      .from(chapters)
      .where(inArray(chapters.id, allowedIds))
      .orderBy(asc(chapters.chapterOrder));
  }

  return await db
    .select()
    .from(chapters)
    .where(eq(chapters.isPublished, true))
    .orderBy(asc(chapters.chapterOrder));
});

export const getChapters = createServerFn({
  method: "GET",
}).handler(async () => {
  await requireAdmin();
  return await db.select().from(chapters).orderBy(asc(chapters.chapterOrder));
});

export const saveChapter = createServerFn({
  method: "POST",
})
  .validator((data: typeof chapters.$inferInsert) => data)
  .handler(async ({ data }) => {
    await requireAdmin();
    if (data.id) {
      const result = await db
        .update(chapters)
        .set({
          title: data.title,
          slug: data.slug,
          chapterOrder: data.chapterOrder,
          content: data.content,
          summary: data.summary,
          keyword: data.keyword,
          theme: data.theme,
          coverImage: data.coverImage,
          readingTime: data.readingTime,
          publishedAt: data.publishedAt,
          isPublished: data.isPublished,
        })
        .where(eq(chapters.id, data.id))
        .returning();

      return result[0];
    }

    const result = await db.insert(chapters).values(data).returning();

    return result[0];
  });
