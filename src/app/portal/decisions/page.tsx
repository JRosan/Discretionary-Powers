"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api, ApiDecision, ApiMinistry } from "@/lib/api";
import { DECISION_TYPES } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, Loader2, SlidersHorizontal } from "lucide-react";

export default function PublicDecisionsPage() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") ?? "";
  const initialMinistry = searchParams.get("ministry") ?? "";

  const [search, setSearch] = useState(initialSearch);
  const [decisionType, setDecisionType] = useState("");
  const [ministry, setMinistry] = useState(initialMinistry);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sort, setSort] = useState("newest");
  const [cursor, setCursor] = useState<string | null>(null);
  const [allItems, setAllItems] = useState<ApiDecision[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const queryParams = useMemo(() => {
    const params: Record<string, unknown> = { sort, limit: 20 };
    if (search.trim()) params.search = search.trim();
    if (decisionType) params.decisionType = decisionType;
    if (ministry) params.ministryId = ministry;
    if (dateFrom) params.dateFrom = dateFrom;
    if (dateTo) params.dateTo = dateTo;
    if (cursor) params.cursor = cursor;
    return params;
  }, [search, decisionType, ministry, dateFrom, dateTo, sort, cursor]);

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ["public-decisions", queryParams],
    queryFn: () => api.decisions.getPublicList(queryParams),
  });

  const { data: ministries } = useQuery({
    queryKey: ["ministries"],
    queryFn: () => api.ministries.list(),
  });

  // Combine accumulated items with current page
  const items = cursor ? [...allItems, ...(data?.items ?? [])] : (data?.items ?? []);
  const hasMore = data?.hasMore ?? false;

  function resetFilters() {
    setSearch("");
    setDecisionType("");
    setMinistry("");
    setDateFrom("");
    setDateTo("");
    setSort("newest");
    setCursor(null);
    setAllItems([]);
  }

  function handleLoadMore() {
    if (data?.nextCursor) {
      setAllItems(items);
      setCursor(data.nextCursor);
    }
  }

  function handleFilterChange() {
    setCursor(null);
    setAllItems([]);
  }

  const decisionTypeOptions = Object.entries(DECISION_TYPES).map(([key, value]) => ({
    label: key.charAt(0) + key.slice(1).toLowerCase(),
    value,
  }));

  const ministryMap = useMemo(() => {
    const map: Record<string, string> = {};
    if (ministries) {
      for (const m of ministries) {
        map[m.id] = m.name;
      }
    }
    return map;
  }, [ministries]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-text mb-2">Published Decisions</h1>
      <p className="text-text-secondary mb-6">
        Browse discretionary power decisions that have been published for public transparency.
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-muted" />
        <input
          type="text"
          placeholder="Search by title, reference number, or description..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            handleFilterChange();
          }}
          className="w-full rounded-lg border border-border bg-white py-3 pl-11 pr-4 text-sm text-text placeholder:text-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      {/* Filter Toggle + Sort */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>

        <div className="flex items-center gap-2">
          <label htmlFor="sort" className="text-sm text-text-secondary">
            Sort:
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              handleFilterChange();
            }}
            className="rounded-md border border-border bg-white px-3 py-1.5 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="az">A-Z</option>
          </select>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="mb-6 rounded-lg border border-border bg-white p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label htmlFor="type-filter" className="block text-xs font-medium text-text-secondary mb-1">
                Decision Type
              </label>
              <select
                id="type-filter"
                value={decisionType}
                onChange={(e) => {
                  setDecisionType(e.target.value);
                  handleFilterChange();
                }}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">All types</option>
                {decisionTypeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="ministry-filter" className="block text-xs font-medium text-text-secondary mb-1">
                Ministry
              </label>
              <select
                id="ministry-filter"
                value={ministry}
                onChange={(e) => {
                  setMinistry(e.target.value);
                  handleFilterChange();
                }}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              >
                <option value="">All ministries</option>
                {ministries?.map((m: ApiMinistry) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="date-from" className="block text-xs font-medium text-text-secondary mb-1">
                From Date
              </label>
              <input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  handleFilterChange();
                }}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            <div>
              <label htmlFor="date-to" className="block text-xs font-medium text-text-secondary mb-1">
                To Date
              </label>
              <input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  handleFilterChange();
                }}
                className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-text focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              onClick={resetFilters}
              className="text-sm text-accent hover:text-accent/80 transition-colors"
            >
              Reset all filters
            </button>
          </div>
        </div>
      )}

      {/* Result Count */}
      <p className="text-sm text-text-muted mb-4">
        {isLoading
          ? "Loading..."
          : `Showing ${items.length}${hasMore ? "+" : ""} published decisions`}
      </p>

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">
          Failed to load decisions. Please try again later.
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && items.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <FileText className="h-12 w-12 mx-auto mb-3" />
          <p className="font-medium">No decisions found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters.</p>
        </div>
      )}

      {/* Results */}
      {!isLoading && items.length > 0 && (
        <div className="space-y-4">
          {items.map((decision: ApiDecision) => (
            <Link
              key={decision.id}
              href={`/portal/decisions/${decision.id}`}
              className="block rounded-lg border border-border bg-white p-6 hover:border-accent hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-mono text-xs text-text-muted">
                  {decision.referenceNumber}
                </span>
                <Badge variant="outline">{decision.decisionType}</Badge>
              </div>
              <h2 className="text-lg font-semibold text-text mb-1">
                {decision.title}
              </h2>
              {decision.description && (
                <p className="text-sm text-text-secondary mb-3 line-clamp-2">
                  {decision.description}
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span>{ministryMap[decision.ministryId] ?? decision.ministryId}</span>
                {decision.createdAt && (
                  <span>
                    Published{" "}
                    {new Date(decision.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Load More */}
      {hasMore && (
        <div className="mt-8 text-center">
          <button
            onClick={handleLoadMore}
            disabled={isFetching}
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-white px-6 py-3 text-sm font-medium text-text hover:border-accent hover:shadow-sm transition-all disabled:opacity-50"
          >
            {isFetching ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Load more decisions"
            )}
          </button>
        </div>
      )}
    </div>
  );
}
