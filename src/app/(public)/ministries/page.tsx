"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { api, ApiMinistry } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, ArrowRight, Loader2 } from "lucide-react";

export default function MinistriesPage() {
  const { data: ministries, isLoading, error } = useQuery({
    queryKey: ["ministries"],
    queryFn: () => api.ministries.list(),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold text-text mb-2">Government Ministries</h1>
      <p className="text-text-secondary mb-8 max-w-2xl">
        The Government of the Virgin Islands is organised into ministries, each
        responsible for specific areas of public policy and administration. Browse
        published decisions by ministry below.
      </p>

      {error && (
        <div className="mb-6 rounded-lg border border-error/20 bg-error/5 p-4 text-sm text-error">
          Failed to load ministries. Please try again later.
        </div>
      )}

      {isLoading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-text-muted" />
        </div>
      )}

      {!isLoading && ministries && ministries.length === 0 && (
        <div className="text-center py-16 text-text-muted">
          <Building2 className="h-12 w-12 mx-auto mb-3" />
          <p className="font-medium">No ministries found</p>
        </div>
      )}

      {!isLoading && ministries && ministries.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ministries
            .filter((m: ApiMinistry) => m.isActive)
            .map((ministry: ApiMinistry) => (
              <Link
                key={ministry.id}
                href={`/decisions?ministry=${ministry.id}`}
              >
                <Card className="h-full hover:border-accent hover:shadow-sm transition-all group">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-semibold text-text mb-1">{ministry.name}</h2>
                        <p className="text-xs font-mono text-text-muted mb-2">
                          {ministry.code}
                        </p>
                        {ministry.description && (
                          <p className="text-sm text-text-secondary line-clamp-2">
                            {ministry.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-sm font-medium text-accent group-hover:text-accent/80 transition-colors">
                      View decisions <ArrowRight className="h-4 w-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
        </div>
      )}
    </div>
  );
}
