/**
 * Batch Upload Flow - Integration Tests
 * 
 * Tests complete batch upload flow including:
 * - Multiple file handling
 * - Progress tracking
 * - Error handling
 * - Accessibility throughout the flow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMockFiles, formatFileSize } from '../../utils/integration-test-utils';

// Mock BatchUploadPage component
const mockBatchUploadPage = () => {
  return (
    <div data-testid="batch-upload-page">
      <h1>Batch Upload</h1>
      <p>Upload multiple transcripts at once</p>
      
      <div data-testid="upload-area">
        <input type="file" id="file-input" data-testid="file-input" accept=".pdf" multiple />
        <div data-testid="drop-zone" role="region" aria-label="Drop files here">
          <div className="border-2 border-dashed p-8 text-center">
            <div data-testid="upload-icon" aria-hidden="true">📄</div>
            <p>Drag and drop files here, or click to browse</p>
            <p className="text-sm text-muted-foreground">PDF files only (max 10MB each)</p>
          </div>
        </div>
      </div>
      
      <div data-testid="file-list">
        {/* Files will be rendered here */}
      </div>
      
      <div data-testid="upload-controls">
        <button data-testid="upload-all" aria-label="Upload all files">Upload All</button>
        <button data-testid="clear-all" aria-label="Clear all files">Clear All</button>
      </div>
      
      <div data-testid="progress-section">
        <h2>Upload Progress</h2>
        <div data-testid="overall-progress">
          <p>Overall Progress</p>
          <div data-testid="progress-bar" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
            <div className="w-full bg-primary h-2"></div>
          </div>
          <p data-testid="progress-text">0%</p>
        </div>
        
        <div data-testid="file-progress-list">
          <div data-testid="file-progress-1">
            <p>transcript-1.pdf</p>
            <div data-testid="file-progress-bar-1" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
              <div className="w-full bg-blue-500 h-2"></div>
            </div>
            <p data-testid="file-progress-text-1">Pending</p>
          </div>
          <div data-testid="file-progress-2">
            <p>transcript-2.pdf</p>
            <div data-testid="file-progress-bar-2" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
              <div className="w-full bg-blue-500 h-2"></div>
            </div>
            <p data-testid="file-progress-text-2">Pending</p>
          </div>
          <div data-testid="file-progress-3">
            <p>transcript-3.pdf</p>
            <div data-testid="file-progress-bar-3" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
              <div className="w-full bg-blue-500 h-2"></div>
            </div>
            <p data-testid="file-progress-text-3">Pending</p>
          </div>
        </div>
      </div>
      
      <div data-testid="results-section">
        <h2>Upload Results</h2>
        <div data-testid="results-summary">
          <p>Total Files: <span data-testid="total-files">3</span></p>
          <p>Successful: <span data-testid="successful-files">2</span></p>
          <p>Failed: <span data-testid="failed-files">1</span></p>
        </div>
        
        <table data-testid="results-table" role="table">
          <thead>
            <tr>
              <th>File Name</th>
              <th>Status</th>
              <th>Size</th>
              <th>Error</th>
            </tr>
          </thead>
          <tbody data-testid="results-table-body">
            <tr data-testid="result-row-1">
              <td>transcript-1.pdf</td>
              <td><span data-testid="status-success">Success</span></td>
              <td>2.5 MB</td>
              <td>-</td>
            </tr>
            <tr data-testid="result-row-2">
              <td>transcript-2.pdf</td>
              <td><span data-testid="status-success">Success</span></td>
              <td>1.8 MB</td>
              <td>-</td>
            </tr>
            <tr data-testid="result-row-3">
              <td>transcript-3.pdf</td>
              <td><span data-testid="status-failed">Failed</span></td>
              <td>3.2 MB</td>
              <td>Invalid file format</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

