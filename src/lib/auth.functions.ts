import { createServerFn } from "@tanstack/react-start";

import {
  authenticateUser,
  createManagedUser,
  getCurrentUser,
  listManagedUsers,
  logoutUser,
  setManagedUserActive,
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
  .validator((data: { name: string; email: string; password: string }) => data)
  .handler(({ data }) => createManagedUser(data.name, data.email, data.password));

export const getUsers = createServerFn({ method: "GET" }).handler(listManagedUsers);

export const updateUserAccess = createServerFn({ method: "POST" })
  .validator((data: { id: string; isActive: boolean }) => data)
  .handler(({ data }) => setManagedUserActive(data.id, data.isActive));