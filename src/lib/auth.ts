import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt, inArray, sql } from "drizzle-orm";
import { deleteCookie, getCookie, getRequestHeader, setCookie } from "@tanstack/react-start/server";

import { db } from "@/db/client";
import { chapters, siteSessions, siteUsers, userChapterAccess } from "@/db/schema";

const SESSION_COOKIE = "tramas_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function passwordHash(password: string, salt = randomBytes(16).toString("hex")) {
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function passwordMatches(password: string, storedHash: string) {
  const [salt, expected] = storedHash.split(":");
  if (!salt || !expected) return false;
  const actual = scryptSync(password, salt, 64).toString("hex");
  const actualBuffer = Buffer.from(actual);
  const expectedBuffer = Buffer.from(expected);
  return (
    actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function isSecureRequest() {
  const forwarded = getRequestHeader("x-forwarded-proto");
  if (forwarded) return forwarded.split(",")[0]?.trim() === "https";
  return process.env["NODE_ENV"] === "production";
}

function readSessionToken(cookieHeader?: string | undefined) {
  try {
    const fromApi = getCookie(SESSION_COOKIE);
    if (fromApi) return fromApi;
  } catch {
    /* sem contexto de request */
  }
  const cookie = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return cookie?.slice(SESSION_COOKIE.length + 1) ?? null;
}

function setSessionCookie(token: string) {
  setCookie(SESSION_COOKIE, token, {
    httpOnly: true,
    path: "/",
    maxAge: SESSION_MAX_AGE,
    sameSite: "lax",
    secure: isSecureRequest(),
  });
}

async function getUserFromCookie(cookieHeader?: string | undefined): Promise<AuthUser | null> {
  const token = readSessionToken(cookieHeader);
  if (!token) return null;

  const result = await db
    .select({
      id: siteUsers.id,
      name: siteUsers.name,
      email: siteUsers.email,
      role: siteUsers.role,
    })
    .from(siteSessions)
    .innerJoin(siteUsers, eq(siteUsers.id, siteSessions.userId))
    .where(
      and(
        eq(siteSessions.tokenHash, hashToken(token)),
        gt(siteSessions.expiresAt, new Date()),
        eq(siteUsers.isActive, true),
      ),
    )
    .limit(1);

  const user = result[0];
  if (!user || (user.role !== "admin" && user.role !== "user")) return null;
  return { ...user, role: user.role };
}

async function ensureInitialAdmin(email: string, password: string) {
  const adminEmail = process.env["SITE_ADMIN_EMAIL"]?.trim().toLowerCase();
  const adminPassword = process.env["SITE_ADMIN_PASSWORD"];
  if (!adminEmail || !adminPassword || email !== adminEmail || password !== adminPassword) return;

  const existingAdmin = await db
    .select()
    .from(siteUsers)
    .where(eq(siteUsers.email, adminEmail))
    .limit(1);
  const admin = existingAdmin[0];

  if (admin) {
    const needsUpdate =
      admin.role !== "admin" ||
      !admin.isActive ||
      !passwordMatches(adminPassword, admin.passwordHash);
    if (needsUpdate) {
      await db
        .update(siteUsers)
        .set({
          passwordHash: passwordHash(adminPassword),
          role: "admin",
          isActive: true,
        })
        .where(eq(siteUsers.id, admin.id));
    }
    return;
  }

  await db.insert(siteUsers).values({
    name: "Administrador",
    email: adminEmail,
    passwordHash: passwordHash(adminPassword),
    role: "admin",
    isActive: true,
  });
}

export function getUserFromRequest(request: Request): Promise<AuthUser | null> {
  return getUserFromCookie(request.headers.get("cookie") ?? undefined);
}

export function getCurrentUser(): Promise<AuthUser | null> {
  return getUserFromCookie(getRequestHeader("cookie"));
}

export function hasValidSession(request: Request) {
  return getUserFromCookie(request.headers.get("cookie") ?? undefined).then(Boolean);
}

export async function authenticateUser(email: string, password: string) {
  const normalizedEmail = normalizeEmail(email);
  await ensureInitialAdmin(normalizedEmail, password);
  const result = await db
    .select()
    .from(siteUsers)
    .where(eq(siteUsers.email, normalizedEmail))
    .limit(1);
  const user = result[0];

  if (!user || !user.isActive || !passwordMatches(password, user.passwordHash)) return null;

  const token = randomBytes(32).toString("base64url");
  await db.insert(siteSessions).values({
    tokenHash: hashToken(token),
    userId: user.id,
    expiresAt: new Date(Date.now() + SESSION_MAX_AGE * 1000),
  });
  setSessionCookie(token);
  return { id: user.id, name: user.name, email: user.email, role: user.role as "admin" | "user" };
}

export async function logoutUser() {
  const token = readSessionToken();
  if (token) await db.delete(siteSessions).where(eq(siteSessions.tokenHash, hashToken(token)));
  deleteCookie(SESSION_COOKIE, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: isSecureRequest(),
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Response("Acesso não autorizado", { status: 401 });
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin")
    throw new Response("Acesso de administrador necessário", { status: 403 });
  return user;
}

export async function createManagedUser(name: string, email: string, password: string) {
  await requireAdmin();
  const result = await db
    .insert(siteUsers)
    .values({
      name: name.trim(),
      email: normalizeEmail(email),
      passwordHash: passwordHash(password),
      role: "user",
    })
    .returning({
      id: siteUsers.id,
      name: siteUsers.name,
      email: siteUsers.email,
      role: siteUsers.role,
      isActive: siteUsers.isActive,
    });
  return result[0];
}

let accessTableReady: Promise<void> | null = null;

async function ensureUserChapterAccessTable() {
  if (!accessTableReady) {
    accessTableReady = (async () => {
      await db.execute(sql`
        CREATE TABLE IF NOT EXISTS "user_chapter_access" (
          "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
          "user_id" uuid NOT NULL REFERENCES "public"."site_users"("id") ON DELETE cascade,
          "chapter_id" uuid NOT NULL REFERENCES "public"."chapters"("id") ON DELETE cascade,
          "created_at" timestamp with time zone DEFAULT now() NOT NULL
        )
      `);
      await db.execute(sql`
        CREATE UNIQUE INDEX IF NOT EXISTS "user_chapter_access_unique"
          ON "user_chapter_access" USING btree ("user_id","chapter_id")
      `);
    })();
  }
  await accessTableReady;
}

export async function listManagedUsers() {
  await requireAdmin();
  await ensureUserChapterAccessTable();
  const users = await db
    .select({
      id: siteUsers.id,
      name: siteUsers.name,
      email: siteUsers.email,
      role: siteUsers.role,
      isActive: siteUsers.isActive,
    })
    .from(siteUsers)
    .orderBy(siteUsers.createdAt);

  const accessRows = await db
    .select({
      userId: userChapterAccess.userId,
      chapterId: userChapterAccess.chapterId,
    })
    .from(userChapterAccess);

  const chaptersByUser = new Map<string, string[]>();
  for (const row of accessRows) {
    const current = chaptersByUser.get(row.userId) ?? [];
    current.push(row.chapterId);
    chaptersByUser.set(row.userId, current);
  }

  return users.map((user) => ({
    ...user,
    chapterIds: chaptersByUser.get(user.id) ?? [],
  }));
}

export async function setManagedUserActive(id: string, isActive: boolean) {
  await requireAdmin();
  return db
    .update(siteUsers)
    .set({ isActive })
    .where(eq(siteUsers.id, id))
    .returning({ id: siteUsers.id, isActive: siteUsers.isActive });
}

export async function requireReaderAccess() {
  const user = await getCurrentUser();
  if (user) return user;
  throw new Response("Acesso não autorizado", { status: 401 });
}

export async function listAssignableChapters() {
  await requireAdmin();
  return db
    .select({
      id: chapters.id,
      title: chapters.title,
      slug: chapters.slug,
      chapterOrder: chapters.chapterOrder,
      isPublished: chapters.isPublished,
    })
    .from(chapters)
    .orderBy(chapters.chapterOrder);
}

export async function setManagedUserChapters(userId: string, chapterIds: string[]) {
  await requireAdmin();
  await ensureUserChapterAccessTable();

  const user = await db
    .select({ id: siteUsers.id, role: siteUsers.role })
    .from(siteUsers)
    .where(eq(siteUsers.id, userId))
    .limit(1);

  if (!user[0]) throw new Error("Usuário não encontrado");

  const uniqueChapterIds = Array.from(new Set(chapterIds.filter(Boolean)));
  const validChapterIds =
    uniqueChapterIds.length === 0
      ? []
      : (
          await db
            .select({ id: chapters.id })
            .from(chapters)
            .where(inArray(chapters.id, uniqueChapterIds))
        ).map((chapter) => chapter.id);

  await db.delete(userChapterAccess).where(eq(userChapterAccess.userId, userId));

  if (validChapterIds.length === 0) {
    return { id: userId, chapterIds: [] as string[] };
  }

  await db.insert(userChapterAccess).values(
    validChapterIds.map((chapterId) => ({
      userId,
      chapterId,
    })),
  );

  return { id: userId, chapterIds: validChapterIds };
}

export async function getReadableChapterIds(userId: string, role: string) {
  if (role === "admin") return null;

  await ensureUserChapterAccessTable();

  const rows = await db
    .select({ chapterId: userChapterAccess.chapterId })
    .from(userChapterAccess)
    .where(eq(userChapterAccess.userId, userId));

  return rows.map((row) => row.chapterId);
}
