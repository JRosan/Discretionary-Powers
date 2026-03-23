const BASE_URL =
  typeof window !== "undefined"
    ? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api")
    : (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api");

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message =
      body?.message ?? body?.title ?? `Request failed with status ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

function qs(params?: Record<string, unknown>): string {
  if (!params) return "";
  const entries = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== "",
  );
  if (entries.length === 0) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of entries) sp.set(k, String(v));
  return `?${sp.toString()}`;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<LoginResult>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    getCurrentUser: () => request<ApiUser>("/auth/me"),
    logout: () => Promise.resolve(),
    forgotPassword: (email: string) =>
      request<void>("/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      }),
    resetPassword: (token: string, newPassword: string) =>
      request<void>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, newPassword }),
      }),
    changePassword: (currentPassword: string, newPassword: string) =>
      request<void>("/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
  },

  mfa: {
    setup: () =>
      request<{ secret: string; qrCodeUri: string }>("/auth/mfa/setup", {
        method: "POST",
      }),
    enable: (code: string, secret: string) =>
      request<void>("/auth/mfa/enable", {
        method: "POST",
        body: JSON.stringify({ code, secret }),
      }),
    disable: (code: string) =>
      request<void>("/auth/mfa/disable", {
        method: "POST",
        body: JSON.stringify({ code }),
      }),
    verifyLogin: (mfaToken: string, code: string) =>
      request<{ token: string; user: ApiUser }>("/auth/mfa/verify-login", {
        method: "POST",
        body: JSON.stringify({ mfaToken, code }),
      }),
  },

  decisions: {
    list: (params?: Record<string, unknown>) =>
      request<{ items: ApiDecision[]; hasMore: boolean; nextCursor: string | null }>(
        `/decisions${qs(params)}`,
      ),
    getById: (id: string) => request<ApiDecisionDetail>(`/decisions/${id}`),
    create: (data: Record<string, unknown>) =>
      request<ApiDecision>("/decisions", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    advanceStep: (id: string, stepNumber: number, data: Record<string, unknown>) =>
      request<void>(`/decisions/${id}/advance-step`, {
        method: "POST",
        body: JSON.stringify({ ...data, stepNumber }),
      }),
    approve: (id: string, notes?: string) =>
      request<void>(`/decisions/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ notes }),
      }),
    publish: (id: string) =>
      request<void>(`/decisions/${id}/publish`, { method: "POST" }),
    flagForReview: (id: string, data: Record<string, unknown>) =>
      request<void>(`/decisions/${id}/flag-for-review`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    getStats: () => request<ApiDecisionStats>("/decisions/stats"),
    getPublicList: (params?: Record<string, unknown>) =>
      request<{ items: ApiDecision[]; hasMore: boolean; nextCursor: string | null }>(
        `/decisions/public${qs(params)}`,
      ),
    getPublicById: (id: string) =>
      request<ApiDecisionDetail>(`/decisions/public/${id}`),
    exportDecision: (id: string, format: string) =>
      request<Blob>(`/decisions/${id}/export?format=${format}`),
  },

  documents: {
    getUploadUrl: (data: Record<string, unknown>) =>
      request<{ uploadUrl: string; documentId: string }>("/documents/upload-url", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    confirmUpload: (id: string, data: Record<string, unknown>) =>
      request<void>(`/documents/${id}/confirm-upload`, {
        method: "POST",
        body: JSON.stringify(data),
      }),
    list: (decisionId: string) =>
      request<ApiDocument[]>(`/documents?decisionId=${decisionId}`),
    getDownloadUrl: (id: string) =>
      request<{ url: string; filename: string }>(`/documents/${id}/download-url`),
    delete: (id: string) =>
      request<void>(`/documents/${id}`, { method: "DELETE" }),
    redact: (id: string, data: { isRedacted: boolean; redactionNotes?: string }) =>
      request<void>(`/documents/${id}/redact`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  search: {
    query: (params: { q: string; type?: string; limit?: number }) =>
      request<SearchResult>(`/search${qs(params as Record<string, unknown>)}`),
  },

  comments: {
    create: (data: Record<string, unknown>) =>
      request<ApiComment>("/comments", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    list: (decisionId: string) =>
      request<ApiComment[]>(`/comments?decisionId=${decisionId}`),
    count: (decisionId: string) =>
      request<{ count: number }>(`/comments/count?decisionId=${decisionId}`),
    delete: (id: string) =>
      request<void>(`/comments/${id}`, { method: "DELETE" }),
  },

  notifications: {
    list: (params?: Record<string, unknown>) =>
      request<ApiNotification[]>(`/notifications${qs(params)}`),
    getUnreadCount: () =>
      request<{ count: number }>("/notifications/unread-count"),
    markRead: (id: string) =>
      request<void>(`/notifications/${id}/read`, { method: "PUT" }),
    markAllRead: () =>
      request<void>("/notifications/read-all", { method: "PUT" }),
    delete: (id: string) =>
      request<void>(`/notifications/${id}`, { method: "DELETE" }),
  },

  users: {
    list: (params?: Record<string, unknown>) =>
      request<ApiUser[]>(`/users${qs(params)}`),
    getById: (id: string) => request<ApiUser>(`/users/${id}`),
    create: (data: Record<string, unknown>) =>
      request<ApiUser>("/users", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      request<ApiUser>(`/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    deactivate: (id: string) =>
      request<void>(`/users/${id}/deactivate`, { method: "POST" }),
  },

  ministries: {
    list: () => request<ApiMinistry[]>("/ministries"),
    getById: (id: string) => request<ApiMinistry>(`/ministries/${id}`),
    create: (data: Record<string, unknown>) =>
      request<ApiMinistry>("/ministries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      request<ApiMinistry>(`/ministries/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  audit: {
    getByDecision: (decisionId: string, params?: Record<string, unknown>) =>
      request<ApiAuditEntry[]>(`/audit/decisions/${decisionId}${qs(params)}`),
    getAll: (params?: Record<string, unknown>) =>
      request<ApiAuditEntry[]>(`/audit${qs(params)}`),
    verifyChain: () => request<{ valid: boolean; details: string }>("/audit/verify-chain", { method: "POST" }),
  },

  reports: {
    getDashboard: (params?: Record<string, unknown>) =>
      request<Record<string, unknown>>(`/reports/dashboard${qs(params)}`),
    exportData: (params?: Record<string, unknown>) =>
      request<Blob>(`/reports/export${qs(params)}`),
  },

  statistics: {
    getPublic: () => request<Record<string, unknown>>("/statistics/public"),
  },

  judicialReviews: {
    list: () =>
      request<Array<{
        id: string;
        decisionId: string;
        decisionTitle: string | null;
        decisionReference: string | null;
        ground: string;
        status: string;
        filedDate: string;
        courtReference: string | null;
        outcome: string | null;
        notes: string | null;
        createdAt: string;
      }>>("/judicial-reviews"),
  },

  tenant: {
    getBranding: () =>
      request<{
        name: string;
        slug: string;
        logoUrl: string | null;
        primaryColor: string;
        accentColor: string;
        heroImageUrl: string | null;
      }>("/tenant/branding"),
    updateBranding: (data: Record<string, unknown>) =>
      request<void>("/tenant/branding", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  workflows: {
    list: () => request<ApiWorkflowTemplate[]>("/workflows"),
    getById: (id: string) => request<ApiWorkflowTemplate>(`/workflows/${id}`),
    create: (data: Record<string, unknown>) =>
      request<ApiWorkflowTemplate>("/workflows", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      request<void>(`/workflows/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    updateSteps: (id: string, steps: Record<string, unknown>[]) =>
      request<void>(`/workflows/${id}/steps`, {
        method: "POST",
        body: JSON.stringify(steps),
      }),
    delete: (id: string) =>
      request<void>(`/workflows/${id}`, { method: "DELETE" }),
  },

  decisionTypes: {
    list: () => request<ApiDecisionTypeConfig[]>("/decision-types"),
    create: (data: Record<string, unknown>) =>
      request<ApiDecisionTypeConfig>("/decision-types", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Record<string, unknown>) =>
      request<void>(`/decision-types/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<void>(`/decision-types/${id}`, { method: "DELETE" }),
  },

  settings: {
    get: () => request<Record<string, string>>("/settings"),
    update: (data: Record<string, string>) =>
      request<void>("/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  apiKeys: {
    list: () => request<ApiKeyResponse[]>("/api-keys"),
    create: (data: { name: string; scopes: string[] }) =>
      request<{ id: string; key: string; prefix: string }>("/api-keys", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    revoke: (id: string) =>
      request<void>(`/api-keys/${id}`, { method: "DELETE" }),
  },

  health: {
    check: () => request<{ status: string }>("/health"),
  },

  superAdmin: {
    listTenants: () => request<ApiOrganization[]>("/super-admin/tenants"),
    getTenant: (id: string) => request<ApiOrganization>(`/super-admin/tenants/${id}`),
    createTenant: (data: Record<string, unknown>) =>
      request<ApiOrganization>("/super-admin/tenants", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateTenant: (id: string, data: Record<string, unknown>) =>
      request<void>(`/super-admin/tenants/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    getTenantStats: (id: string) =>
      request<Record<string, unknown>>(`/super-admin/tenants/${id}/stats`),
  },
};

// API types (decoupled from drizzle ORM types)

export interface ApiUser {
  id: string;
  email: string;
  name: string;
  role: string;
  ministryId: string | null;
  active: boolean;
  ministryName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ApiMinistry {
  id: string;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
}

export interface ApiDecision {
  id: string;
  referenceNumber: string;
  title: string;
  description: string | null;
  decisionType: string;
  status: string;
  currentStep: number;
  ministryId: string;
  ministryName: string | null;
  createdBy: string;
  createdByName: string | null;
  assignedTo: string | null;
  assignedToName: string | null;
  deadline: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ApiDecisionStep {
  id: string;
  decisionId: string;
  stepNumber: number;
  status: string;
  data: Record<string, unknown> | null;
  notes: string | null;
  completedBy: string | null;
  completedAt: string | null;
  skipReason: string | null;
}

export interface ApiDecisionDetail extends ApiDecision {
  steps: ApiDecisionStep[];
}

export interface ApiDecisionStats {
  total: number;
  byStatus: Record<string, number>;
}

export interface ApiDocument {
  id: string;
  filename: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  classification: string;
  uploadedBy: string;
  isRedacted?: boolean;
  redactionNotes?: string | null;
  createdAt: string | null;
}

export interface SearchResult {
  decisions: Array<{
    id: string;
    referenceNumber: string;
    title: string;
    status: string;
  }>;
  documents: Array<{
    id: string;
    filename: string;
    classification: string;
    decisionId: string;
  }>;
}

export interface ApiComment {
  id: string;
  decisionId: string;
  userId: string;
  userName: string;
  userRole: string;
  content: string;
  isInternal: boolean;
  createdAt: string | null;
}

export interface ApiNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean | null;
  sentAt: string | Date | null;
  decisionId: string | null;
}

export interface LoginResult {
  token?: string;
  user?: ApiUser;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export interface ApiAuditEntry {
  id: string;
  decisionId: string;
  action: string;
  performedBy: string;
  details: Record<string, unknown> | null;
  previousHash: string | null;
  hash: string;
  createdAt: string | null;
}

export interface ApiWorkflowStepTemplate {
  id: string;
  stepNumber: number;
  name: string;
  description: string;
  guidanceTips: string | null;
  legalReference: string | null;
  checklistItems: string | null;
  isRequired: boolean;
}

export interface ApiWorkflowTemplate {
  id: string;
  organizationId: string;
  name: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  steps: ApiWorkflowStepTemplate[];
}

export interface ApiKeyResponse {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  isActive: boolean;
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface ApiDecisionTypeConfig {
  id: string;
  organizationId: string;
  code: string;
  name: string;
  description: string | null;
  publicationDeadlineDays: number;
  defaultWorkflowId: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface ApiOrganization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logoUrl: string | null;
  primaryColor: string | null;
  accentColor: string | null;
  heroImageUrl?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount?: number;
  decisionCount?: number;
}
