"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2, Pencil } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  api,
  type ApiDecisionTypeConfig,
  type ApiWorkflowTemplate,
} from "@/lib/api";
import { useTranslations } from "@/i18n";

interface TypeForm {
  code: string;
  name: string;
  description: string;
  publicationDeadlineDays: number;
  defaultWorkflowId: string;
}

const emptyForm: TypeForm = {
  code: "",
  name: "",
  description: "",
  publicationDeadlineDays: 30,
  defaultWorkflowId: "",
};

export default function DecisionTypesPage() {
  const t = useTranslations("nav");
  const queryClient = useQueryClient();
  const [showDialog, setShowDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TypeForm>(emptyForm);

  const { data: types, isLoading } = useQuery({
    queryKey: ["decision-types"],
    queryFn: () => api.decisionTypes.list(),
  });

  const { data: workflows } = useQuery({
    queryKey: ["workflows"],
    queryFn: () => api.workflows.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.decisionTypes.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision-types"] });
      closeDialog();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      api.decisionTypes.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["decision-types"] });
      closeDialog();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.decisionTypes.delete(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["decision-types"] }),
  });

  const closeDialog = () => {
    setShowDialog(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowDialog(true);
  };

  const openEdit = (dt: ApiDecisionTypeConfig) => {
    setForm({
      code: dt.code,
      name: dt.name,
      description: dt.description ?? "",
      publicationDeadlineDays: dt.publicationDeadlineDays,
      defaultWorkflowId: dt.defaultWorkflowId ?? "",
    });
    setEditingId(dt.id);
    setShowDialog(true);
  };

  const handleSave = () => {
    const payload: Record<string, unknown> = {
      code: form.code,
      name: form.name,
      description: form.description || null,
      publicationDeadlineDays: form.publicationDeadlineDays,
      defaultWorkflowId: form.defaultWorkflowId || null,
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const workflowName = (id: string | null) => {
    if (!id || !workflows) return "-";
    return workflows.find((w: ApiWorkflowTemplate) => w.id === id)?.name ?? "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t("decisionTypes")}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Configure decision types and their default settings.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Type
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      ) : !types?.length ? (
        <Card>
          <CardContent className="py-12 text-center text-text-secondary">
            No decision types configured. Add your first type to get started.
          </CardContent>
        </Card>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface">
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Code</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Name</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Deadline (days)</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Default Workflow</th>
                <th className="text-left px-4 py-3 font-medium text-text-secondary">Status</th>
                <th className="text-right px-4 py-3 font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {types.map((dt: ApiDecisionTypeConfig) => (
                <tr key={dt.id} className="border-b border-border last:border-0 hover:bg-surface/50">
                  <td className="px-4 py-3 font-mono text-xs">{dt.code}</td>
                  <td className="px-4 py-3 font-medium">{dt.name}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {dt.publicationDeadlineDays}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {workflowName(dt.defaultWorkflowId)}
                  </td>
                  <td className="px-4 py-3">
                    {dt.isActive ? (
                      <Badge variant="default">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(dt)}
                    >
                      <Pencil className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteMutation.mutate(dt.id)}
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

      <Dialog open={showDialog} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingId ? "Edit Decision Type" : "Add Decision Type"}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? "Update the decision type configuration."
                : "Define a new decision type for your organization."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary">
                  Code
                </label>
                <Input
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value })}
                  placeholder="e.g., regulatory"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">
                  Name
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g., Regulatory"
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-text-primary">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Optional description..."
                rows={2}
                className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary">
                  Publication Deadline (days)
                </label>
                <Input
                  type="number"
                  value={form.publicationDeadlineDays}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      publicationDeadlineDays: parseInt(e.target.value) || 30,
                    })
                  }
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary">
                  Default Workflow
                </label>
                <Select
                  value={form.defaultWorkflowId}
                  onValueChange={(v) =>
                    setForm({ ...form, defaultWorkflowId: v })
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select workflow..." />
                  </SelectTrigger>
                  <SelectContent>
                    {workflows?.map((wf: ApiWorkflowTemplate) => (
                      <SelectItem key={wf.id} value={wf.id}>
                        {wf.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!form.code.trim() || !form.name.trim() || isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {editingId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
