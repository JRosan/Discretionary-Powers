export type Role =
  | "minister"
  | "permanent_secretary"
  | "legal_advisor"
  | "auditor"
  | "public";

export type Resource =
  | "decision"
  | "document"
  | "audit_trail"
  | "user"
  | "report"
  | "judicial_review"
  | "notification";

export type Action =
  | "create"
  | "read"
  | "update"
  | "delete"
  | "approve"
  | "publish"
  | "export"
  | "flag_review"
  | "provide_opinion";

export interface Permission {
  resource: Resource;
  action: Action;
}

const p = (resource: Resource, action: Action): Permission => ({
  resource,
  action,
});

export const PERMISSION_MATRIX: Record<Role, readonly Permission[]> = {
  minister: [
    p("decision", "create"),
    p("decision", "read"),
    p("decision", "update"),
    p("decision", "approve"),
    p("decision", "publish"),
    p("report", "read"),
    p("notification", "read"),
  ],
  permanent_secretary: [
    p("decision", "create"),
    p("decision", "read"),
    p("decision", "update"),
    p("audit_trail", "read"),
    p("user", "create"),
    p("user", "read"),
    p("user", "update"),
    p("user", "delete"),
    p("report", "read"),
    p("notification", "read"),
  ],
  legal_advisor: [
    p("decision", "read"),
    p("decision", "provide_opinion"),
    p("audit_trail", "read"),
    p("judicial_review", "flag_review"),
    p("report", "read"),
  ],
  auditor: [
    p("decision", "read"),
    p("audit_trail", "read"),
    p("audit_trail", "export"),
    p("judicial_review", "flag_review"),
    p("report", "read"),
    p("report", "export"),
  ],
  public: [p("decision", "read")],
} as const;

export function hasPermission(
  role: Role,
  resource: Resource,
  action: Action
): boolean {
  const permissions = PERMISSION_MATRIX[role];
  return permissions.some(
    (perm) => perm.resource === resource && perm.action === action
  );
}

export function canAccessMinistry(
  role: Role,
  userMinistryId: string,
  targetMinistryId: string
): boolean {
  if (role === "legal_advisor" || role === "auditor") {
    return true;
  }
  if (role === "minister" || role === "permanent_secretary") {
    return userMinistryId === targetMinistryId;
  }
  return false;
}

export function getPermissions(role: Role): Permission[] {
  return [...PERMISSION_MATRIX[role]];
}
