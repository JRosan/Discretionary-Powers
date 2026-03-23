"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Copy, Check, Trash2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UpgradePrompt } from "@/components/common/upgrade-prompt";
import { api, ApiKeyResponse } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

const AVAILABLE_SCOPES = [
  { value: "decisions:read", label: "Decisions (Read)" },
  { value: "decisions:write", label: "Decisions (Write)" },
  { value: "documents:read", label: "Documents (Read)" },
  { value: "audit:read", label: "Audit Trail (Read)" },
];

export default function ApiKeysPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isPermanentSecretary = user?.role === "permanent_secretary";

  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showRevokeId, setShowRevokeId] = useState<string | null>(null);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>([]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { data: usage } = useQuery({
    queryKey: ["billing", "usage"],
    queryFn: () => api.billing.getUsage(),
    enabled: isPermanentSecretary,
  });

  const isGated = usage?.plan === "starter";

  const { data: keys, isLoading, error } = useQuery({
    queryKey: ["api-keys"],
    queryFn: () => api.apiKeys.list(),
    enabled: isPermanentSecretary && !isGated,
  });

  const createMutation = useMutation({
    mutationFn: (data: { name: string; scopes: string[] }) => api.apiKeys.create(data),
    onSuccess: (result) => {
      setCreatedKey(result.key);
      setNewKeyName("");
      setNewKeyScopes([]);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.apiKeys.revoke(id),
    onSuccess: () => {
      setShowRevokeId(null);
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  function handleCreate() {
    if (!newKeyName.trim()) return;
    createMutation.mutate({ name: newKeyName.trim(), scopes: newKeyScopes });
  }

  function handleCopy() {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function toggleScope(scope: string) {
    setNewKeyScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  if (!isPermanentSecretary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-semibold text-text">Access Denied</h1>
        <p className="mt-2 text-sm text-text-secondary">
          You do not have permission to access this page.
        </p>
      </div>
    );
  }

  if (isGated) {
    return (
      <div className="max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-text">API Keys</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage API keys for external system integrations
          </p>
        </div>
        <UpgradePrompt feature="API access and integration keys" requiredPlan="professional" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-error">
          Failed to load API keys: {(error as Error).message}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">API Keys</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage API keys for external system integrations
          </p>
        </div>
        <Button
          variant="accent"
          onClick={() => {
            setShowCreateDialog(true);
            setCreatedKey(null);
            createMutation.reset();
          }}
        >
          <Plus className="mr-2 h-4 w-4" />
          Generate API Key
        </Button>
      </div>

      {/* Create Dialog */}
      {showCreateDialog && (
        <Card className="border-accent/30">
          <CardHeader>
            <CardTitle className="text-base">
              {createdKey ? "API Key Created" : "Generate New API Key"}
            </CardTitle>
            {!createdKey && (
              <CardDescription>
                Create a new API key for external integrations.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {createdKey ? (
              <div className="space-y-4">
                <div className="rounded-lg border border-warning/50 bg-warning/10 p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
                    <p className="text-sm text-text">
                      This key will only be shown once. Copy it now and store it securely.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded-md border border-border bg-surface px-3 py-2 text-sm font-mono break-all">
                    {createdKey}
                  </code>
                  <Button variant="outline" size="sm" onClick={handleCopy}>
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateDialog(false);
                      setCreatedKey(null);
                    }}
                  >
                    Done
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Key Name
                  </label>
                  <input
                    type="text"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g., Production API Key"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text mb-1.5">
                    Scopes
                  </label>
                  <div className="space-y-2">
                    {AVAILABLE_SCOPES.map((scope) => (
                      <label key={scope.value} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newKeyScopes.includes(scope.value)}
                          onChange={() => toggleScope(scope.value)}
                          className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
                        />
                        <span className="text-sm text-text">{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="accent"
                    onClick={handleCreate}
                    disabled={!newKeyName.trim() || createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      "Generate"
                    )}
                  </Button>
                </div>
                {createMutation.error && (
                  <p className="text-sm text-error">
                    {(createMutation.error as Error).message}
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Keys Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-surface">
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Name</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Key Prefix</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Scopes</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Last Used</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Created</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Status</th>
                  <th className="px-4 py-3 text-left font-medium text-text-secondary">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys && keys.length > 0 ? (
                  keys.map((key: ApiKeyResponse) => (
                    <tr key={key.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-3 font-medium text-text">{key.name}</td>
                      <td className="px-4 py-3">
                        <code className="rounded bg-surface px-1.5 py-0.5 text-xs font-mono">
                          {key.keyPrefix}
                        </code>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {key.scopes.map((s) => (
                            <span
                              key={s}
                              className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                            >
                              {s}
                            </span>
                          ))}
                          {key.scopes.length === 0 && (
                            <span className="text-xs text-text-muted">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {key.lastUsedAt
                          ? new Date(key.lastUsedAt).toLocaleDateString()
                          : "Never"}
                      </td>
                      <td className="px-4 py-3 text-text-secondary">
                        {new Date(key.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        {key.isActive ? (
                          <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                            Revoked
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {key.isActive && (
                          <>
                            {showRevokeId === key.id ? (
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => revokeMutation.mutate(key.id)}
                                  disabled={revokeMutation.isPending}
                                >
                                  {revokeMutation.isPending ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    "Confirm"
                                  )}
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowRevokeId(null)}
                                >
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowRevokeId(key.id)}
                                className="text-error hover:text-error"
                              >
                                <Trash2 className="mr-1 h-3 w-3" />
                                Revoke
                              </Button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-text-muted">
                      No API keys yet. Generate one to enable external integrations.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
