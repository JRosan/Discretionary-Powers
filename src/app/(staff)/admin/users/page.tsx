"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { api, type ApiUser, type ApiMinistry } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useTranslations } from "@/i18n";

const ROLE_LABELS: Record<string, { label: string; variant: "default" | "accent" | "warning" | "outline" }> = {
  minister: { label: "Minister", variant: "default" },
  permanent_secretary: { label: "Perm. Secretary", variant: "accent" },
  legal_advisor: { label: "Legal Advisor", variant: "warning" },
  auditor: { label: "Auditor", variant: "outline" },
  public: { label: "Public", variant: "outline" },
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const t = useTranslations("admin");
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);

  const isPermanentSecretary = currentUser?.role === "permanent_secretary";

  const { data: users, isLoading, error } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.users.list(),
    enabled: isPermanentSecretary,
  });

  const { data: ministries } = useQuery({
    queryKey: ["ministries"],
    queryFn: () => api.ministries.list(),
    enabled: isPermanentSecretary && createOpen,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => api.users.deactivate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  if (!isPermanentSecretary) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h1 className="text-2xl font-semibold text-text">{t("accessDenied")}</h1>
        <p className="mt-2 text-sm text-text-secondary">
          {t("accessDeniedMessage")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">{t("users")}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage system users and role assignments
          </p>
        </div>
        <Button variant="accent" onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4" />
          {t("createUser")}
        </Button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      )}

      {error && (
        <Card>
          <CardContent className="p-6 text-center text-error">
            Failed to load users: {(error as Error).message}
          </CardContent>
        </Card>
      )}

      {users && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border text-left text-xs font-medium text-text-secondary">
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3 hidden sm:table-cell">Ministry</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user: ApiUser) => {
                  const role = ROLE_LABELS[user.role] ?? { label: user.role, variant: "outline" as const };
                  return (
                    <tr key={user.id} className="hover:bg-surface transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar size="sm">
                            <AvatarFallback className="bg-primary text-white text-xs">
                              {getInitials(user.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-text">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary">{user.email}</td>
                      <td className="px-4 py-3">
                        <Badge variant={role.variant}>{role.label}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-text-secondary hidden sm:table-cell">
                        {user.ministryName ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={user.active ? "success" : "outline"}>
                          {user.active ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {user.active && user.id !== currentUser?.id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deactivateMutation.mutate(user.id)}
                            disabled={deactivateMutation.isPending}
                          >
                            {t("deactivate")}
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {users.length === 0 && (
              <p className="py-8 text-center text-sm text-text-muted">No users found.</p>
            )}
          </CardContent>
        </Card>
      )}

      <CreateUserDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        ministries={ministries ?? []}
      />
    </div>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
  ministries,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ministries: ApiMinistry[];
}) {
  const t = useTranslations("admin");
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [ministryId, setMinistryId] = useState("");
  const [password, setPassword] = useState("");

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) => api.users.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onOpenChange(false);
      resetForm();
    },
  });

  function resetForm() {
    setName("");
    setEmail("");
    setRole("");
    setMinistryId("");
    setPassword("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({ name, email, role, ministryId, password });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("createUser")}</DialogTitle>
          <DialogDescription>Add a new user to the system.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Role</label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minister">Minister</SelectItem>
                <SelectItem value="permanent_secretary">Permanent Secretary</SelectItem>
                <SelectItem value="legal_advisor">Legal Advisor</SelectItem>
                <SelectItem value="auditor">Auditor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text">Ministry</label>
            <Select value={ministryId} onValueChange={setMinistryId}>
              <SelectTrigger>
                <SelectValue placeholder="Select ministry" />
              </SelectTrigger>
              <SelectContent>
                {ministries.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
          {createMutation.error && (
            <p className="text-sm text-error">
              {(createMutation.error as Error).message}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="accent"
              disabled={createMutation.isPending || !name || !email || !role || !ministryId || !password}
            >
              {createMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                t("createUser")
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
