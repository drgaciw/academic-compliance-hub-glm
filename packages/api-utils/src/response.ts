/**
 * API response utilities
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export function successResponse<T>(data: T, meta?: { requestId?: string }): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown,
  meta?: { requestId?: string }
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  pageSize: number,
  total: number
): ApiResponse<{ items: T[]; pagination: { page: number; pageSize: number; total: number; totalPages: number } }> {
  const totalPages = Math.ceil(total / pageSize);
  return successResponse({
    items: data,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
    },
  });
}
