"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface RedactionPanelProps {
  documentId: string;
  isRedacted: boolean;
  redactionNotes?: string | null;
  onSave: (data: { isRedacted: boolean; redactionNotes?: string }) => Promise<void>;
}

export function RedactionPanel({
  documentId,
  isRedacted: initialRedacted,
  redactionNotes: initialNotes,
  onSave,
}: RedactionPanelProps) {
  const [isRedacted, setIsRedacted] = useState(initialRedacted);
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        isRedacted,
        redactionNotes: notes || undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning banner */}
      <div className="flex items-start gap-3 rounded-md border border-warning/30 bg-warning/5 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
        <p className="text-sm text-text-secondary">
          Redacted documents will be excluded from the public transparency
          portal.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex items-center justify-between">
        <label
          htmlFor={`redact-toggle-${documentId}`}
          className="text-sm font-medium"
        >
          Mark as Redacted for Public Release
        </label>
        <button
          id={`redact-toggle-${documentId}`}
          type="button"
          role="switch"
          aria-checked={isRedacted}
          onClick={() => setIsRedacted(!isRedacted)}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
            isRedacted ? "bg-error" : "bg-border"
          }`}
        >
          <span
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform ${
              isRedacted ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Redaction notes */}
      <div>
        <label
          htmlFor={`redaction-notes-${documentId}`}
          className="mb-1.5 block text-sm font-medium"
        >
          Redaction Notes
        </label>
        <textarea
          id={`redaction-notes-${documentId}`}
          placeholder="Describe what was redacted and why..."
          className="w-full rounded-md border border-border bg-white px-3 py-2 text-sm placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
