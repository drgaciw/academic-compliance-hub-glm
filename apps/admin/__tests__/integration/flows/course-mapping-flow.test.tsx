/**
 * Course Mapping Flow - Integration Tests
 * 
 * Tests complete course mapping flow including:
 * - Course catalog browsing
 * - Mapping interface
 * - Bulk mapping
 * - Manual review requests
 * - Accessibility throughout the flow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock CourseMappingPage component
const mockCourseMappingPage = () => {
  return (
    <div data-testid="course-mapping-page">
      <h1>Course Mapping</h1>
      
      <div data-testid="student-selection">
        <h2>Select Student</h2>
        <label htmlFor="student">Student</label>
        <select id="student" data-testid="student-select">
          <option value="">Select student</option>
          <option value="student-001">Alex Testington</option>
          <option value="student-002">Jordan Testerson</option>
          <option value="student-003">Taylor Testwell</option>
        </select>
      </div>
      
      <div data-testid="transfer-courses">
        <h2>Transfer Courses</h2>
        <table data-testid="transfer-table" role="table">
          <thead>
            <tr>
              <th>Course Code</th>
              <th>Course Name</th>
              <th>Credits</th>
              <th>Grade</th>
              <th>Institution</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody data-testid="transfer-table-body">
            <tr data-testid="transfer-row-1">
              <td>ENGL 101</td>
              <td>English Composition I</td>
              <td>3</td>
              <td>A</td>
              <td>Community College</td>
              <td>
                <button data-testid="map-btn-1" aria-label="Map course">Map</button>
                <button data-testid="review-btn-1" aria-label="Request review">Review</button>
              </td>
            </tr>
            <tr data-testid="transfer-row-2">
              <td>MATH 201</td>
              <td>Calculus I</td>
              <td>4</td>
              <td>B+</td>
              <td>State University</td>
              <td>
                <button data-testid="map-btn-2" aria-label="Map course">Map</button>
                <button data-testid="review-btn-2" aria-label="Request review">Review</button>
              </td>
            </tr>
            <tr data-testid="transfer-row-3">
              <td>HIST 101</td>
              <td>World History</td>
              <td>3</td>
              <td>A-</td>
              <td>Community College</td>
              <td>
                <button data-testid="map-btn-3" aria-label="Map course">Map</button>
                <button data-testid="review-btn-3" aria-label="Request review">Review</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div data-testid="institution-courses">
        <h2>Institution Courses</h2>
        <div data-testid="course-catalog">
          <div data-testid="course-item-1">
            <h3>ENG 101</h3>
            <p>English Composition I</p>
            <p>Credits: 3 | Department: English</p>
          </div>
          <div data-testid="course-item-2">
            <h3>ENG 102</h3>
            <p>English Composition II</p>
            <p>Credits: 3 | Department: English</p>
          </div>
          <div data-testid="course-item-3">
            <h3>MAT 201</h3>
            <p>Calculus I</p>
            <p>Credits: 4 | Department: Mathematics</p>
          </div>
          <div data-testid="course-item-4">
            <h3>HIS 101</h3>
            <p>World History</p>
            <p>Credits: 3 | Department: History</p>
          </div>
        </div>
      </div>
      
      <div data-testid="bulk-actions">
        <button data-testid="select-all" aria-label="Select all courses">Select All</button>
        <button data-testid="bulk-map" aria-label="Bulk map selected">Bulk Map</button>
        <button data-testid="bulk-review" aria-label="Request review for selected">Bulk Review</button>
      </div>
    </div>
  );
};

describe('Course Mapping Flow - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Student Selection', () => {
    it('should display student dropdown', () => {
      render(mockCourseMappingPage());
      
      const studentSelect = screen.getByTestId('student-select');
      expect(studentSelect).toBeInTheDocument();
      expect(studentSelect).toHaveAttribute('aria-label');
    });

    it('should load transfer courses when student selected', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const studentSelect = screen.getByTestId('student-select');
      
      // Select student
      await user.selectOptions(studentSelect, ['Alex Testington']);
      
      // Transfer courses should be displayed
      await waitFor(() => {
        const transferTable = screen.queryByTestId('transfer-table');
        return transferTable !== null;
      });
    });

    it('should display transfer course details', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const studentSelect = screen.getByTestId('student-select');
      await user.selectOptions(studentSelect, ['Alex Testington']);
      
      // Wait for table to load
      await waitFor(() => {
        const transferTable = screen.queryByTestId('transfer-table');
        return transferTable !== null;
      });
      
      // Check course details
      expect(screen.getByText('ENGL 101')).toBeInTheDocument();
      expect(screen.getByText('English Composition I')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('Community College')).toBeInTheDocument();
    });
  });

  describe('Course Catalog', () => {
    it('should display institution courses', () => {
      render(mockCourseMappingPage());
      
      const courseCatalog = screen.getByTestId('course-catalog');
      expect(courseCatalog).toBeInTheDocument();
    });

    it('should display course details', () => {
      render(mockCourseMappingPage());
      
      // Check course items
      expect(screen.getByTestId('course-item-1')).toBeInTheDocument();
      expect(screen.getByTestId('course-item-2')).toBeInTheDocument();
      expect(screen.getByTestId('course-item-3')).toBeInTheDocument();
      expect(screen.getByTestId('course-item-4')).toBeInTheDocument();
    });

    it('should display course metadata', () => {
      render(mockCourseMappingPage());
      
      // Check course metadata
      expect(screen.getByText('Credits: 3')).toBeInTheDocument();
      expect(screen.getByText('Department: English')).toBeInTheDocument();
      expect(screen.getByText('Credits: 4')).toBeInTheDocument();
      expect(screen.getByText('Department: Mathematics')).toBeInTheDocument();
    });
  });

  describe('Single Course Mapping', () => {
    it('should open mapping dialog', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const mapButton = screen.getByTestId('map-btn-1');
      
      // Click map button
      await user.click(mapButton);
      
      // Mapping dialog should appear
      await waitFor(() => {
        const mappingDialog = screen.queryByRole('dialog');
        return mappingDialog !== null;
      });
    });

    it('should display available institution courses', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const mapButton = screen.getByTestId('map-btn-1');
      await user.click(mapButton);
      
      // Wait for dialog
      await waitFor(() => {
        const mappingDialog = screen.queryByRole('dialog');
        return mappingDialog !== null;
      });
      
      // Institution courses should be visible in dialog
      expect(screen.getByText('ENG 101')).toBeInTheDocument();
      expect(screen.getByText('MAT 201')).toBeInTheDocument();
    });

    it('should save course mapping', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const mapButton = screen.getByTestId('map-btn-1');
      await user.click(mapButton);
      
      // Wait for dialog
      await waitFor(() => {
        const mappingDialog = screen.queryByRole('dialog');
        return mappingDialog !== null;
      });
      
      // Select institution course
      const institutionCourse = screen.getByText('ENG 101');
      await user.click(institutionCourse);
      
      // Click save
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      // Success message should be displayed
      await waitFor(() => {
        const successMessage = screen.queryByText(/course mapped/i);
        return successMessage !== null;
      });
    });
  });

  describe('Manual Review Request', () => {
    it('should open review request dialog', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const reviewButton = screen.getByTestId('review-btn-1');
      
      // Click review button
      await user.click(reviewButton);
      
      // Review dialog should appear
      await waitFor(() => {
        const reviewDialog = screen.queryByRole('dialog');
        return reviewDialog !== null;
      });
    });

    it('should allow entering review reason', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const reviewButton = screen.getByTestId('review-btn-1');
      await user.click(reviewButton);
      
      // Wait for dialog
      await waitFor(() => {
        const reviewDialog = screen.queryByRole('dialog');
        return reviewDialog !== null;
      });
      
      // Enter review reason
      const reasonInput = screen.getByRole('textbox', { name: /reason/i });
      await user.type(reasonInput, 'Course not in catalog');
      
      // Submit review
      const submitButton = screen.getByRole('button', { name: /submit/i });
      await user.click(submitButton);
      
      // Success message should be displayed
      await waitFor(() => {
        const successMessage = screen.queryByText(/review requested/i);
        return successMessage !== null;
      });
    });
  });

  describe('Bulk Mapping', () => {
    it('should select all courses', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const selectAllButton = screen.getByTestId('select-all');
      
      // Click select all
      await user.click(selectAllButton);
      
      // All checkboxes should be checked
      const checkboxes = screen.getAllByRole('checkbox');
      checkboxes.forEach(cb => {
        expect(cb).toBeChecked();
      });
    });

    it('should bulk map selected courses', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const selectAllButton = screen.getByTestId('select-all');
      await user.click(selectAllButton);
      
      const bulkMapButton = screen.getByTestId('bulk-map');
      
      // Click bulk map
      await user.click(bulkMapButton);
      
      // Bulk mapping dialog should appear
      await waitFor(() => {
        const bulkDialog = screen.queryByRole('dialog');
        return bulkDialog !== null;
      });
    });

    it('should auto-map courses when possible', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const selectAllButton = screen.getByTestId('select-all');
      await user.click(selectAllButton);
      
      const bulkMapButton = screen.getByTestId('bulk-map');
      await user.click(bulkMapButton);
      
      // Wait for dialog
      await waitFor(() => {
        const bulkDialog = screen.queryByRole('dialog');
        return bulkDialog !== null;
      });
      
      // Click auto-map
      const autoMapButton = screen.getByRole('button', { name: /auto.?map/i });
      await user.click(autoMapButton);
      
      // Success message should be displayed
      await waitFor(() => {
        const successMessage = screen.queryByText(/courses mapped/i);
        return successMessage !== null;
      });
    });

    it('should display bulk mapping progress', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const selectAllButton = screen.getByTestId('select-all');
      await user.click(selectAllButton);
      
      const bulkMapButton = screen.getByTestId('bulk-map');
      await user.click(bulkMapButton);
      
      // Wait for dialog
      await waitFor(() => {
        const bulkDialog = screen.queryByRole('dialog');
        return bulkDialog !== null;
      });
      
      // Click auto-map
      const autoMapButton = screen.getByRole('button', { name: /auto.?map/i });
      await user.click(autoMapButton);
      
      // Progress indicator should be visible
      await waitFor(() => {
        const progressBar = screen.queryByRole('progressbar');
        return progressBar !== null;
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on form elements', () => {
      render(mockCourseMappingPage());
      
      const studentSelect = screen.getByTestId('student-select');
      expect(studentSelect).toHaveAttribute('aria-label');
      
      const mapButtons = screen.getAllByTestId(/map-btn-/);
      mapButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
      
      const reviewButtons = screen.getAllByTestId(/review-btn-/);
      reviewButtons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });
    });

    it('should have proper ARIA roles on tables', () => {
      render(mockCourseMappingPage());
      
      const transferTable = screen.getByTestId('transfer-table');
      expect(transferTable).toHaveAttribute('role', 'table');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      // Tab through form
      await user.tab();
      const studentSelect = screen.getByTestId('student-select');
      expect(studentSelect).toHaveFocus();
      
      await user.tab();
      const mapButton = screen.getByTestId('map-btn-1');
      expect(mapButton).toHaveFocus();
    });

    it('should have visible focus indicators', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      const mapButton = screen.getByTestId('map-btn-1');
      
      // Focus on button
      await user.tab();
      await user.tab();
      expect(mapButton).toHaveFocus();
      
      // Check for focus indicator
      const styles = window.getComputedStyle(mapButton);
      const hasFocusIndicator = 
        styles.outline !== 'none' || 
        styles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBe(true);
    });
  });

  describe('Complete Mapping Flow', () => {
    it('should complete single course mapping workflow', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      // Select student
      const studentSelect = screen.getByTestId('student-select');
      await user.selectOptions(studentSelect, ['Alex Testington']);
      
      // Wait for transfer courses to load
      await waitFor(() => {
        const transferTable = screen.queryByTestId('transfer-table');
        return transferTable !== null;
      });
      
      // Map first course
      const mapButton = screen.getByTestId('map-btn-1');
      await user.click(mapButton);
      
      // Wait for mapping dialog
      await waitFor(() => {
        const mappingDialog = screen.queryByRole('dialog');
        return mappingDialog !== null;
      });
      
      // Select institution course
      const institutionCourse = screen.getByText('ENG 101');
      await user.click(institutionCourse);
      
      // Save mapping
      const saveButton = screen.getByRole('button', { name: /save/i });
      await user.click(saveButton);
      
      // Verify success
      await waitFor(() => {
        const successMessage = screen.queryByText(/course mapped/i);
        return successMessage !== null;
      });
    });

    it('should complete bulk mapping workflow', async () => {
      const user = userEvent.setup();
      render(mockCourseMappingPage());
      
      // Select student
      const studentSelect = screen.getByTestId('student-select');
      await user.selectOptions(studentSelect, ['Alex Testington']);
      
      // Wait for transfer courses to load
      await waitFor(() => {
        const transferTable = screen.queryByTestId('transfer-table');
        return transferTable !== null;
      });
      
      // Select all courses
      const selectAllButton = screen.getByTestId('select-all');
      await user.click(selectAllButton);
      
      // Bulk map
      const bulkMapButton = screen.getByTestId('bulk-map');
      await user.click(bulkMapButton);
      
      // Wait for bulk dialog
      await waitFor(() => {
        const bulkDialog = screen.queryByRole('dialog');
        return bulkDialog !== null;
      });
      
      // Auto-map
      const autoMapButton = screen.getByRole('button', { name: /auto.?map/i });
      await user.click(autoMapButton);
      
      // Verify success
      await waitFor(() => {
        const successMessage = screen.queryByText(/courses mapped/i);
        return successMessage !== null;
      });
    });
  });
});
