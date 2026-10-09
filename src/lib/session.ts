import { queryOptions } from "@tanstack/react-query";

import { getSessionUser } from "@/lib/auth.functions";

export function firstNameOf(name: string | null | undefined) {
  const first = name?.trim().split(/\s+/)[0];
  if (!first) return "leitor";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

export const sessionQuery = () =>
  queryOptions({
    queryKey: ["session-user"],
    queryFn: () => getSessionUser(),
    staleTime: 30_000,
    retry: false,
  });
