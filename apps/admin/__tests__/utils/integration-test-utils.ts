/**
 * Integration Test Utilities
 * 
 * Shared utilities for integration tests in admin app
 */

import { ReactElement } from 'react';

/**
 * Create a mock file for testing file uploads
 */
export function createMockFile(
  name: string = 'test-file.pdf',
  type: string = 'application/pdf',
  size: number = 1024 * 1024 // 1MB
): File {
  const content = new Array(size).fill('x').join('');
  return new File([content], name, { type });
}

/**
 * Create multiple mock files for batch upload testing
 */
export function createMockFiles(count: number = 3): File[] {
  return Array.from({ length: count }, (_, i) => 
    createMockFile(`test-file-${i + 1}.pdf`)
  );
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Format date for display
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format relative time
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
}
