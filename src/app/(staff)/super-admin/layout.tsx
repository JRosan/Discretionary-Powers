"use client";

import { useAuth } from "@/lib/auth-context";
import { ShieldAlert } from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();

  if (user?.role !== "super_admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldAlert className="h-12 w-12 text-error mb-4" />
        <h1 className="text-xl font-semibold text-text">Access Denied</h1>
        <p className="text-text-muted mt-2">
          You do not have permission to access the super admin panel.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
