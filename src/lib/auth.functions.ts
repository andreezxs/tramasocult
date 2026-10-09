import { createServerFn } from "@tanstack/react-start";

import {
  authenticateUser,
  createManagedUser,
  getCurrentUser,
  listAssignableChapters,
  listManagedUsers,
  logoutUser,
  setManagedUserActive,
  setManagedUserChapters,
} from "./auth";

export const loginUser = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => data)
  .handler(async ({ data }) => {
    const user = await authenticateUser(data.email, data.password);
    if (!user) throw new Error("E-mail ou senha inválidos");
    return user;
  });

export const getSessionUser = createServerFn({ method: "GET" }).handler(getCurrentUser);

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  await logoutUser();
  return { ok: true };
});

export const createUser = createServerFn({ method: "POST" })
  .validator(
    (data: { name: string; email: string; password: string; chapterIds?: string[] }) => data,
  )
  .handler(async ({ data }) => {
    const user = await createManagedUser(data.name, data.email, data.password);
    if (user && data.chapterIds) {
      await setManagedUserChapters(user.id, data.chapterIds);
    }
    return user;
  });

export const getUsers = createServerFn({ method: "GET" }).handler(listManagedUsers);

export const getAssignableChapters = createServerFn({ method: "GET" }).handler(
  listAssignableChapters,
);

export const updateUserAccess = createServerFn({ method: "POST" })
  .validator((data: { id: string; isActive: boolean }) => data)
  .handler(({ data }) => setManagedUserActive(data.id, data.isActive));

export const updateUserChapters = createServerFn({ method: "POST" })
  .validator((data: { id: string; chapterIds: string[] }) => data)
  .handler(({ data }) => setManagedUserChapters(data.id, data.chapterIds));
