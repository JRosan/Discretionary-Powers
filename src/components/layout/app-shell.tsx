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
  LogOut,
  KeyRound,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import dynamic from "next/dynamic";
import { NotificationBell } from "@/components/common/notification-panel";
import { LanguageSwitcher } from "@/components/common/language-switcher";
import { useAuth } from "@/lib/auth-context";

const GlobalSearch = dynamic(
  () => import("@/components/common/global-search").then((m) => ({ default: m.GlobalSearch })),
  { ssr: false },
);
import { api } from "@/lib/api";
import { OfflineIndicator } from "@/components/common/offline-indicator";
import { PlatformBanner } from "@/components/common/platform-banner";
import { useTranslations } from "@/i18n";
import { useTenant } from "@/lib/tenant-context";

interface NavItemDef {
  labelKey: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[]; // if set, only these roles see the item
  children?: { labelKey: string; href: string; roles?: string[] }[];
}

const navItemDefs: NavItemDef[] = [
  { labelKey: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { labelKey: "decisions", href: "/decisions", icon: FileText },
  { labelKey: "reports", href: "/reports", icon: BarChart3 },
  { labelKey: "judicialReviews", href: "/judicial-reviews", icon: Scale, roles: ["legal_advisor", "auditor", "permanent_secretary", "minister"] },
  {
    labelKey: "admin",
    href: "/admin",
    icon: Settings,
    roles: ["permanent_secretary"],
    children: [
      { labelKey: "users", href: "/admin/users" },
      { labelKey: "workflows", href: "/admin/workflows" },
      { labelKey: "decisionTypes", href: "/admin/decision-types" },
      { labelKey: "organization", href: "/admin/organization" },
      { labelKey: "settings", href: "/admin/settings" },
      { labelKey: "mfa", href: "/admin/mfa" },
      { labelKey: "apiKeys", href: "/admin/api-keys" },
      { labelKey: "billing", href: "/admin/billing" },
    ],
  },
  {
    labelKey: "superAdmin",
    href: "/super-admin",
    icon: Shield,
    roles: ["super_admin"],
    children: [
      { labelKey: "dashboard", href: "/super-admin/dashboard" },
      { labelKey: "tenants", href: "/super-admin/tenants" },
      { labelKey: "revenue", href: "/super-admin/revenue" },
      { labelKey: "security", href: "/super-admin/security" },
      { labelKey: "sessions", href: "/super-admin/sessions" },
      { labelKey: "compliance", href: "/super-admin/compliance" },
      { labelKey: "health", href: "/super-admin/health" },
      { labelKey: "announcements", href: "/super-admin/announcements" },
      { labelKey: "platformAudit", href: "/super-admin/audit" },
      { labelKey: "platformSettings", href: "/super-admin/settings" },
    ],
  },
];

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const tenant = useTenant();
  const tNav = useTranslations('nav');
  const tCommon = useTranslations('common');
  const [openMenus, setOpenMenus] = React.useState<Set<string>>(new Set());
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<
    { id: string; type: string; title: string; message: string; read: boolean | null; sentAt: string | Date | null; decisionId: string | null }[]
  >([]);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchNotifications = React.useCallback(async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(data);
    } catch { /* ignore */ }
    try {
      const data = await api.notifications.getUnreadCount();
      setUnreadCount(data.count);
    } catch { /* ignore */ }
  }, []);

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.notifications.markRead(id);
    } catch { /* ignore */ }
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
    try {
      await api.notifications.markAllRead();
    } catch { /* ignore */ }
  };

  const handleDelete = async (id: string) => {
    const wasUnread = notifications.find((n) => n.id === id && !n.read);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1));
    try {
      await api.notifications.delete(id);
    } catch { /* ignore */ }
  };

  const userInitials = user?.name
    ? user.name
        .split(" ")
        .map((p) => p[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className="flex h-screen overflow-hidden">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-white focus:text-sm"
      >
        Skip to main content
      </a>
      {/* Sidebar */}
      <aside className="flex w-64 flex-col bg-primary text-white">
        {/* Logo — links to landing page */}
        <Link href="/" className="flex items-center gap-3 px-6 py-5 border-b border-primary-light hover:bg-primary-light transition-colors">
          <img src={tenant.logoUrl ?? "/images/logos/crest-white.png"} alt={`${tenant.name} logo`} className="h-10 w-auto" />
          <div>
            <span className="text-sm font-bold leading-tight block">DPMS</span>
            <span className="text-xs text-white/70 leading-tight block">
              {tenant.name}
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {navItemDefs.filter((item) => !item.roles || (user?.role && item.roles.includes(user.role))).map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            const label = tNav(item.labelKey as Parameters<typeof tNav>[0]);

            if (item.children) {
              const isChildActive = item.children.some(
                (child) =>
                  pathname === child.href ||
                  pathname.startsWith(child.href + "/")
              );
              return (
                <div key={item.href}>
                  <button
                    onClick={() => setOpenMenus((prev) => {
                      const next = new Set(prev);
                      if (next.has(item.href)) next.delete(item.href);
                      else next.add(item.href);
                      return next;
                    })}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isChildActive
                        ? "bg-primary-light text-white"
                        : "text-white/80 hover:bg-primary-light hover:text-white"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1 text-left">{label}</span>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openMenus.has(item.href) && "rotate-180"
                      )}
                    />
                  </button>
                  {openMenus.has(item.href) && (
                    <div className="ml-7 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          aria-current={pathname === child.href ? "page" : undefined}
                          className={cn(
                            "block rounded-md px-3 py-1.5 text-sm transition-colors",
                            pathname === child.href
                              ? "bg-primary-light text-white"
                              : "text-white/70 hover:bg-primary-light hover:text-white"
                          )}
                        >
                          {tNav(child.labelKey as Parameters<typeof tNav>[0])}
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
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-light text-white"
                    : "text-white/80 hover:bg-primary-light hover:text-white"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info */}
        <div className="border-t border-primary-light px-4 py-3">
          <div className="flex items-center gap-3">
            <Avatar size="sm">
              <AvatarFallback className="bg-accent text-white text-xs">
                {userInitials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name ?? "User"}</p>
              <p className="text-xs text-white/60 truncate">
                {user?.role ? user.role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : ""}
              </p>
            </div>
            <Link
              href="/admin/change-password"
              className="text-white/60 hover:text-white transition-colors"
              title="Change Password"
              aria-label="Change Password"
            >
              <KeyRound className="h-4 w-4" />
            </Link>
            <button
              onClick={logout}
              className="text-white/60 hover:text-white transition-colors"
              title={tNav('signOut')}
              aria-label={tNav('signOut')}
            >
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
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            className="relative flex h-9 w-64 items-center rounded-md border border-border bg-surface pl-9 pr-3 text-sm text-text-muted hover:border-accent transition-colors"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <span>Search...</span>
            <kbd className="ml-auto hidden rounded border border-border bg-white px-1.5 py-0.5 text-[10px] font-medium sm:inline-block">
              Ctrl+K
            </kbd>
          </button>
          <GlobalSearch />

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Notifications */}
          <NotificationBell
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={handleMarkRead}
            onMarkAllRead={handleMarkAllRead}
            onDelete={handleDelete}
            onRefresh={fetchNotifications}
          />

          {/* User avatar */}
          <Avatar size="sm">
            <AvatarFallback className="bg-primary text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </header>

        {/* Platform announcements */}
        <PlatformBanner />

        {/* Offline indicator */}
        <OfflineIndicator />

        {/* Content */}
        <main id="main-content" className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
