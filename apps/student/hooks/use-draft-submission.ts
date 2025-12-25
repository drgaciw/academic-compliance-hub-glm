"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TransferCreditSubmission {
  institutionId: string;
  startDate: string;
  endDate: string;
  documents: File[];
  notes?: string;
}

interface UseDraftSubmissionOptions {
  storageKey?: string;
  autoSaveInterval?: number;
}

export function useDraftSubmission({
  storageKey = "transfer-credit-draft",
  autoSaveInterval = 30000,
}: UseDraftSubmissionOptions = {}) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const loadDraft = (): TransferCreditSubmission | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const data = JSON.parse(saved);
        const savedTime = data.timestamp
          ? new Date(data.timestamp)
          : null;
        setLastSaved(savedTime);
        return data.form;
      }
    } catch (error) {
      console.error("[Draft] Failed to load draft:", error);
    }
    return null;
  };

  const saveDraft = (form: TransferCreditSubmission) => {
    setIsSaving(true);
    try {
      const data = {
        form,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(data));
      setLastSaved(new Date());
    } catch (error) {
      console.error("[Draft] Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const clearDraft = () => {
    try {
      localStorage.removeItem(storageKey);
      setLastSaved(null);
    } catch (error) {
      console.error("[Draft] Failed to clear draft:", error);
    }
  };

  return {
    loadDraft,
    saveDraft,
    clearDraft,
    isSaving,
    lastSaved,
  };
}

interface DraftSaveIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  classNameProp?: string;
}

export function DraftSaveIndicator({
  isSaving,
  lastSaved,
  classNameProp,
}: DraftSaveIndicatorProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  const classes = cn("flex items-center gap-2 text-xs text-gray-500", classNameProp ?? "");

  return (
    <div className={classes}>
      {isSaving ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          <span>Saving...</span>
        </>
      ) : lastSaved ? (
        <>
          <CheckCircle2 className="h-3 w-3 text-green-600" />
          <span>Saved {formatTimeAgo(lastSaved)}</span>
        </>
      ) : (
        <span>Auto-save enabled</span>
      )}
    </div>
  );
}
