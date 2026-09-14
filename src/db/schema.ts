import {
  boolean,
  integer,
  pgTable,
  uniqueIndex,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const chapters = pgTable("chapters", {
  id: uuid("id").primaryKey().defaultRandom(),

  title: text("title").notNull(),

  slug: text("slug").notNull(),

  chapterOrder: integer("chapter_order").notNull(),

  content: text("content").notNull(),

  summary: text("summary").notNull(),

  keyword: text("keyword"),

  theme: text("theme"),

  coverImage: text("cover_image"),

  readingTime: integer("reading_time").notNull(),

  publishedAt: timestamp("published_at", {
    withTimezone: true,
  }).notNull(),

  isPublished: boolean("is_published").notNull().default(false),
});

export const siteUsers = pgTable(
  "site_users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull().default("user"),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    emailUnique: uniqueIndex("site_users_email_unique").on(table.email),
  }),
);

export const siteSessions = pgTable(
  "site_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tokenHash: text("token_hash").notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => siteUsers.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tokenUnique: uniqueIndex("site_sessions_token_unique").on(table.tokenHash),
  }),
);