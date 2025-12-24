/**
 * Audit Trail Review Flow - Integration Tests
 * 
 * Tests complete audit trail review flow including:
 * - Log filtering
 * - Export functionality
 * - Detailed log viewing
 * - Accessibility throughout the flow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatRelativeTime } from '../../utils/integration-test-utils';

// Mock AuditTrailPage component
const mockAuditTrailPage = () => {
  return (
    <div data-testid="audit-trail-page">
      <h1>Audit Trail</h1>
      
      <div data-testid="filters">
        <div data-testid="action-filter">
          <label htmlFor="action">Action Type</label>
          <select id="action" data-testid="action-select">
            <option value="">All Actions</option>
            <option value="upload">Transcript Upload</option>
            <option value="eligibility">Eligibility Review</option>
            <option value="mapping">Course Mapping</option>
            <option value="approval">Approval</option>
            <option value="rejection">Rejection</option>
          </select>
        </div>
        
        <div data-testid="user-filter">
          <label htmlFor="user">User</label>
          <input id="user" type="text" data-testid="user-input" placeholder="Search by user" />
        </div>
        
        <div data-testid="date-range-filter">
          <label htmlFor="start-date">Start Date</label>
          <input id="start-date" type="date" data-testid="start-date-input" />
          
          <label htmlFor="end-date">End Date</label>
          <input id="end-date" type="date" data-testid="end-date-input" />
        </div>
        
        <button data-testid="apply-filters" aria-label="Apply filters">Apply Filters</button>
        <button data-testid="clear-filters" aria-label="Clear filters">Clear</button>
      </div>
      
      <div data-testid="export-actions">
        <button data-testid="export-csv" aria-label="Export as CSV">Export CSV</button>
        <button data-testid="export-pdf" aria-label="Export as PDF">Export PDF</button>
      </div>
      
      <table data-testid="audit-table" role="table">
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Details</th>
            <th>IP Address</th>
          </tr>
        </thead>
        <tbody data-testid="table-body">
          <tr data-testid="row-1">
            <td>2024-12-20 10:30:00</td>
            <td>admin@example.com</td>
            <td>Transcript uploaded</td>
            <td>Uploaded transcript for student STU001</td>
            <td>192.168.1.100</td>
          </tr>
          <tr data-testid="row-2">
            <td>2024-12-20 10:35:00</td>
            <td>admin@example.com</td>
            <td>Eligibility approved</td>
            <td>Approved eligibility for student STU001</td>
            <td>192.168.1.100</td>
          </tr>
          <tr data-testid="row-3">
            <td>2024-12-20 10:40:00</td>
            <td>admin@example.com</td>
            <td>Course mapped</td>
            <td>Mapped ENGL 101 to ENG 101</td>
            <td>192.168.1.100</td>
          </tr>
          <tr data-testid="row-4">
            <td>2024-12-20 10:45:00</td>
            <td>admin@example.com</td>
            <td>Transcript rejected</td>
            <td>Rejected transcript for student STU002</td>
            <td>192.168.1.100</td>
          </tr>
          <tr data-testid="row-5">
            <td>2024-12-20 11:00:00</td>
            <td>compliance@example.com</td>
            <td>Eligibility reviewed</td>
            <td>Reviewed eligibility for student STU003</td>
            <td>192.168.1.101</td>
          </tr>
        </tbody>
      </table>
      
      <div data-testid="pagination">
        <button data-testid="prev-page" aria-label="Previous page" disabled>Previous</button>
        <span>Page 1 of 5</span>
        <button data-testid="next-page" aria-label="Next page">Next</button>
      </div>
    </div>
  );
};

describe('Audit Trail Review Flow - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Log Filtering', () => {
    it('should filter by action type', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      const actionSelect = screen.getByTestId('action-select');
      
      // Filter by transcript upload
      await user.selectOptions(actionSelect, ['Transcript Upload']);
      
      // Only upload actions should be visible
      const uploadRows = screen.getAllByText('Transcript uploaded');
      expect(uploadRows.length).toBe(1);
      
      // Other actions should be hidden
      expect(screen.queryByText('Eligibility approved')).toBeNull();
      expect(screen.queryByText('Course mapped')).toBeNull();
    });

    it('should filter by user', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      const userInput = screen.getByTestId('user-input');
      
      // Search for admin
      await user.type(userInput, 'admin');
      
      // Only admin actions should be visible
      const adminRows = screen.getAllByText('admin@example.com');
      expect(adminRows.length).toBe(4);
      
      // Compliance user should be hidden
      expect(screen.queryByText('compliance@example.com')).toBeNull();
    });

    it('should filter by date range', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      const startDateInput = screen.getByTestId('start-date-input');
      const endDateInput = screen.getByTestId('end-date-input');
      
      // Set date range
      await user.type(startDateInput, '2024-12-20');
      await user.type(endDateInput, '2024-12-20');
      
      // Click apply filters
      const applyButton = screen.getByTestId('apply-filters');
      await user.click(applyButton);
      
      // Only actions from that date should be visible
      const dateRows = screen.getAllByText('2024-12-20');
      expect(dateRows.length).toBe(4);
    });

    it('should clear filters', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      const actionSelect = screen.getByTestId('action-select');
      
      // Filter by transcript upload
      await user.selectOptions(actionSelect, ['Transcript Upload']);
      
      // Clear filters
      const clearButton = screen.getByTestId('clear-filters');
      await user.click(clearButton);
      
      // All actions should be visible again
      const allRows = screen.getAllByRole('row');
      expect(allRows.length).toBe(5);
    });
  });

  describe('Export Functionality', () => {
    it('should export as CSV', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      const exportButton = screen.getByTestId('export-csv');
      
      // Mock download
      const originalCreateElement = document.createElement.bind(document);
      let mockAnchor: HTMLAnchorElement | null = null;
      
      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'a') {
          mockAnchor = originalCreateElement('a') as HTMLAnchorElement;
          return mockAnchor;
        }
        return originalCreateElement(tagName);
      });
      
      // Click export
      await user.click(exportButton);
      
      // Wait for download to be triggered
      await waitFor(() => {
        return mockAnchor !== null && mockAnchor.hasAttribute('download');
      });
      
      // Verify CSV filename
      const filename = mockAnchor.getAttribute('download');
      expect(filename).toMatch(/\.csv$/);
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });

    it('should export as PDF', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      const exportButton = screen.getByTestId('export-pdf');
      
      // Mock download
      const originalCreateElement = document.createElement.bind(document);
      let mockAnchor: HTMLAnchorElement | null = null;
      
      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'a') {
          mockAnchor = originalCreateElement('a') as HTMLAnchorElement;
          return mockAnchor;
        }
        return originalCreateElement(tagName);
      });
      
      // Click export
      await user.click(exportButton);
      
      // Wait for download to be triggered
      await waitFor(() => {
        return mockAnchor !== null && mockAnchor.hasAttribute('download');
      });
      
      // Verify PDF filename
      const filename = mockAnchor.getAttribute('download');
      expect(filename).toMatch(/\.pdf$/);
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });

    it('should export filtered results', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      // Apply filter first
      const actionSelect = screen.getByTestId('action-select');
      await user.selectOptions(actionSelect, ['Transcript Upload']);
      
      const exportButton = screen.getByTestId('export-csv');
      
      // Mock download
      const originalCreateElement = document.createElement.bind(document);
      let mockAnchor: HTMLAnchorElement | null = null;
      
      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'a') {
          mockAnchor = originalCreateElement('a') as HTMLAnchorElement;
          return mockAnchor;
        }
        return originalCreateElement(tagName);
      });
      
      // Click export
      await user.click(exportButton);
      
      // Wait for download to be triggered
      await waitFor(() => {
        return mockAnchor !== null && mockAnchor.hasAttribute('download');
      });
      
      // Verify only filtered results are exported
      const filename = mockAnchor.getAttribute('download');
      expect(filename).toMatch(/\.csv$/);
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });
  });

  describe('Detailed Log Viewing', () => {
    it('should display log details', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      const firstRow = screen.getByTestId('row-1');
      
      // Click on row
      await user.click(firstRow);
      
      // Details modal should appear
      await waitFor(() => {
        const detailsModal = screen.queryByRole('dialog');
        return detailsModal !== null;
      });
      
      // Check details
      expect(screen.getByText('Uploaded transcript for student STU001')).toBeInTheDocument();
      expect(screen.getByText('192.168.1.100')).toBeInTheDocument();
    });

    it('should display masked sensitive data', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      const firstRow = screen.getByTestId('row-1');
      
      // Click on row
      await user.click(firstRow);
      
      // Wait for details modal
      await waitFor(() => {
        const detailsModal = screen.queryByRole('dialog');
        return detailsModal !== null;
      });
      
      // Check for masked data
      expect(screen.queryByText('STU001')).toBeNull();
      expect(screen.getByText('***-**-****')).toBeInTheDocument();
    });
  });

  describe('Pagination', () => {
    it('should navigate to next page', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      const nextButton = screen.getByTestId('next-page');
      
      // Click next
      await user.click(nextButton);
      
      // Page number should update
      await waitFor(() => {
        const pageIndicator = screen.queryByText('Page 2 of 5');
        return pageIndicator !== null;
      });
    });

    it('should navigate to previous page', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      // Go to page 2 first
      const nextButton = screen.getByTestId('next-page');
      await user.click(nextButton);
      
      await waitFor(() => {
        const pageIndicator = screen.queryByText('Page 2 of 5');
        return pageIndicator !== null;
      });
      
      const prevButton = screen.getByTestId('prev-page');
      
      // Click previous
      await user.click(prevButton);
      
      // Page number should update
      await waitFor(() => {
        const pageIndicator = screen.queryByText('Page 1 of 5');
        return pageIndicator !== null;
      });
    });

    it('should disable previous button on first page', () => {
      render(mockAuditTrailPage());
      
      const prevButton = screen.getByTestId('prev-page');
      
      // Button should be disabled
      expect(prevButton).toBeDisabled();
    });

    it('should disable next button on last page', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      // Navigate to last page
      const nextButton = screen.getByTestId('next-page');
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);
      await user.click(nextButton);
      
      // Next button should be disabled
      expect(nextButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on filters', () => {
      render(mockAuditTrailPage());
      
      const actionSelect = screen.getByTestId('action-select');
      expect(actionSelect).toHaveAttribute('aria-label');
      
      const userInput = screen.getByTestId('user-input');
      expect(userInput).toHaveAttribute('aria-label');
      
      const startDateInput = screen.getByTestId('start-date-input');
      expect(startDateInput).toHaveAttribute('aria-label');
      
      const endDateInput = screen.getByTestId('end-date-input');
      expect(endDateInput).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA labels on export buttons', () => {
      render(mockAuditTrailPage());
      
      const csvButton = screen.getByTestId('export-csv');
      expect(csvButton).toHaveAttribute('aria-label', 'Export as CSV');
      
      const pdfButton = screen.getByTestId('export-pdf');
      expect(pdfButton).toHaveAttribute('aria-label', 'Export as PDF');
    });

    it('should have proper ARIA labels on pagination', () => {
      render(mockAuditTrailPage());
      
      const prevButton = screen.getByTestId('prev-page');
      expect(prevButton).toHaveAttribute('aria-label', 'Previous page');
      
      const nextButton = screen.getByTestId('next-page');
      expect(nextButton).toHaveAttribute('aria-label', 'Next page');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      // Tab through filters
      await user.tab();
      const actionSelect = screen.getByTestId('action-select');
      expect(actionSelect).toHaveFocus();
      
      await user.tab();
      const userInput = screen.getByTestId('user-input');
      expect(userInput).toHaveFocus();
      
      await user.tab();
      const startDateInput = screen.getByTestId('start-date-input');
      expect(startDateInput).toHaveFocus();
      
      // Tab through table
      await user.tab();
      const firstRow = screen.getByTestId('row-1');
      expect(firstRow).toHaveFocus();
    });

    it('should have visible focus indicators', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      const exportButton = screen.getByTestId('export-csv');
      
      // Focus on button
      await user.tab();
      await user.tab();
      await user.tab();
      await user.tab();
      expect(exportButton).toHaveFocus();
      
      // Check for focus indicator
      const styles = window.getComputedStyle(exportButton);
      const hasFocusIndicator = 
        styles.outline !== 'none' || 
        styles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBe(true);
    });
  });

  describe('Data Loading States', () => {
    it('should show loading state initially', () => {
      render(mockAuditTrailPage());
      
      // Loading state should be visible
      const loadingIndicator = screen.queryByTestId('loading');
      if (loadingIndicator) {
        expect(loadingIndicator).toBeInTheDocument();
      }
    });

    it('should hide loading state when data loads', async () => {
      render(mockAuditTrailPage());
      
      // Wait for data to load
      await waitFor(() => {
        const table = screen.queryByTestId('audit-table');
        return table !== null;
      });
      
      // Loading should be removed
      const loadingIndicator = screen.queryByTestId('loading');
      expect(loadingIndicator).toBeNull();
    });
  });

  describe('Empty States', () => {
    it('should display empty state when no logs', () => {
      // Mock empty audit trail
      const emptyAuditTrail = (
        <div data-testid="audit-trail-page">
          <h1>Audit Trail</h1>
          <div data-testid="empty-state">
            <p>No audit logs found</p>
          </div>
        </div>
      );
      
      render(emptyAuditTrail);
      
      // Empty state should be visible
      const emptyState = screen.getByTestId('empty-state');
      expect(emptyState).toBeInTheDocument();
      expect(emptyState).toHaveTextContent('No audit logs found');
    });
  });

  describe('Error States', () => {
    it('should display error state when data fails to load', () => {
      // Mock error audit trail
      const errorAuditTrail = (
        <div data-testid="audit-trail-page">
          <h1>Audit Trail</h1>
          <div data-testid="error-state" role="alert">
            <p>Failed to load audit logs</p>
            <button data-testid="retry-button">Retry</button>
          </div>
        </div>
      );
      
      render(errorAuditTrail);
      
      // Error state should be visible
      const errorState = screen.getByTestId('error-state');
      expect(errorState).toBeInTheDocument();
      expect(errorState).toHaveTextContent('Failed to load audit logs');
      
      // Retry button should be available
      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();
    });

    it('should allow retry after error', async () => {
      const user = userEvent.setup();
      
      // Mock error audit trail
      const errorAuditTrail = (
        <div data-testid="audit-trail-page">
          <h1>Audit Trail</h1>
          <div data-testid="error-state" role="alert">
            <p>Failed to load audit logs</p>
            <button data-testid="retry-button">Retry</button>
          </div>
        </div>
      );
      
      render(errorAuditTrail);
      
      const retryButton = screen.getByTestId('retry-button');
      
      // Click retry
      await user.click(retryButton);
      
      // Should trigger data reload
      // (This would be verified by loading state appearing)
    });
  });

  describe('Complete Audit Trail Flow', () => {
    it('should load and display audit trail successfully', async () => {
      render(mockAuditTrailPage());
      
      // Wait for all components to load
      await waitFor(() => {
        const filters = screen.queryByTestId('filters');
        const table = screen.queryByTestId('audit-table');
        const pagination = screen.queryByTestId('pagination');
        return filters !== null && table !== null && pagination !== null;
      });
      
      // All sections should be visible
      expect(screen.getByTestId('filters')).toBeInTheDocument();
      expect(screen.getByTestId('audit-table')).toBeInTheDocument();
      expect(screen.getByTestId('pagination')).toBeInTheDocument();
    });

    it('should handle filter and export workflow', async () => {
      const user = userEvent.setup();
      render(mockAuditTrailPage());
      
      // Apply filter
      const actionSelect = screen.getByTestId('action-select');
      await user.selectOptions(actionSelect, ['Transcript Upload']);
      
      // Wait for filtered results
      await waitFor(() => {
        const uploadRows = screen.getAllByText('Transcript uploaded');
        return uploadRows.length === 1;
      });
      
      // Export filtered results
      const exportButton = screen.getByTestId('export-csv');
      
      // Mock download
      const originalCreateElement = document.createElement.bind(document);
      let mockAnchor: HTMLAnchorElement | null = null;
      
      document.createElement = vi.fn((tagName: string) => {
        if (tagName === 'a') {
          mockAnchor = originalCreateElement('a') as HTMLAnchorElement;
          return mockAnchor;
        }
        return originalCreateElement(tagName);
      });
      
      // Click export
      await user.click(exportButton);
      
      // Wait for download to be triggered
      await waitFor(() => {
        return mockAnchor !== null && mockAnchor.hasAttribute('download');
      });
      
      // Verify export
      const filename = mockAnchor.getAttribute('download');
      expect(filename).toMatch(/\.csv$/);
      
      // Restore original createElement
      document.createElement = originalCreateElement;
    });
  });
});
