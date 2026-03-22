"use client";

import { Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MOCK_USERS = [
  { id: "1", name: "Hon. Minister Smith", email: "minister.smith@gov.vg", role: "minister", ministry: "Natural Resources", status: "active" },
  { id: "2", name: "Jane Secretary", email: "secretary@gov.vg", role: "permanent_secretary", ministry: "Natural Resources", status: "active" },
  { id: "3", name: "John Legal", email: "legal@gov.vg", role: "legal_advisor", ministry: "Attorney General", status: "active" },
  { id: "4", name: "Sarah Auditor", email: "auditor@gov.vg", role: "auditor", ministry: "Audit Office", status: "active" },
  { id: "5", name: "Robert Williams", email: "r.williams@gov.vg", role: "permanent_secretary", ministry: "Finance", status: "active" },
  { id: "6", name: "Mary Johnson", email: "m.johnson@gov.vg", role: "minister", ministry: "Education", status: "inactive" },
];

const ROLE_LABELS: Record<string, { label: string; variant: "default" | "accent" | "warning" | "outline" }> = {
  minister: { label: "Minister", variant: "default" },
  permanent_secretary: { label: "Perm. Secretary", variant: "accent" },
  legal_advisor: { label: "Legal Advisor", variant: "warning" },
  auditor: { label: "Auditor", variant: "outline" },
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-text">Users</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Manage system users and role assignments
          </p>
        </div>
        <Button variant="accent">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {MOCK_USERS.map((user) => {
              const role = ROLE_LABELS[user.role] ?? { label: user.role, variant: "outline" as const };
              return (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 hover:bg-surface transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Avatar size="sm">
                      <AvatarFallback className="bg-primary text-white text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-text">
                        {user.name}
                      </p>
                      <p className="text-xs text-text-muted">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-secondary hidden sm:inline">
                      {user.ministry}
                    </span>
                    <Badge variant={role.variant}>{role.label}</Badge>
                    {user.status === "inactive" && (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
