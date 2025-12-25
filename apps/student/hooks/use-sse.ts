"use client";

import { useEffect, useState, useRef } from "react";

export interface SSEEvent {
  type: string;
  data: unknown;
}

export interface UseSSEOptions {
  url: string;
  onMessage?: (event: SSEEvent) => void;
  onError?: (error: Event) => void;
  enabled?: boolean;
  reconnectInterval?: number;
}

export function useSSE({
  url,
  onMessage,
  onError,
  enabled = true,
  reconnectInterval = 3000,
}: UseSSEOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<SSEEvent | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!enabled) return;

    const connect = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      try {
        const eventSource = new EventSource(url);
        eventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setIsConnected(true);
          console.log("[SSE] Connected to", url);
        };

        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as SSEEvent;
            setLastEvent(data);
            onMessage?.(data);
          } catch (error) {
            console.error("[SSE] Failed to parse message:", error);
          }
        };

        eventSource.onerror = (error) => {
          console.error("[SSE] Connection error:", error);
          setIsConnected(false);
          onError?.(error);
          eventSource.close();

          if (reconnectInterval) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log("[SSE] Reconnecting...");
              connect();
            }, reconnectInterval);
          }
        };
      } catch (error) {
        console.error("[SSE] Failed to create EventSource:", error);
        onError?.(error as Event);
      }
    };

    connect();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [url, onMessage, onError, enabled, reconnectInterval]);

  const send = (data: Record<string, unknown>) => {
    console.warn(
      "[SSE] EventSource is read-only. Use fetch/POST for bidirectional communication.",
    );
  };

  return {
    isConnected,
    lastEvent,
    send,
  };
}
