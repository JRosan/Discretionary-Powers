"use client";

import { useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApiComment } from "@/lib/api";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatTimestamp(date: Date | string | null): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function roleBadgeVariant(role: string) {
  switch (role) {
    case "minister":
      return "default" as const;
    case "permanent_secretary":
      return "accent" as const;
    case "legal_advisor":
      return "warning" as const;
    case "auditor":
      return "success" as const;
    default:
      return "outline" as const;
  }
}

function formatRole(role: string): string {
  return role
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface CommentThreadProps {
  decisionId: string;
  comments: ApiComment[];
  onSubmit: (input: { content: string; isInternal: boolean }) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
  currentUserId?: string;
  currentUserRole?: string;
  isSubmitting?: boolean;
}

export function CommentThread({
  decisionId,
  comments,
  onSubmit,
  onDelete,
  currentUserId,
  currentUserRole,
  isSubmitting = false,
}: CommentThreadProps) {
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    await onSubmit({ content: content.trim(), isInternal });
    setContent("");
  };

  const canDelete = (comment: ApiComment) => {
    if (!currentUserId) return false;
    return (
      comment.userId === currentUserId ||
      currentUserRole === "permanent_secretary"
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Comment list */}
      <div className="flex flex-col gap-3">
        {comments.length === 0 ? (
          <p className="text-sm text-text/60 text-center py-8">
            No comments yet
          </p>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={`flex gap-3 rounded-lg p-3 ${
                comment.isInternal
                  ? "border border-dashed border-border bg-surface/50"
                  : "border border-border bg-white"
              }`}
            >
              <Avatar size="sm">
                <AvatarFallback>{getInitials(comment.userName)}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium text-text">
                    {comment.userName}
                  </span>
                  <Badge variant={roleBadgeVariant(comment.userRole)}>
                    {formatRole(comment.userRole)}
                  </Badge>
                  {comment.isInternal && (
                    <Badge variant="outline">Internal</Badge>
                  )}
                  <span className="text-xs text-text/50 ml-auto">
                    {formatTimestamp(comment.createdAt)}
                  </span>
                </div>

                <p className="mt-1 text-sm text-text whitespace-pre-wrap">
                  {comment.content}
                </p>

                {canDelete(comment) && onDelete && (
                  <button
                    onClick={() => onDelete(comment.id)}
                    className="mt-1 text-xs text-text/40 hover:text-error transition-colors"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Compose box */}
      <form onSubmit={handleSubmit} className="border border-border rounded-lg p-3 bg-surface/30">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a comment..."
          rows={3}
          className="w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-sm text-text placeholder:text-text/40 focus:outline-none focus:ring-2 focus:ring-accent"
        />

        <div className="flex items-center justify-between mt-2">
          <label className="flex items-center gap-2 text-sm text-text/70 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              className="rounded border-border"
            />
            Internal comment
          </label>

          <Button
            type="submit"
            variant="accent"
            size="sm"
            loading={isSubmitting}
            disabled={!content.trim()}
          >
            Post Comment
          </Button>
        </div>
      </form>
    </div>
  );
}
