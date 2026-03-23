"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

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

  return (
    <div className="flex min-h-screen flex-col h-screen overflow-y-auto">
      {/* Top bar */}
      <header className="bg-primary text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link href="/portal" className="flex flex-col">
              <span className="text-lg font-bold leading-tight">
                Government of the Virgin Islands
              </span>
              <span className="text-xs text-white/60 leading-tight">
                Transparency Initiative
              </span>
            </Link>
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-3">
            {/* Government Links */}
            <div>
              <h3 className="text-sm font-semibold text-text mb-3">
                Government Links
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <Link
                    href="/portal/about"
                    className="hover:text-accent transition-colors"
                  >
                    About the Framework
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal/decisions"
                    className="hover:text-accent transition-colors"
                  >
                    Published Decisions
                  </Link>
                </li>
                <li>
                  <Link
                    href="/portal/ministries"
                    className="hover:text-accent transition-colors"
                  >
                    Government Ministries
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-sm font-semibold text-text mb-3">
                Contact Information
              </h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>Government Information Office</li>
                <li>Central Administration Complex</li>
                <li>Road Town, Tortola, BVI</li>
                <li>Email: transparency@gov.vg</li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-sm font-semibold text-text mb-3">Legal</h3>
              <ul className="space-y-2 text-sm text-text-secondary">
                <li>
                  <Link
                    href="/about#rights"
                    className="hover:text-accent transition-colors"
                  >
                    Your Rights
                  </Link>
                </li>
                <li>
                  <Link href="/portal/accessibility" className="hover:text-accent transition-colors">
                    Accessibility Statement
                  </Link>
                </li>
                <li>
                  <Link href="/portal/privacy" className="hover:text-accent transition-colors">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-center text-sm text-text-muted">
              &copy; {new Date().getFullYear()} Government of the Virgin Islands.
              All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
