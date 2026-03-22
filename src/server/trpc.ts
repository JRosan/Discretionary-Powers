import { initTRPC, TRPCError } from "@trpc/server";
import { ZodError } from "zod";

export interface TRPCContext {
  session: {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      ministryId: string | null;
    };
  } | null;
  ip: string | null;
}

const t = initTRPC.context<TRPCContext>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure — requires an authenticated session.
 */
export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to perform this action.",
    });
  }
  return next({
    ctx: {
      session: ctx.session,
      user: ctx.session.user,
    },
  });
});

/**
 * Role-restricted procedure factory.
 */
export function roleProcedure(...allowedRoles: string[]) {
  return protectedProcedure.use(({ ctx, next }) => {
    if (!allowedRoles.includes(ctx.user.role)) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: `This action requires one of the following roles: ${allowedRoles.join(", ")}.`,
      });
    }
    return next({ ctx });
  });
}
