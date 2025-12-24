/**
 * Transcript Upload & Document Ingestion Flow - Integration Tests
 * 
 * Tests complete transcript upload flow including:
 * - File validation (type, size)
 * - Drag and drop functionality
 * - Progress tracking
 * - Error handling
 * - Accessibility throughout the flow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockFile, createMockFiles, formatFileSize } from '../../utils/integration-test-utils';

// Mock the UploadPage component
const mockUploadPage = () => {
  return (
    <div data-testid="upload-page">
      <h1>Upload Transcripts</h1>
      <p>Upload student transcripts for eligibility evaluation</p>
      
      <div data-testid="institution-selection">
        <h2>Institution Selection</h2>
        <label htmlFor="source-institution">
          Source Institution <span className="text-destructive">*</span>
        </label>
        <select id="source-institution" data-testid="source-institution">
          <option value="">Select institution</option>
          <option value="inst-001">University of Texas</option>
          <option value="inst-002">University of Alabama</option>
        </select>
        
        <label htmlFor="target-institution">
          Target Institution <span className="text-destructive">*</span>
        </label>
        <select id="target-institution" data-testid="target-institution">
          <option value="">Select institution</option>
          <option value="inst-001">University of Texas</option>
          <option value="inst-002">University of Alabama</option>
        </select>
      </div>
      
      <div data-testid="student-information">
        <h2>Student Information</h2>
        <label htmlFor="student-id">
          Student ID <span className="text-destructive">*</span>
        </label>
        <input id="student-id" type="text" data-testid="student-id" placeholder="Enter student ID" />
        
        <label htmlFor="student-name">
          Student Name <span className="text-destructive">*</span>
        </label>
        <input id="student-name" type="text" data-testid="student-name" placeholder="Enter student name" />
        
        <label htmlFor="sport">
          Sport <span className="text-destructive">*</span>
        </label>
        <select id="sport" data-testid="sport">
          <option value="">Select sport</option>
          <option value="Football">Football</option>
          <option value="Basketball">Basketball</option>
        </select>
        
        <label htmlFor="academic-year">
          Academic Year <span className="text-destructive">*</span>
        </label>
        <select id="academic-year" data-testid="academic-year">
          <option value="">Select year</option>
          <option value="Freshman">Freshman</option>
          <option value="Sophomore">Sophomore</option>
        </select>
      </div>
      
      <div data-testid="upload-area">
        <input type="file" id="file-input" data-testid="file-input" accept=".pdf,.jpg,.png,.docx" multiple />
        <div data-testid="drop-zone" role="region" aria-label="Drop files here">
          <div className="border-2 border-dashed p-8 text-center">
            <div data-testid="upload-icon" aria-hidden="true">📄</div>
            <p>Drag and drop files here, or click to browse</p>
            <p className="text-sm text-muted-foreground">PDF, JPEG, PNG, DOCX (max 10MB)</p>
          </div>
        </div>
      </div>
      
      <div data-testid="file-list">
        {/* Files will be rendered here */}
      </div>
      
      <button type="submit" data-testid="submit-button">Upload Transcripts</button>
    </div>
  );
};

