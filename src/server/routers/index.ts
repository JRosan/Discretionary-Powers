import { router } from "../trpc";
import { decisionRouter } from "./decision";
import { auditRouter } from "./audit";
import { commentRouter } from "./comment";
import { ministryRouter } from "./ministry";
import { userRouter } from "./user";
import { notificationRouter } from "./notification";
import { documentRouter } from "./document";

export const appRouter = router({
  decision: decisionRouter,
  audit: auditRouter,
  comment: commentRouter,
  ministry: ministryRouter,
  user: userRouter,
  notification: notificationRouter,
  document: documentRouter,
});

export type AppRouter = typeof appRouter;
