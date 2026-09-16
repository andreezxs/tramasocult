import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { getRequestHeader, setResponseHeader } from "@tanstack/react-start/server";

import { db } from "@/db/client";
import { siteSessions, siteUsers } from "@/db/schema";

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
  return actualBuffer.length === expectedBuffer.length && timingSafeEqual(actualBuffer, expectedBuffer);
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function readSessionToken(cookieHeader = getRequestHeader("cookie")) {
  const cookie = cookieHeader
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));
  return cookie?.slice(SESSION_COOKIE.length + 1) ?? null;
}

function setSessionCookie(token: string) {
  const secure = process.env["NODE_ENV"] === "production" ? "; Secure" : "";
  setResponseHeader(
    "Set-Cookie",
    `${SESSION_COOKIE}=${token}; Max-Age=${SESSION_MAX_AGE}; Path=/; HttpOnly; SameSite=Lax${secure}`,
  );
}

async function getUserFromCookie(cookieHeader: string | undefined): Promise<AuthUser | null> {
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

  const existingUser = await db.select({ id: siteUsers.id }).from(siteUsers).limit(1);
  if (existingUser[0]) return;

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
  const result = await db.select().from(siteUsers).where(eq(siteUsers.email, normalizedEmail)).limit(1);
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
  setResponseHeader("Set-Cookie", `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; SameSite=Lax`);
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Response("Acesso não autorizado", { status: 401 });
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new Response("Acesso de administrador necessário", { status: 403 });
  return user;
}

export async function createManagedUser(name: string, email: string, password: string) {
  await requireAdmin();
  const result = await db
    .insert(siteUsers)
    .values({ name: name.trim(), email: normalizeEmail(email), passwordHash: passwordHash(password), role: "user" })
    .returning({ id: siteUsers.id, name: siteUsers.name, email: siteUsers.email, role: siteUsers.role, isActive: siteUsers.isActive });
  return result[0];
}

export async function listManagedUsers() {
  await requireAdmin();
  return db
    .select({ id: siteUsers.id, name: siteUsers.name, email: siteUsers.email, role: siteUsers.role, isActive: siteUsers.isActive })
    .from(siteUsers)
    .orderBy(siteUsers.createdAt);
}

export async function setManagedUserActive(id: string, isActive: boolean) {
  await requireAdmin();
  return db.update(siteUsers).set({ isActive }).where(eq(siteUsers.id, id)).returning({ id: siteUsers.id, isActive: siteUsers.isActive });
}

export async function requireReaderAccess() {
  const user = await getCurrentUser();
  if (user) return user;
  throw new Response("Acesso não autorizado", { status: 401 });
}