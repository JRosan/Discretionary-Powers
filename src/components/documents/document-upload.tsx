"use client";

import { useCallback, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DOCUMENT_CLASSIFICATIONS } from "@/lib/constants";
import { Upload, FileText, X } from "lucide-react";
import { api } from "@/lib/api";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "text/csv",
  "image/png",
  "image/jpeg",
  "image/webp",
];

const CLASSIFICATION_LABELS: Record<string, string> = {
  evidence: "Evidence",
  legal_opinion: "Legal Opinion",
  correspondence: "Correspondence",
  public_notice: "Public Notice",
  internal_memo: "Internal Memo",
};

interface DocumentUploadProps {
  decisionId: string;
  onUploadComplete?: (documentId: string) => void;
}

export function DocumentUpload({
  decisionId,
  onUploadComplete,
}: DocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [classification, setClassification] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((f: File): string | null => {
    if (f.size > MAX_FILE_SIZE) {
      return "File size exceeds 50MB limit.";
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      return "File type not supported. Please upload PDF, Word, Excel, text, CSV, or image files.";
    }
    return null;
  }, []);

  const handleFileSelect = useCallback(
    (f: File) => {
      const validationError = validateFile(f);
      if (validationError) {
        setError(validationError);
        return;
      }
      setError(null);
      setFile(f);
    },
    [validateFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) handleFileSelect(droppedFile);
    },
    [handleFileSelect],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selected = e.target.files?.[0];
      if (selected) handleFileSelect(selected);
    },
    [handleFileSelect],
  );

  const clearFile = useCallback(() => {
    setFile(null);
    setError(null);
    setProgress(0);
    if (inputRef.current) inputRef.current.value = "";
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file || !classification) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Step 1: Get presigned upload URL from the API
      const { uploadUrl, documentId } = await api.documents.getUploadUrl({
        decisionId,
        filename: file.name,
        contentType: file.type,
        classification,
      });

      setProgress(20);

      // Step 2: Upload file directly to S3
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error("Failed to upload file.");

      setProgress(80);

      // Step 3: Confirm upload with file size
      await api.documents.confirmUpload(documentId, { sizeBytes: file.size });

      setProgress(100);
      clearFile();
      setClassification("");
      onUploadComplete?.(documentId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  }, [file, classification, decisionId, clearFile, onUploadComplete]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          dragOver
            ? "border-accent bg-accent/5"
            : "border-border hover:border-accent/50"
        }`}
      >
        {file ? (
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-text-muted" />
            <div>
              <p className="text-sm font-medium text-text">{file.name}</p>
              <p className="text-xs text-text-muted">
                {formatFileSize(file.size)}
              </p>
            </div>
            <button
              type="button"
              onClick={clearFile}
              className="ml-2 rounded p-1 hover:bg-surface-hover"
            >
              <X className="h-4 w-4 text-text-muted" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-text-muted" />
            <p className="text-sm text-text-secondary">
              Drag and drop a file here, or{" "}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="font-medium text-accent underline-offset-2 hover:underline"
              >
                browse
              </button>
            </p>
            <p className="mt-1 text-xs text-text-muted">
              PDF, Word, Excel, text, CSV, or images up to 50MB
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_TYPES.join(",")}
          onChange={handleInputChange}
          className="hidden"
        />
      </div>

      {/* Classification selector */}
      <div className="space-y-1.5">
        <Label htmlFor="classification">Classification</Label>
        <Select value={classification} onValueChange={setClassification}>
          <SelectTrigger id="classification">
            <SelectValue placeholder="Select classification" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(DOCUMENT_CLASSIFICATIONS).map((value) => (
              <SelectItem key={value} value={value}>
                {CLASSIFICATION_LABELS[value] ?? value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Progress bar */}
      {uploading && (
        <div className="space-y-1">
          <div className="h-2 overflow-hidden rounded-full bg-surface">
            <div
              className="h-full rounded-full bg-accent transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-text-muted">Uploading... {progress}%</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-error">{error}</p>
      )}

      {/* Upload button */}
      <Button
        onClick={handleUpload}
        disabled={!file || !classification || uploading}
        className="w-full"
      >
        {uploading ? "Uploading..." : "Upload document"}
      </Button>
    </div>
  );
}
