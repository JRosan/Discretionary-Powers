import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "@/server/routers";
import type { TRPCContext } from "@/server/trpc";

function createContext(req: Request): TRPCContext {
  // TODO: integrate with NextAuth session
  return {
    session: null,
    ip: req.headers.get("x-forwarded-for") ?? null,
  };
}

function handler(req: Request) {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext(req),
  });
}

export { handler as GET, handler as POST };
