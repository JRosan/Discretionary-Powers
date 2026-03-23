"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function SettingsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isPermanentSecretary = user?.role === "permanent_secretary";

  const { data: settings, isLoading, error } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.settings.get(),
    enabled: isPermanentSecretary,
  });

  const [systemName, setSystemName] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [auditRetentionDays, setAuditRetentionDays] = useState(2555);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (settings) {
      setSystemName(settings.systemName ?? "DPMS");
      setEmailNotifications(settings.emailNotifications !== "false");
      setAuditRetentionDays(parseInt(settings.auditRetentionDays ?? "2555", 10));
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, string>) => api.settings.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  function handleSave() {
    saveMutation.mutate({
      systemName,
      emailNotifications: String(emailNotifications),
      auditRetentionDays: String(auditRetentionDays),
    });
  }

  if (!isPermanentSecretary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-semibold text-text">Access Denied</h1>
        <p className="mt-2 text-sm text-text-secondary">
          You do not have permission to manage settings. This page is restricted to Permanent Secretaries.
        </p>
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
          Failed to load settings: {(error as Error).message}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-text">Settings</h1>
        <p className="mt-1 text-sm text-text-secondary">
          System configuration and preferences
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">General</CardTitle>
          <CardDescription>
            Basic system configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              System Name
            </label>
            <input
              type="text"
              value={systemName}
              onChange={(e) => setSystemName(e.target.value)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notifications</CardTitle>
          <CardDescription>
            Configure email notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.checked)}
              className="h-4 w-4 rounded border-border text-accent focus:ring-accent"
            />
            <span className="text-sm text-text">Enable email notifications</span>
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Audit Trail</CardTitle>
          <CardDescription>
            Configure audit trail retention settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <label className="block text-sm font-medium text-text mb-1.5">
              Retention Period (days)
            </label>
            <input
              type="number"
              min={1}
              value={auditRetentionDays}
              onChange={(e) => setAuditRetentionDays(parseInt(e.target.value, 10) || 0)}
              className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          variant="accent"
          onClick={handleSave}
          disabled={saveMutation.isPending}
        >
          {saveMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Save Settings"
          )}
        </Button>
        {saveSuccess && (
          <span className="text-sm text-green-600">Settings saved successfully.</span>
        )}
        {saveMutation.error && (
          <span className="text-sm text-error">
            {(saveMutation.error as Error).message}
          </span>
        )}
      </div>
    </div>
  );
}
