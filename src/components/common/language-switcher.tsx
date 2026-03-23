"use client";

import * as React from "react";
import { setLocale } from "@/i18n/use-translations";
import { localeNames } from "@/i18n/config";
import type { Locale } from "@/i18n/config";
import { Globe } from "lucide-react";

function getCurrentLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("dpms-locale");
    if (stored === "en" || stored === "es") return stored;
  }
  return "en";
}

export function LanguageSwitcher() {
  const [open, setOpen] = React.useState(false);
  const [locale, setCurrentLocale] = React.useState<Locale>("en");
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setCurrentLocale(getCurrentLocale());
  }, []);

  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-text-secondary hover:bg-surface hover:text-text-primary transition-colors"
        title="Language"
      >
        <Globe className="h-4 w-4" />
        <span>{locale.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 min-w-[120px] rounded-md border border-border bg-white py-1 shadow-lg">
          {(Object.entries(localeNames) as [Locale, string][]).map(
            ([code, name]) => (
              <button
                key={code}
                type="button"
                onClick={() => {
                  setOpen(false);
                  if (code !== locale) {
                    setLocale(code);
                  }
                }}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-sm transition-colors ${
                  code === locale
                    ? "bg-surface font-medium text-text-primary"
                    : "text-text-secondary hover:bg-surface"
                }`}
              >
                {name}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
