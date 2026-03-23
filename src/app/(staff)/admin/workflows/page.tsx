"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { api, type ApiWorkflowTemplate } from "@/lib/api";
import { UpgradePrompt } from "@/components/common/upgrade-prompt";
import { useTranslations } from "@/i18n";

export default function WorkflowsPage() {
  const t = useTranslations("nav");
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newIsDefault, setNewIsDefault] = useState(false);

  const { data: usage } = useQuery({
    queryKey: ["billing", "usage"],
    queryFn: () => api.billing.getUsage(),
  });

  const isGated = usage?.plan === "starter";

  const { data: workflows, isLoading } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => api.workflows.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.workflows.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
      setShowCreate(false);
      setNewName("");
      setNewIsDefault(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.workflows.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workflows"] }),
  });

  const handleCreate = () => {
    if (!newName.trim()) return;
    createMutation.mutate({ name: newName, isDefault: newIsDefault });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t("workflows")}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Configure workflow templates for your organization.
          </p>
        </div>
        {!isGated && (
          <Button onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Workflow
          </Button>
        )}
      </div>

      {isGated && (
        <UpgradePrompt feature="custom workflow templates" requiredPlan="professional" />
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : !workflows?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-text-secondary">
            No workflow templates found. Create your first workflow to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Steps</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workflows.map((wf: ApiWorkflowTemplate) => (
                <tr key={wf.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/workflows/${wf.id}`}
                      className="font-medium text-accent hover:underline"
                    >
                      {wf.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {wf.steps?.length ?? 0} steps
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {wf.isDefault && (
                        <Badge variant="accent">Default</Badge>
                      )}
                      {wf.isActive ? (
                        <Badge variant="default">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(wf.id)}
                      disabled={wf.isDefault}
                    >
                      Deactivate
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Workflow Template</DialogTitle>
            <DialogDescription>
              Define a new workflow template for your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-text-primary">
                Workflow Name
              </label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g., Standard 10-Step Review"
                className="mt-1"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={newIsDefault}
                onChange={(e) => setNewIsDefault(e.target.checked)}
                className="rounded border-border"
              />
              Set as default workflow
            </label>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || createMutation.isPending}
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
