"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { LayoutDashboard } from "lucide-react";

/**
 * Shows "Back to Dashboard" if logged in, or "Staff Sign In" if not.
 * Use on landing page and public portal header.
 */
export function AuthNavLink({ variant = "light" }: { variant?: "light" | "dark" }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return null;

  if (isAuthenticated) {
    return (
      <Link
        href="/dashboard"
        className={
          variant === "dark"
            ? "inline-flex items-center gap-1.5 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
            : "inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent-dark transition-colors"
        }
      >
        <LayoutDashboard className="h-3.5 w-3.5" />
        Dashboard
      </Link>
    );
  }

  return (
    <Link
      href="/login"
      className={
        variant === "dark"
          ? "rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white hover:bg-white/20 transition-colors"
          : "rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-light transition-colors"
      }
    >
      Staff Sign In
    </Link>
  );
}
