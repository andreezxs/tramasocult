import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { getUserFromRequest } from "./lib/auth";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (
      error != null &&
      typeof error === "object" &&
      "statusCode" in error
    ) {
      throw error;
    }

    console.error(error);

    return new Response(renderErrorPage(), {
      status: 500,
      headers: {
        "content-type": "text/html; charset=utf-8",
      },
    });
  }
});

const csrfMiddleware = createCsrfMiddleware({
  filter: (ctx) => ctx.handlerType === "serverFn",
});

const siteAccessMiddleware = createMiddleware().server(async ({ next, request }) => {
  const url = new URL(request.url);
  const isAccessPage = url.pathname === "/acesso";
  const isAsset = url.pathname.startsWith("/assets/") || url.pathname.includes(".");
  const isServerFunction = request.headers.get("x-tsr-serverfn") === "true";
  const user = await getUserFromRequest(request);
  const requiresAuth =
    url.pathname === "/livro" ||
    url.pathname.startsWith("/capitulos/") ||
    url.pathname === "/admin" ||
    url.pathname.startsWith("/admin/");

  if (isAccessPage || isAsset || isServerFunction || !requiresAuth) return next();

  if (!user) {
    return new Response(null, {
      status: 302,
      headers: { Location: `/acesso?from=${encodeURIComponent(url.pathname)}` },
    });
  }

  if (url.pathname === "/admin" || url.pathname.startsWith("/admin/")) {
    if (user.role !== "admin") {
      return new Response(null, {
        status: 302,
        headers: { Location: "/livro?aviso=admin" },
      });
    }
  }

  return next();
});

export const startInstance = createStart(() => ({
  functionMiddleware: [],
  requestMiddleware: [errorMiddleware, csrfMiddleware, siteAccessMiddleware],
}));