"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { PublicFooter } from "./public-footer";
import { AuthNavLink } from "@/components/common/auth-nav-link";
import { cn } from "@/lib/utils";
import { useTenant } from "@/lib/tenant-context";

const navLinks = [
  { label: "Home", href: "/portal" },
  { label: "Decisions", href: "/portal/decisions" },
  { label: "Ministries", href: "/portal/ministries" },
  { label: "About", href: "/portal/about" },
];

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const pathname = usePathname();
  const tenant = useTenant();

  return (
    <div className="flex min-h-screen flex-col h-screen overflow-y-auto">
      {/* Top bar */}
      <header className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/portal" className="flex items-center gap-3">
              <img src={tenant.logoUrl ?? "/images/logos/crest-white.png"} alt={`${tenant.name} logo`} className="h-10 w-auto" />
              <div className="flex flex-col">
                <span className="text-lg font-bold leading-tight">
                  {tenant.name}
                </span>
                <span className="text-xs text-white/60 leading-tight">
                  Transparency Initiative
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-xs text-white/60 hover:text-white transition-colors"
              >
                Home
              </Link>
              <AuthNavLink variant="dark" />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="border-t border-white/10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-12 items-center gap-1">
              {navLinks.map((link) => {
                const isActive =
                  link.href === "/"
                    ? pathname === "/"
                    : pathname === link.href || pathname.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "rounded-md px-4 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-white/80 hover:bg-white/10 hover:text-white"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </nav>
      </header>

      {/* Content */}
      <main className="flex-1">
        {children}
      </main>

      <PublicFooter />
    </div>
  );
}
