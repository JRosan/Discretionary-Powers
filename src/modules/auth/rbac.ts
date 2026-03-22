import { auth } from "./index";
import {
  type Role,
  type Resource,
  type Action,
  hasPermission,
  canAccessMinistry,
} from "./permissions";

export function requireRole(...roles: Role[]) {
  return async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized: not authenticated");
    }
    if (!roles.includes(session.user.role)) {
      throw new Error(
        `Forbidden: requires one of [${roles.join(", ")}], got ${session.user.role}`
      );
    }
    return session;
  };
}

export function requireMinistryAccess(ministryId: string) {
  return async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized: not authenticated");
    }
    if (!canAccessMinistry(session.user.role, session.user.ministryId, ministryId)) {
      throw new Error("Forbidden: no access to this ministry");
    }
    return session;
  };
}

export function requirePermission(resource: Resource, action: Action) {
  return async () => {
    const session = await auth();
    if (!session?.user) {
      throw new Error("Unauthorized: not authenticated");
    }
    if (!hasPermission(session.user.role, resource, action)) {
      throw new Error(
        `Forbidden: ${session.user.role} cannot ${action} ${resource}`
      );
    }
    return session;
  };
}