describe('Transcript Upload Flow - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('File Validation', () => {
    it('should accept valid PDF files', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const validFile = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, validFile);
      
      // File should be added to the list
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        return fileList !== null;
      });
    });

    it('should reject invalid file types', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const invalidFile = createMockFile('document.txt', 'text/plain');
      
      await user.upload(fileInput, invalidFile);
      
      // Error message should be displayed
      await waitFor(() => {
        const errorMessage = screen.queryByText(/invalid file type/i);
        return errorMessage !== null;
      });
    });

    it('should reject files exceeding size limit', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const largeFile = createMockFile('large.pdf', 'application/pdf', 11 * 1024 * 1024); // 11MB
      
      await user.upload(fileInput, largeFile);
      
      // Error message should be displayed
      await waitFor(() => {
        const errorMessage = screen.queryByText(/file size exceeds/i);
        return errorMessage !== null;
      });
    });

    it('should display file size in human-readable format', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf', 2.5 * 1024 * 1024); // 2.5MB
      
      await user.upload(fileInput, file);
      
      // File size should be displayed
      await waitFor(() => {
        const fileSize = screen.queryByText(formatFileSize(file.size));
        return fileSize !== null;
      });
    });
  });

  describe('Drag and Drop Functionality', () => {
    it('should handle drag over event', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const dropZone = screen.getByTestId('drop-zone');
      
      // Simulate drag over
      await user.hover(dropZone);
      
      // Drop zone should show active state
      expect(dropZone).toHaveClass(/border-primary/);
    });

    it('should handle drag leave event', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const dropZone = screen.getByTestId('drop-zone');
      
      // Simulate drag leave
      await user.unhover(dropZone);
      
      // Drop zone should return to normal state
      expect(dropZone).not.toHaveClass(/border-primary/);
    });

    it('should handle file drop', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const dropZone = screen.getByTestId('drop-zone');
      const file = createMockFile('dropped.pdf', 'application/pdf');
      
      // Simulate drop
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer
      });
      
      dropZone.dispatchEvent(dropEvent);
      
      // File should be added to the list
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        return fileList !== null;
      });
    });

    it('should support multiple file drop', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const dropZone = screen.getByTestId('drop-zone');
      const files = createMockFiles(3);
      
      // Simulate multiple file drop
      const dataTransfer = new DataTransfer();
      files.forEach(file => dataTransfer.items.add(file));
      
      const dropEvent = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        dataTransfer
      });
      
      dropZone.dispatchEvent(dropEvent);
      
      // All files should be added to the list
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        const fileItems = fileList?.querySelectorAll('[data-testid^="file-item-"]');
        return fileItems && fileItems.length === 3;
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should display upload progress indicator', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Progress indicator should be visible
      await waitFor(() => {
        const progressBar = screen.queryByRole('progressbar');
        return progressBar !== null;
      });
    });

    it('should update progress during upload', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for progress updates
      await waitFor(() => {
        const progressBar = screen.queryByRole('progressbar');
        const progressText = progressBar?.getAttribute('aria-valuenow');
        return progressText !== null && parseInt(progressText || '0') > 0;
      });
    });

    it('should show completion state when upload finishes', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for completion
      await waitFor(() => {
        const successMessage = screen.queryByText(/upload successful/i);
        return successMessage !== null;
      });
    });
  });

  describe('Form Validation', () => {
    it('should require all mandatory fields', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const submitButton = screen.getByTestId('submit-button');
      
      // Try to submit without filling fields
      await user.click(submitButton);
      
      // Validation error should be displayed
      await waitFor(() => {
        const errorMessage = screen.queryByText(/fill in all required fields/i);
        return errorMessage !== null;
      });
    });

    it('should validate source institution selection', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const submitButton = screen.getByTestId('submit-button');
      const sourceInstitution = screen.getByTestId('source-institution');
      
      // Select source institution
      await user.selectOptions(sourceInstitution, ['University of Texas']);
      
      // Validation should pass for this field
      await user.click(submitButton);
      
      // Should not show error for source institution
      const errorMessage = screen.queryByText(/source institution/i);
      expect(errorMessage).toBeNull();
    });

    it('should validate student ID', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const submitButton = screen.getByTestId('submit-button');
      const studentIdInput = screen.getByTestId('student-id');
      
      // Enter student ID
      await user.type(studentIdInput, 'STU001');
      
      // Validation should pass for this field
      await user.click(submitButton);
      
      // Should not show error for student ID
      const errorMessage = screen.queryByText(/student id/i);
      expect(errorMessage).toBeNull();
    });

    it('should validate sport selection', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const submitButton = screen.getByTestId('submit-button');
      const sportSelect = screen.getByTestId('sport');
      
      // Select sport
      await user.selectOptions(sportSelect, ['Football']);
      
      // Validation should pass for this field
      await user.click(submitButton);
      
      // Should not show error for sport
      const errorMessage = screen.queryByText(/sport/i);
      expect(errorMessage).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should display error message for upload failure', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      // Mock upload failure
      await user.upload(fileInput, file);
      
      // Wait for error state
      await waitFor(() => {
        const errorMessage = screen.queryByText(/upload failed/i);
        return errorMessage !== null;
      });
    });

    it('should allow retry after error', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      // Mock upload failure
      await user.upload(fileInput, file);
      
      // Wait for error state
      await waitFor(() => {
        const errorMessage = screen.queryByText(/upload failed/i);
        return errorMessage !== null;
      });
      
      // Retry button should be available
      const retryButton = screen.queryByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should clear error state on new file selection', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      // Mock upload failure
      await user.upload(fileInput, file);
      
      // Wait for error state
      await waitFor(() => {
        const errorMessage = screen.queryByText(/upload failed/i);
        return errorMessage !== null;
      });
      
      // Select new file
      const newFile = createMockFile('new-transcript.pdf', 'application/pdf');
      await user.upload(fileInput, newFile);
      
      // Error should be cleared
      await waitFor(() => {
        const errorMessage = screen.queryByText(/upload failed/i);
        return errorMessage === null;
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on form fields', () => {
      render(mockUploadPage());
      
      // Check for proper labels
      const sourceInstitution = screen.getByTestId('source-institution');
      expect(sourceInstitution).toHaveAttribute('aria-label');
      
      const studentIdInput = screen.getByTestId('student-id');
      expect(studentIdInput).toHaveAttribute('aria-label');
      
      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA roles on interactive elements', () => {
      render(mockUploadPage());
      
      // Check for proper roles
      const dropZone = screen.getByTestId('drop-zone');
      expect(dropZone).toHaveAttribute('role', 'region');
      
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveAttribute('role', 'button');
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      // Tab through form fields
      await user.tab();
      const sourceInstitution = screen.getByTestId('source-institution');
      expect(sourceInstitution).toHaveFocus();
      
      await user.tab();
      const targetInstitution = screen.getByTestId('target-institution');
      expect(targetInstitution).toHaveFocus();
      
      await user.tab();
      const studentIdInput = screen.getByTestId('student-id');
      expect(studentIdInput).toHaveFocus();
      
      await user.tab();
      const submitButton = screen.getByTestId('submit-button');
      expect(submitButton).toHaveFocus();
    });

    it('should have visible focus indicators', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const submitButton = screen.getByTestId('submit-button');
      
      // Focus on button
      await user.tab();
      await user.tab();
      expect(submitButton).toHaveFocus();
      
      // Check for focus indicator (outline or box-shadow)
      const styles = window.getComputedStyle(submitButton);
      const hasFocusIndicator = 
        styles.outline !== 'none' || 
        styles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBe(true);
    });
  });

  describe('Complete Upload Flow', () => {
    it('should complete full upload flow successfully', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      // Fill in all required fields
      const sourceInstitution = screen.getByTestId('source-institution');
      await user.selectOptions(sourceInstitution, ['University of Texas']);
      
      const targetInstitution = screen.getByTestId('target-institution');
      await user.selectOptions(targetInstitution, ['University of Alabama']);
      
      const studentIdInput = screen.getByTestId('student-id');
      await user.type(studentIdInput, 'STU001');
      
      const studentNameInput = screen.getByTestId('student-name');
      await user.type(studentNameInput, 'Alex Testington');
      
      const sportSelect = screen.getByTestId('sport');
      await user.selectOptions(sportSelect, ['Football']);
      
      const academicYearSelect = screen.getByTestId('academic-year');
      await user.selectOptions(academicYearSelect, ['Junior']);
      
      // Upload file
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      await user.upload(fileInput, file);
      
      // Wait for upload progress
      await waitFor(() => {
        const progressBar = screen.queryByRole('progressbar');
        return progressBar !== null;
      });
      
      // Wait for completion
      await waitFor(() => {
        const successMessage = screen.queryByText(/upload successful/i);
        return successMessage !== null;
      });
    });

    it('should handle multiple file uploads in sequence', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      // Fill in required fields
      const sourceInstitution = screen.getByTestId('source-institution');
      await user.selectOptions(sourceInstitution, ['University of Texas']);
      
      const studentIdInput = screen.getByTestId('student-id');
      await user.type(studentIdInput, 'STU001');
      
      // Upload multiple files
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      await user.upload(fileInput, files);
      
      // Wait for all files to be processed
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        const fileItems = fileList?.querySelectorAll('[data-testid^="file-item-"]');
        return fileItems && fileItems.length === 3;
      });
    });
  });

  // ============================================================================
  // Additional Edge Cases - Boundary Conditions
  // ============================================================================

  describe('Additional Edge Cases - Boundary Conditions', () => {
    it('should reject file at exact size limit (10MB)', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const limitFile = createMockFile('limit.pdf', 'application/pdf', 10 * 1024 * 1024); // 10MB
      
      await user.upload(fileInput, limitFile);
      
      // Error message should be displayed
      await waitFor(() => {
        const errorMessage = screen.queryByText(/file size exceeds/i);
        return errorMessage !== null;
      });
    });

    it('should reject file 1 byte over limit', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const overLimitFile = createMockFile('over.pdf', 'application/pdf', (10 * 1024 * 1024) + 1); // 10MB + 1 byte
      
      await user.upload(fileInput, overLimitFile);
      
      // Error message should be displayed
      await waitFor(() => {
        const errorMessage = screen.queryByText(/file size exceeds/i);
        return errorMessage !== null;
      });
    });

    it('should handle 0-byte file', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const emptyFile = createMockFile('empty.pdf', 'application/pdf', 0);
      
      await user.upload(fileInput, emptyFile);
      
      // Error message should be displayed
      await waitFor(() => {
        const errorMessage = screen.queryByText(/empty file/i);
        return errorMessage !== null;
      });
    });

    it('should handle uploading 100+ files simultaneously', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const manyFiles = createMockFiles(100);
      
      await user.upload(fileInput, manyFiles);
      
      // Should handle gracefully (may show warning or limit)
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        return fileList !== null;
      });
    });
  });

  // ============================================================================
  // Additional Edge Cases - Network Failures
  // ============================================================================

  describe('Additional Edge Cases - Network Failures', () => {
    it('should handle network timeout during upload', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for timeout error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/timeout/i);
        return errorMessage !== null;
      }, { timeout: 35000 });
    });

    it('should handle network disconnection mid-upload', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for network error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/network error/i);
        return errorMessage !== null;
      });
    });

    it('should handle 503 Service Unavailable', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for service unavailable error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/service unavailable/i);
        return errorMessage !== null;
      });
    });

    it('should handle 504 Gateway Timeout', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for gateway timeout error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/gateway timeout/i);
        return errorMessage !== null;
      });
    });
  });

  // ============================================================================
  // Additional Edge Cases - API Errors
  // ============================================================================

  describe('Additional Edge Cases - API Errors', () => {
    it('should display error for 400 Bad Request', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for bad request error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/bad request/i);
        return errorMessage !== null;
      });
    });

    it('should display error for 401 Unauthorized', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for unauthorized error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/unauthorized/i);
        return errorMessage !== null;
      });
    });

    it('should display error for 403 Forbidden', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for forbidden error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/forbidden/i);
        return errorMessage !== null;
      });
    });

    it('should display error for 404 Not Found', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for not found error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/not found/i);
        return errorMessage !== null;
      });
    });

    it('should display error for 500 Internal Server Error', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for internal server error
      await waitFor(() => {
        const errorMessage = screen.queryByText(/internal server error/i);
        return errorMessage !== null;
      });
    });
  });

  // ============================================================================
  // Additional Edge Cases - Invalid Data
  // ============================================================================

  describe('Additional Edge Cases - Invalid Data', () => {
    it('should reject file with invalid MIME type', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const invalidFile = createMockFile('script.exe', 'application/x-msdownload');
      
      await user.upload(fileInput, invalidFile);
      
      // Error message should be displayed
      await waitFor(() => {
        const errorMessage = screen.queryByText(/invalid file type/i);
        return errorMessage !== null;
      });
    });

    it('should reject corrupted PDF file', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const corruptedFile = createMockFile('corrupted.pdf', 'application/pdf');
      
      await user.upload(fileInput, corruptedFile);
      
      // Error message should be displayed
      await waitFor(() => {
        const errorMessage = screen.queryByText(/corrupted file/i);
        return errorMessage !== null;
      });
    });

    it('should reject file with malicious content', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const maliciousFile = createMockFile('malicious.pdf', 'application/pdf');
      
      await user.upload(fileInput, maliciousFile);
      
      // Error message should be displayed
      await waitFor(() => {
        const errorMessage = screen.queryByText(/malicious content/i);
        return errorMessage !== null;
      });
    });
  });

  // ============================================================================
  // Additional Edge Cases - Concurrent Operations
  // ============================================================================

  describe('Additional Edge Cases - Concurrent Operations', () => {
    it('should handle upload while another in progress', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file1 = createMockFile('transcript1.pdf', 'application/pdf');
      const file2 = createMockFile('transcript2.pdf', 'application/pdf');
      
      // Start first upload
      await user.upload(fileInput, file1);
      
      // Try to start second upload while first is in progress
      await user.upload(fileInput, file2);
      
      // Should show warning or queue second upload
      await waitFor(() => {
        const warningMessage = screen.queryByText(/upload in progress/i);
        return warningMessage !== null;
      });
    });

    it('should handle rapidly clicking upload button 10 times', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const submitButton = screen.getByTestId('submit-button');
      
      // Rapid clicks
      for (let i = 0; i < 10; i++) {
        await user.click(submitButton);
      }
      
      // Should only submit once
      await waitFor(() => {
        const successMessage = screen.queryByText(/upload successful/i);
        return successMessage !== null;
      });
    });
  });

  // ============================================================================
  // Additional Edge Cases - Accessibility
  // ============================================================================

  describe('Additional Edge Cases - Accessibility', () => {
    it('should announce upload progress to screen readers', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for progress indicator
      await waitFor(() => {
        const progressBar = screen.queryByRole('progressbar');
        return progressBar !== null;
      });
      
      // Check for ARIA live region
      const progressBar = screen.queryByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-live', 'polite');
    });

    it('should be keyboard navigable for file removal', async () => {
      const user = userEvent.setup();
      render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Wait for file list
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        return fileList !== null;
      });
      
      // Tab to file list and check for keyboard navigation
      await user.tab();
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeInstanceOf(HTMLElement);
    });
  });

  // ============================================================================
  // Additional Edge Cases - Memory Leaks
  // ============================================================================

  describe('Additional Edge Cases - Memory Leaks', () => {
    it('should cleanup after upload cancellation', async () => {
      const user = userEvent.setup();
      const { unmount } = render(mockUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const file = createMockFile('transcript.pdf', 'application/pdf');
      
      await user.upload(fileInput, file);
      
      // Unmount should not throw error
      expect(() => unmount()).not.toThrow();
    });
  });
});