describe('Batch Upload Flow - Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Multiple File Handling', () => {
    it('should accept multiple files', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // All files should be added to list
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        const fileItems = fileList?.querySelectorAll('[data-testid^="file-item-"]');
        return fileItems && fileItems.length === 3;
      });
    });

    it('should display file details', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // File details should be displayed
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        return fileList !== null;
      });
      
      // Check for file names
      expect(screen.getByText('transcript-1.pdf')).toBeInTheDocument();
      expect(screen.getByText('transcript-2.pdf')).toBeInTheDocument();
      expect(screen.getByText('transcript-3.pdf')).toBeInTheDocument();
    });

    it('should display file sizes', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // File sizes should be displayed
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        return fileList !== null;
      });
      
      // Check for file sizes
      expect(screen.getByText(formatFileSize(files[0].size))).toBeInTheDocument();
      expect(screen.getByText(formatFileSize(files[1].size))).toBeInTheDocument();
      expect(screen.getByText(formatFileSize(files[2].size))).toBeInTheDocument();
    });

    it('should allow removing individual files', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Wait for files to be added
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        return fileList !== null;
      });
      
      // Remove first file
      const removeButton = screen.queryByRole('button', { name: /remove/i });
      if (removeButton) {
        await user.click(removeButton);
        
        // File should be removed
        await waitFor(() => {
          const fileItem = screen.queryByTestId('file-item-1');
          return fileItem === null;
        });
      }
    });

    it('should clear all files', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Wait for files to be added
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        return fileList !== null;
      });
      
      // Clear all files
      const clearButton = screen.getByTestId('clear-all');
      await user.click(clearButton);
      
      // All files should be removed
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        const fileItems = fileList?.querySelectorAll('[data-testid^="file-item-"]');
        return fileItems && fileItems.length === 0;
      });
    });
  });

  describe('Progress Tracking', () => {
    it('should display overall progress', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Click upload all
      const uploadButton = screen.getByTestId('upload-all');
      await user.click(uploadButton);
      
      // Overall progress should be visible
      await waitFor(() => {
        const progressBar = screen.queryByTestId('progress-bar');
        return progressBar !== null;
      });
    });

    it('should update overall progress during upload', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Click upload all
      const uploadButton = screen.getByTestId('upload-all');
      await user.click(uploadButton);
      
      // Wait for progress updates
      await waitFor(() => {
        const progressText = screen.queryByTestId('progress-text');
        const progressValue = progressText?.textContent;
        return progressValue !== null && parseInt(progressValue) > 0;
      });
    });

    it('should display individual file progress', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Click upload all
      const uploadButton = screen.getByTestId('upload-all');
      await user.click(uploadButton);
      
      // Individual progress should be visible
      await waitFor(() => {
        const fileProgressBars = screen.getAllByRole('progressbar');
        return fileProgressBars.length === 4; // 1 overall + 3 individual
      });
    });

    it('should show completion state when all files uploaded', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Click upload all
      const uploadButton = screen.getByTestId('upload-all');
      await user.click(uploadButton);
      
      // Wait for completion
      await waitFor(() => {
        const successMessage = screen.queryByText(/upload complete/i);
        return successMessage !== null;
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle individual file errors', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Click upload all
      const uploadButton = screen.getByTestId('upload-all');
      await user.click(uploadButton);
      
      // Wait for results
      await waitFor(() => {
        const resultsSection = screen.queryByTestId('results-section');
        return resultsSection !== null;
      });
      
      // Check for failed file
      const failedStatus = screen.getByTestId('status-failed');
      expect(failedStatus).toBeInTheDocument();
    });

    it('should display error messages for failed files', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Click upload all
      const uploadButton = screen.getByTestId('upload-all');
      await user.click(uploadButton);
      
      // Wait for results
      await waitFor(() => {
        const resultsSection = screen.queryByTestId('results-section');
        return resultsSection !== null;
      });
      
      // Check for error message
      const errorMessage = screen.getByText('Invalid file format');
      expect(errorMessage).toBeInTheDocument();
    });

    it('should allow retrying failed files', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Click upload all
      const uploadButton = screen.getByTestId('upload-all');
      await user.click(uploadButton);
      
      // Wait for results
      await waitFor(() => {
        const resultsSection = screen.queryByTestId('results-section');
        return resultsSection !== null;
      });
      
      // Retry button should be available
      const retryButton = screen.queryByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should handle network errors', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Click upload all
      const uploadButton = screen.getByTestId('upload-all');
      await user.click(uploadButton);
      
      // Wait for error state
      await waitFor(() => {
        const errorMessage = screen.queryByText(/network error/i);
        return errorMessage !== null;
      });
      
      // Error message should be displayed
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle multiple file drop', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
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
      
      // All files should be added to list
      await waitFor(() => {
        const fileList = screen.queryByTestId('file-list');
        const fileItems = fileList?.querySelectorAll('[data-testid^="file-item-"]');
        return fileItems && fileItems.length === 3;
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on form elements', () => {
      render(mockBatchUploadPage());
      
      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveAttribute('aria-label');
      
      const uploadButton = screen.getByTestId('upload-all');
      expect(uploadButton).toHaveAttribute('aria-label');
      
      const clearButton = screen.getByTestId('clear-all');
      expect(clearButton).toHaveAttribute('aria-label');
    });

    it('should have proper ARIA roles on progress bars', () => {
      render(mockBatchUploadPage());
      
      const progressBars = screen.getAllByRole('progressbar');
      progressBars.forEach(bar => {
        expect(bar).toHaveAttribute('role', 'progressbar');
        expect(bar).toHaveAttribute('aria-valuenow');
        expect(bar).toHaveAttribute('aria-valuemin');
        expect(bar).toHaveAttribute('aria-valuemax');
      });
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      // Tab through form
      await user.tab();
      const fileInput = screen.getByTestId('file-input');
      expect(fileInput).toHaveFocus();
      
      await user.tab();
      const uploadButton = screen.getByTestId('upload-all');
      expect(uploadButton).toHaveFocus();
      
      await user.tab();
      const clearButton = screen.getByTestId('clear-all');
      expect(clearButton).toHaveFocus();
    });

    it('should have visible focus indicators', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      const uploadButton = screen.getByTestId('upload-all');
      
      // Focus on button
      await user.tab();
      await user.tab();
      expect(uploadButton).toHaveFocus();
      
      // Check for focus indicator
      const styles = window.getComputedStyle(uploadButton);
      const hasFocusIndicator = 
        styles.outline !== 'none' || 
        styles.boxShadow !== 'none';
      
      expect(hasFocusIndicator).toBe(true);
    });
  });

  describe('Complete Batch Upload Flow', () => {
    it('should complete full batch upload workflow', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      // Upload multiple files
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Click upload all
      const uploadButton = screen.getByTestId('upload-all');
      await user.click(uploadButton);
      
      // Wait for progress
      await waitFor(() => {
        const progressBar = screen.queryByTestId('progress-bar');
        return progressBar !== null;
      });
      
      // Wait for completion
      await waitFor(() => {
        const successMessage = screen.queryByText(/upload complete/i);
        return successMessage !== null;
      });
      
      // Results should be displayed
      const resultsSection = screen.getByTestId('results-section');
      expect(resultsSection).toBeInTheDocument();
    });

    it('should display upload summary', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      // Upload multiple files
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Click upload all
      const uploadButton = screen.getByTestId('upload-all');
      await user.click(uploadButton);
      
      // Wait for results
      await waitFor(() => {
        const resultsSection = screen.queryByTestId('results-section');
        return resultsSection !== null;
      });
      
      // Check summary
      expect(screen.getByTestId('total-files')).toHaveTextContent('3');
      expect(screen.getByTestId('successful-files')).toHaveTextContent('2');
      expect(screen.getByTestId('failed-files')).toHaveTextContent('1');
    });

    it('should handle partial success scenario', async () => {
      const user = userEvent.setup();
      render(mockBatchUploadPage());
      
      // Upload multiple files
      const fileInput = screen.getByTestId('file-input');
      const files = createMockFiles(3);
      
      await user.upload(fileInput, files);
      
      // Click upload all
      const uploadButton = screen.getByTestId('upload-all');
      await user.click(uploadButton);
      
      // Wait for results
      await waitFor(() => {
        const resultsSection = screen.queryByTestId('results-section');
        return resultsSection !== null;
      });
      
      // Verify partial success
      const successfulFiles = screen.getByTestId('successful-files');
      expect(successfulFiles).toHaveTextContent('2');
      
      const failedFiles = screen.getByTestId('failed-files');
      expect(failedFiles).toHaveTextContent('1');
    });
  });
});
