"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, FileText, File, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SearchResult {
  decisions: Array<{
    id: string;
    referenceNumber: string;
    title: string;
    status: string;
  }>;
  documents: Array<{
    id: string;
    filename: string;
    classification: string;
    decisionId: string;
  }>;
}

const RECENT_SEARCHES_KEY = "dpms_recent_searches";
const MAX_RECENT = 5;

function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(query: string) {
  const recent = getRecentSearches().filter((s) => s !== query);
  recent.unshift(query);
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT)),
  );
}

const STATUS_VARIANTS: Record<
  string,
  "default" | "accent" | "warning" | "success" | "outline"
> = {
  draft: "outline",
  in_progress: "accent",
  pending_approval: "warning",
  approved: "success",
  published: "success",
  flagged: "warning",
};

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const [recentSearches, setRecentSearches] = React.useState<string[]>([]);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout>>(undefined);

  // Load recent searches when dialog opens
  React.useEffect(() => {
    if (open) {
      setRecentSearches(getRecentSearches());
      setQuery("");
      setResults(null);
      setActiveIndex(-1);
    }
  }, [open]);

  // Keyboard shortcut: Ctrl+K / Cmd+K
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Debounced search
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      setResults(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await api.search.query({
          q: query.trim(),
          limit: 10,
        });
        setResults(data);
        setActiveIndex(-1);
      } catch {
        setResults(null);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const allItems = React.useMemo(() => {
    if (!results) return [];
    const items: Array<{
      type: "decision" | "document";
      id: string;
      title: string;
      subtitle: string;
      status?: string;
      href: string;
    }> = [];
    for (const d of results.decisions) {
      items.push({
        type: "decision",
        id: d.id,
        title: d.title,
        subtitle: d.referenceNumber,
        status: d.status,
        href: `/decisions/${d.id}`,
      });
    }
    for (const d of results.documents) {
      items.push({
        type: "document",
        id: d.id,
        title: d.filename,
        subtitle: d.classification.replace(/_/g, " "),
        href: `/decisions/${d.decisionId}`,
      });
    }
    return items;
  }, [results]);

  function navigate(href: string) {
    if (query.trim()) saveRecentSearch(query.trim());
    setOpen(false);
    router.push(href);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i < allItems.length - 1 ? i + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i > 0 ? i - 1 : allItems.length - 1));
    } else if (e.key === "Enter" && activeIndex >= 0 && allItems[activeIndex]) {
      e.preventDefault();
      navigate(allItems[activeIndex].href);
    }
  }

  const hasQuery = query.trim().length > 0;
  const hasResults =
    results &&
    (results.decisions.length > 0 || results.documents.length > 0);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 rounded-lg border border-border bg-white shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95"
          onKeyDown={handleKeyDown}
        >
          <DialogPrimitive.Title className="sr-only">
            Search
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search across decisions and documents
          </DialogPrimitive.Description>

          {/* Search input */}
          <div className="flex items-center gap-3 border-b border-border px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-text-muted" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search decisions and documents..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-text-muted"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="rounded p-0.5 text-text-muted hover:text-text"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-medium text-text-muted sm:inline-block">
              ESC
            </kbd>
          </div>

          {/* Results */}
          <div className="max-h-80 overflow-y-auto p-2">
            {loading && (
              <div className="py-8 text-center text-sm text-text-muted">
                Searching...
              </div>
            )}

            {!loading && !hasQuery && recentSearches.length > 0 && (
              <div>
                <div className="px-2 py-1.5 text-xs font-medium text-text-muted">
                  Recent Searches
                </div>
                {recentSearches.map((term) => (
                  <button
                    key={term}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm text-text-secondary hover:bg-surface-hover"
                    onClick={() => setQuery(term)}
                  >
                    <Search className="h-3.5 w-3.5 text-text-muted" />
                    {term}
                  </button>
                ))}
              </div>
            )}

            {!loading && !hasQuery && recentSearches.length === 0 && (
              <div className="py-8 text-center text-sm text-text-muted">
                Type to search across decisions and documents...
              </div>
            )}

            {!loading && hasQuery && !hasResults && (
              <div className="py-8 text-center text-sm text-text-muted">
                No results found for &quot;{query}&quot;
              </div>
            )}

            {!loading && hasResults && (
              <>
                {results.decisions.length > 0 && (
                  <div>
                    <div className="px-2 py-1.5 text-xs font-medium text-text-muted">
                      Decisions
                    </div>
                    {results.decisions.map((decision) => {
                      const idx = allItems.findIndex(
                        (i) => i.type === "decision" && i.id === decision.id,
                      );
                      return (
                        <button
                          key={decision.id}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                            idx === activeIndex
                              ? "bg-accent/10 text-accent"
                              : "hover:bg-surface-hover",
                          )}
                          onClick={() =>
                            navigate(`/decisions/${decision.id}`)
                          }
                          onMouseEnter={() => setActiveIndex(idx)}
                        >
                          <FileText className="h-4 w-4 shrink-0 text-text-muted" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">
                              {decision.title}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {decision.referenceNumber}
                            </p>
                          </div>
                          <Badge
                            variant={
                              STATUS_VARIANTS[decision.status] ?? "outline"
                            }
                          >
                            {decision.status.replace(/_/g, " ")}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                )}

                {results.documents.length > 0 && (
                  <div>
                    <div className="px-2 py-1.5 text-xs font-medium text-text-muted">
                      Documents
                    </div>
                    {results.documents.map((doc) => {
                      const idx = allItems.findIndex(
                        (i) => i.type === "document" && i.id === doc.id,
                      );
                      return (
                        <button
                          key={doc.id}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition-colors",
                            idx === activeIndex
                              ? "bg-accent/10 text-accent"
                              : "hover:bg-surface-hover",
                          )}
                          onClick={() =>
                            navigate(`/decisions/${doc.decisionId}`)
                          }
                          onMouseEnter={() => setActiveIndex(idx)}
                        >
                          <File className="h-4 w-4 shrink-0 text-text-muted" />
                          <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-medium">
                              {doc.filename}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {doc.classification.replace(/_/g, " ")}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between border-t border-border px-4 py-2 text-[10px] text-text-muted">
            <span>
              <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">
                ↑↓
              </kbd>{" "}
              Navigate{" "}
              <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">
                ↵
              </kbd>{" "}
              Select
            </span>
            <span>
              <kbd className="rounded border border-border bg-surface px-1 py-0.5 font-mono">
                Ctrl+K
              </kbd>{" "}
              Toggle
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
