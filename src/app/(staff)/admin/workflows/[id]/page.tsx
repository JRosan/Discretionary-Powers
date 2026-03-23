"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Loader2, GripVertical } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/lib/api";

interface StepForm {
  name: string;
  description: string;
  guidanceTips: string;
  legalReference: string;
  checklistItems: string;
  isRequired: boolean;
}

function emptyStep(): StepForm {
  return {
    name: "",
    description: "",
    guidanceTips: "",
    legalReference: "",
    checklistItems: "",
    isRequired: true,
  };
}

export default function WorkflowEditorPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;

  const [workflowName, setWorkflowName] = useState("");
  const [steps, setSteps] = useState<StepForm[]>([]);

  const { data: workflow, isLoading } = useQuery({
    queryKey: ["workflows", id],
    queryFn: () => api.workflows.getById(id),
  });

  useEffect(() => {
    if (workflow) {
      setWorkflowName(workflow.name);
      setSteps(
        workflow.steps.map((s) => ({
          name: s.name,
          description: s.description,
          guidanceTips: s.guidanceTips ?? "",
          legalReference: s.legalReference ?? "",
          checklistItems: s.checklistItems ?? "",
          isRequired: s.isRequired,
        }))
      );
    }
  }, [workflow]);

  const updateMutation = useMutation({
    mutationFn: () => api.workflows.update(id, { name: workflowName }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workflows"] }),
  });

  const stepsMutation = useMutation({
    mutationFn: (data: Record<string, unknown>[]) =>
      api.workflows.updateSteps(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workflows", id] });
      queryClient.invalidateQueries({ queryKey: ["workflows"] });
    },
  });

  const handleSave = async () => {
    await updateMutation.mutateAsync();
    await stepsMutation.mutateAsync(
      steps.map((s) => ({
        name: s.name,
        description: s.description,
        guidanceTips: s.guidanceTips || null,
        legalReference: s.legalReference || null,
        checklistItems: s.checklistItems || null,
        isRequired: s.isRequired,
      }))
    );
  };

  const addStep = () => setSteps([...steps, emptyStep()]);

  const removeStep = (index: number) =>
    setSteps(steps.filter((_, i) => i !== index));

  const updateStep = (index: number, field: keyof StepForm, value: string | boolean) => {
    setSteps(steps.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const moveStep = (from: number, to: number) => {
    if (to < 0 || to >= steps.length) return;
    const updated = [...steps];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setSteps(updated);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  const isSaving = updateMutation.isPending || stepsMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/workflows"
          className="text-text-secondary hover:text-text-primary"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-text-primary">
            Edit Workflow
          </h1>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Save All
        </Button>
      </div>

      <div>
        <label className="text-sm font-medium text-text-primary">
          Workflow Name
        </label>
        <Input
          value={workflowName}
          onChange={(e) => setWorkflowName(e.target.value)}
          className="mt-1 max-w-md"
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Steps</h2>

        {steps.map((step, index) => (
          <Card key={index}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <div className="flex flex-col items-center gap-1 pt-2">
                  <button
                    type="button"
                    onClick={() => moveStep(index, index - 1)}
                    disabled={index === 0}
                    className="text-text-secondary hover:text-text-primary disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <GripVertical className="h-4 w-4" />
                  </button>
                  <span className="text-sm font-mono font-bold text-text-secondary">
                    {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => moveStep(index, index + 1)}
                    disabled={index === steps.length - 1}
                    className="text-text-secondary hover:text-text-primary disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <GripVertical className="h-4 w-4 rotate-180" />
                  </button>
                </div>

                <div className="flex-1 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-text-secondary">
                        Step Name
                      </label>
                      <Input
                        value={step.name}
                        onChange={(e) =>
                          updateStep(index, "name", e.target.value)
                        }
                        placeholder="e.g., Confirm Authority"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-text-secondary">
                        Legal Reference
                      </label>
                      <Input
                        value={step.legalReference}
                        onChange={(e) =>
                          updateStep(index, "legalReference", e.target.value)
                        }
                        placeholder="e.g., Section 12(1)"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-text-secondary">
                      Description
                    </label>
                    <textarea
                      value={step.description}
                      onChange={(e) =>
                        updateStep(index, "description", e.target.value)
                      }
                      placeholder="Describe what this step involves..."
                      rows={2}
                      className="mt-1 w-full rounded-md border border-border bg-white px-3 py-2 text-sm"
                    />
                  </div>

                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={step.isRequired}
                      onChange={(e) =>
                        updateStep(index, "isRequired", e.target.checked)
                      }
                      className="rounded border-border"
                    />
                    Required step
                  </label>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(index)}
                  className="text-error hover:text-error"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button variant="outline" onClick={addStep}>
          <Plus className="h-4 w-4 mr-2" />
          Add Step
        </Button>
      </div>
    </div>
  );
}
