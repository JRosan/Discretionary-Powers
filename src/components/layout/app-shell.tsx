"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Scale,
  Settings,
  ChevronDown,
  Search,
  Bell,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  children?: { label: string; href: string }[];
}

const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Decisions", href: "/decisions", icon: FileText },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Judicial Reviews", href: "/judicial-reviews", icon: Scale },
  {
    label: "Admin",
    href: "/admin",
    icon: Settings,
    children: [
      { label: "Users", href: "/admin/users" },
      { label: "Ministries", href: "/admin/ministries" },
      { label: "Templates", href: "/admin/templates" },
      { label: "Settings", href: "/admin/settings" },
    ],
  },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const [adminOpen, setAdminOpen] = React.useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-primary text-white">
        {/* Logo */}
        <div className="flex flex-col items-start px-6 py-5 border-b border-primary-light">
          <span className="text-xl font-bold tracking-wide">DPMS</span>
          <span className="text-xs text-white/70 mt-0.5">
            Government of the Virgin Islands
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            if (item.children) {
              const isChildActive = item.children.some(
                (child) =>
                  pathname === child.href ||
                  pathname.startsWith(child.href + "/")
              );
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setAdminOpen(!adminOpen)}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isChildActive
                        ? "bg-primary-light text-white"
                        : "text-white/80 hover:bg-primary-light hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{item.label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        adminOpen && "rotate-180"
                      )}
                    />
                  </button>
                  {adminOpen && (
                    <div className="ml-7 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "block rounded-md px-3 py-1.5 text-sm transition-colors",
                            pathname === child.href
                              ? "bg-primary-light text-white"
                              : "text-white/70 hover:bg-primary-light hover:text-white"
                          )}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-light text-white"
                    : "text-white/80 hover:bg-primary-light hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-primary-light px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback className="bg-accent text-white text-xs">
                JD
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-white/60 truncate">Administrator</p>
            </div>
            <button className="text-white/60 hover:text-white transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex h-14 items-center gap-4 border-b border-border bg-white px-6">
          {/* Breadcrumb area */}
          <div className="flex-1">
            <nav className="text-sm text-text-secondary">
              {/* Breadcrumbs rendered by page */}
            </nav>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-64 rounded-md border border-border bg-surface pl-9 pr-3 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
            />
          </div>

          {/* Notifications */}
          <button className="relative rounded-md p-2 text-text-secondary hover:bg-surface transition-colors">
            <Bell className="h-5 w-5" />
          </button>

          {/* User avatar */}
          <Avatar size="sm">
            <AvatarFallback className="bg-primary text-white text-xs">
              JD
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
