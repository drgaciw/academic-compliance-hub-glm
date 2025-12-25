"use client";

import { Analytics } from "@vercel/analytics/react";

type TrackEventParams = {
  name: string;
  properties?: Record<string, string | number | boolean>;
  options?: {
    tags?: Record<string, string>;
  };
};

export class AnalyticsTracker {
  static track(event: TrackEventParams): void {
    try {
      const { name, properties = {}, options } = event;

      const eventProps = {
        ...properties,
        timestamp: Date.now(),
      };

      (window as any).va?.("event", name, eventProps);

      console.debug("[Analytics] Tracked event:", name, eventProps);
    } catch (error) {
      console.error("[Analytics] Failed to track event:", error);
    }
  }

  static trackSearch(query: string, resultCount?: number): void {
    this.track({
      name: "search",
      properties: {
        query,
        resultCount: resultCount || 0,
      },
    });
  }

  static trackSearchAI(query: string, hasAnswer: boolean): void {
    this.track({
      name: "search_ai",
      properties: {
        query,
        hasAnswer,
      },
    });
  }

  static trackPageView(path: string, title?: string): void {
    this.track({
      name: "page_view",
      properties: {
        path,
        title: title || document.title,
      },
    });
  }

  static trackDownload(resource: string, type: string): void {
    this.track({
      name: "download",
      properties: {
        resource,
        type,
      },
    });
  }

  static trackClick(target: string, location: string): void {
    this.track({
      name: "click",
      properties: {
        target,
        location,
      },
    });
  }

  static trackFormSubmit(formName: string, fields: string[]): void {
    this.track({
      name: "form_submit",
      properties: {
        formName,
        fieldCount: fields.length,
      },
    });
  }

  static trackError(errorType: string, message: string): void {
    this.track({
      name: "error",
      properties: {
        errorType,
        message,
      },
    });
  }

  static trackFeatureUsage(feature: string, action: string): void {
    this.track({
      name: "feature_usage",
      properties: {
        feature,
        action,
      },
    });
  }

  static trackUserEngagement(timeOnPage: number, scrollDepth: number): void {
    this.track({
      name: "user_engagement",
      properties: {
        timeOnPage,
        scrollDepth,
      },
    });
  }
}

export const analyticsEvents = {
  SEARCH_PERFORMED: "search_performed",
  SEARCH_AI_REQUEST: "search_ai_request",
  DOCUMENT_VIEWED: "document_viewed",
  DOCUMENT_DOWNLOADED: "document_downloaded",
  CITATION_CLICKED: "citation_clicked",
  HISTORY_ITEM_CLICKED: "history_item_clicked",
  HISTORY_CLEARED: "history_cleared",
} as const;
