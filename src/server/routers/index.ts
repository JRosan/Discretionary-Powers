import { router } from "../trpc";
import { decisionRouter } from "./decision";
import { auditRouter } from "./audit";

export const appRouter = router({
  decision: decisionRouter,
  audit: auditRouter,
});

export type AppRouter = typeof appRouter;
