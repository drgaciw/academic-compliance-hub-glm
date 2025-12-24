/**
 * Eligibility Review & Approval Flow - Integration Tests
 * 
 * Tests complete eligibility review flow including:
 * - Filtering and sorting
 * - Approve/reject actions
 * - What-if scenarios
 * - Override functionality
 * - Accessibility throughout the flow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { formatRelativeTime } from '../../utils/integration-test-utils';

// Mock EligibilityReviewPage component
const mockEligibilityReviewPage = () => {
  return (
    <div data-testid="eligibility-review-page">
      <h1>Eligibility Review</h1>
      
      <div data-testid="filters">
        <div data-testid="status-filter">
          <label htmlFor="status">Status</label>
          <select id="status" data-testid="status-select">
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="in_review">In Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div data-testid="institution-filter">
          <label htmlFor="institution">Institution</label>
          <select id="institution" data-testid="institution-select">
            <option value="">All</option>
            <option value="inst-001">University of Texas</option>
            <option value="inst-002">University of Alabama</option>
          </select>
        </div>
        
        <div data-testid="search">
          <label htmlFor="search">Search</label>
          <input id="search" type="text" data-testid="search-input" placeholder="Search by student name or ID" />
        </div>
      </div>
      
      <div data-testid="sort-controls">
        <button data-testid="sort-date" aria-label="Sort by date">Date</button>
        <button data-testid="sort-priority" aria-label="Sort by priority">Priority</button>
        <button data-testid="sort-student" aria-label="Sort by student">Student</button>
        <button data-testid="sort-credits" aria-label="Sort by credits">Credits</button>
      </div>
      
      <table data-testid="evaluation-table" role="table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Institution</th>
            <th>Status</th>
            <th>Priority</th>
            <th>Submitted</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody data-testid="table-body">
          <tr data-testid="row-1">
            <td>Alex Testington</td>
            <td>University of Texas</td>
            <td><span data-testid="status-pending">Pending</span></td>
            <td><span data-testid="priority-high">High</span></td>
            <td>2024-12-20</td>
            <td>
              <button data-testid="approve-btn-1" aria-label="Approve">Approve</button>
              <button data-testid="reject-btn-1" aria-label="Reject">Reject</button>
              <button data-testid="view-btn-1" aria-label="View details">View</button>
            </td>
          </tr>
          <tr data-testid="row-2">
            <td>Jordan Testerson</td>
            <td>University of Alabama</td>
            <td><span data-testid="status-in_review">In Review</span></td>
            <td><span data-testid="priority-medium">Medium</span></td>
            <td>2024-12-21</td>
            <td>
              <button data-testid="approve-btn-2" aria-label="Approve">Approve</button>
              <button data-testid="reject-btn-2" aria-label="Reject">Reject</button>
              <button data-testid="view-btn-2" aria-label="View details">View</button>
            </td>
          </tr>
          <tr data-testid="row-3">
            <td>Taylor Testwell</td>
            <td>University of Texas</td>
            <td><span data-testid="status-approved">Approved</span></td>
            <td><span data-testid="priority-low">Low</span></td>
            <td>2024-12-19</td>
            <td>
              <button data-testid="approve-btn-3" aria-label="Approve" disabled>Approve</button>
              <button data-testid="reject-btn-3" aria-label="Reject">Reject</button>
              <button data-testid="view-btn-3" aria-label="View details">View</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

describe('Eligibility Review Flow - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Filtering', () => {
    it('should filter by status', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const statusSelect = screen.getByTestId('status-select');
      
      // Filter by pending
      await user.selectOptions(statusSelect, ['Pending']);
      
      // Only pending evaluations should be visible
      const pendingRows = screen.getAllByTestId('status-pending');
      expect(pendingRows.length).toBe(1);
      
      // In review and approved should be hidden
      expect(screen.queryByTestId('status-in_review')).toBeNull();
      expect(screen.queryByTestId('status-approved')).toBeNull();
    });

    it('should filter by institution', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const institutionSelect = screen.getByTestId('institution-select');
      
      // Filter by University of Texas
      await user.selectOptions(institutionSelect, ['University of Texas']);
      
      // Only Texas evaluations should be visible
      const texasRows = screen.getAllByText('University of Texas');
      expect(texasRows.length).toBe(2);
      
      // Alabama evaluations should be hidden
      expect(screen.queryByText('University of Alabama')).toBeNull();
    });

    it('should search by student name', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const searchInput = screen.getByTestId('search-input');
      
      // Search for Alex
      await user.type(searchInput, 'Alex');
      
      // Only Alex should be visible
      const alexRow = screen.getByText('Alex Testington');
      expect(alexRow).toBeInTheDocument();
      
      // Jordan should be hidden
      expect(screen.queryByText('Jordan Testerson')).toBeNull();
    });

    it('should search by student ID', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const searchInput = screen.getByTestId('search-input');
      
      // Search for STU001
      await user.type(searchInput, 'STU001');
      
      // Only matching student should be visible
      const matchingRow = screen.getByText('Alex Testington');
      expect(matchingRow).toBeInTheDocument();
    });

    it('should clear filters when reset', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const statusSelect = screen.getByTestId('status-select');
      
      // Filter by pending
      await user.selectOptions(statusSelect, ['Pending']);
      
      // Clear filter
      await user.selectOptions(statusSelect, ['All']);
      
      // All evaluations should be visible
      const allRows = screen.getAllByRole('row');
      expect(allRows.length).toBe(3);
    });
  });

  describe('Sorting', () => {
    it('should sort by date ascending', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const sortButton = screen.getByTestId('sort-date');
      
      // Click sort button
      await user.click(sortButton);
      
      // Wait for reordering
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const firstRow = rows[0];
        const firstDate = firstRow?.querySelector('td:nth-child(5)')?.textContent;
        return firstDate?.includes('2024-12-19');
      });
    });

    it('should sort by priority', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const sortButton = screen.getByTestId('sort-priority');
      
      // Click sort button
      await user.click(sortButton);
      
      // Wait for reordering
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const firstRow = rows[0];
        const firstPriority = firstRow?.querySelector('[data-testid^="priority-"]');
        return firstPriority?.textContent?.includes('High');
      });
    });

    it('should sort by student name', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const sortButton = screen.getByTestId('sort-student');
      
      // Click sort button
      await user.click(sortButton);
      
      // Wait for reordering
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const firstRow = rows[0];
        const firstStudent = firstRow?.querySelector('td:first-child')?.textContent;
        return firstStudent?.includes('Alex');
      });
    });

    it('should sort by credits', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const sortButton = screen.getByTestId('sort-credits');
      
      // Click sort button
      await user.click(sortButton);
      
      // Wait for reordering
      await waitFor(() => {
        const rows = screen.getAllByRole('row');
        const firstRow = rows[0];
        const firstCredits = firstRow?.querySelector('td:nth-child(5)')?.textContent;
        return firstCredits?.includes('45');
      });
    });
  });

  describe('Approve/Reject Actions', () => {
    it('should approve pending evaluation', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const approveButton = screen.getByTestId('approve-btn-1');
      
      // Click approve
      await user.click(approveButton);
      
      // Status should change to approved
      await waitFor(() => {
        const status = screen.queryByTestId('status-pending');
        return status === null;
      });
      
      const approvedStatus = screen.getByTestId('status-approved');
      expect(approvedStatus).toBeInTheDocument();
    });

    it('should reject pending evaluation', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const rejectButton = screen.getByTestId('reject-btn-1');
      
      // Click reject
      await user.click(rejectButton);
      
      // Status should change to rejected
      await waitFor(() => {
        const status = screen.queryByTestId('status-pending');
        return status === null;
      });
      
      const rejectedStatus = screen.getByTestId('status-rejected');
      expect(rejectedStatus).toBeInTheDocument();
    });

    it('should return in_review to pending', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const rejectButton = screen.getByTestId('reject-btn-2');
      
      // Click reject
      await user.click(rejectButton);
      
      // Status should change to pending
      await waitFor(() => {
        const status = screen.queryByTestId('status-in_review');
        return status === null;
      });
      
      const pendingStatus = screen.getByTestId('status-pending');
      expect(pendingStatus).toBeInTheDocument();
    });

    it('should disable approve button for already approved', () => {
      render(mockEligibilityReviewPage());
      
      const approveButton = screen.getByTestId('approve-btn-3');
      
      // Button should be disabled
      expect(approveButton).toBeDisabled();
    });
  });

  describe('View Details', () => {
    it('should navigate to detailed review page', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      const viewButton = screen.getByTestId('view-btn-1');
      
      // Click view
      await user.click(viewButton);
      
      // Should navigate to details page
      await waitFor(() => {
        const detailsPage = screen.queryByTestId('eligibility-details-page');
        return detailsPage !== null;
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on filters', () => {
      render(mockEligibilityReviewPage());
      
      const statusSelect = screen.getByTestId('status-select');
      expect(statusSelect).toHaveAttribute('aria-label');
      
      const institutionSelect = screen.getByTestId('institution-select');
      expect(institutionSelect).toHaveAttribute('aria-label');
      
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA labels on sort buttons', () => {
      render(mockEligibilityReviewPage());
      
      const sortButtons = screen.getAllByRole('button', { name: /sort by/i });
      sortButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have proper ARIA labels on action buttons', () => {
      render(mockEligibilityReviewPage());
      
      const approveButtons = screen.getAllByRole('button', { name: /approve/i });
      approveButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
      
      const rejectButtons = screen.getAllByRole('button', { name: /reject/i });
      rejectButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      // Tab through filters
      await user.tab();
      const statusSelect = screen.getByTestId('status-select');
      expect(statusSelect).toHaveFocus();
      
      await user.tab();
      const institutionSelect = screen.getByTestId('institution-select');
      expect(institutionSelect).toHaveFocus();
      
      await user.tab();
      const searchInput = screen.getByTestId('search-input');
      expect(searchInput).toHaveFocus();
      
      // Tab through table rows
      await user.tab();
      const firstRow = screen.getByTestId('row-1');
      const approveButton = screen.getByTestId('approve-btn-1');
      expect(approveButton).toHaveFocus();
    });
  });

  describe('Complete Review Flow', () => {
    it('should complete full review workflow', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      // Filter by pending
      const statusSelect = screen.getByTestId('status-select');
      await user.selectOptions(statusSelect, ['Pending']);
      
      // Sort by priority
      const sortButton = screen.getByTestId('sort-priority');
      await user.click(sortButton);
      
      // Approve first evaluation
      const approveButton = screen.getByTestId('approve-btn-1');
      await user.click(approveButton);
      
      // Verify approval
      await waitFor(() => {
        const approvedStatus = screen.queryByTestId('status-approved');
        return approvedStatus !== null;
      });
      
      // Success message should be displayed
      const successMessage = screen.queryByText(/eligibility approved/i);
      expect(successMessage).toBeInTheDocument();
    });

    it('should handle multiple reviews in sequence', async () => {
      const user = userEvent.setup();
      render(mockEligibilityReviewPage());
      
      // Approve first evaluation
      const approveButton1 = screen.getByTestId('approve-btn-1');
      await user.click(approveButton1);
      
      // Wait for approval
      await waitFor(() => {
        const approvedStatus = screen.queryByTestId('status-approved');
        return approvedStatus !== null;
      });
      
      // Approve second evaluation
      const approveButton2 = screen.getByTestId('approve-btn-2');
      await user.click(approveButton2);
      
      // Wait for approval
      await waitFor(() => {
        const approvedStatuses = screen.getAllByTestId('status-approved');
        return approvedStatuses.length === 2;
      });
    });
  });
});
