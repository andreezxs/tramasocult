import {
  createCsrfMiddleware,
  createMiddleware,
  createStart,
} from "@tanstack/react-start";

import { renderErrorPage } from "./lib/error-page";
import { hasValidSession } from "./lib/auth";

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
  const hasAccess = await hasValidSession(request);

  if (isAccessPage || isAsset || isServerFunction || hasAccess) return next();

  return new Response(null, {
    status: 302,
    headers: { Location: `/acesso?from=${encodeURIComponent(url.pathname)}` },
  });
});

export const startInstance = createStart(() => ({
  functionMiddleware: [],
  requestMiddleware: [errorMiddleware, csrfMiddleware, siteAccessMiddleware],
}));