/**
 * Select Component Unit Tests
 * 
 * Comprehensive unit tests for Select component covering:
 * - Rendering with default props
 * - Rendering with all sub-components (SelectTrigger, SelectValue, SelectContent, SelectItem, SelectLabel, SelectSeparator, SelectGroup)
 * - User interactions (open, close, select, keyboard navigation)
 * - Accessibility attributes (ARIA roles, labels, focus management)
 * - Edge cases (empty states, disabled states)
 * - Event handler callbacks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectGroup,
} from '@/components/select'

describe('Select Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  // ============================================================================
  // Select Root Component Tests
  // ============================================================================

  describe('Select Root', () => {
    it('should render with default props', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should render with defaultValue', () => {
      render(
        <Select defaultValue="option1">
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })

    it('should call onValueChange when value changes', async () => {
      const handleValueChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Select onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        const item = screen.getByText('Option 1')
        await user.click(item)
      })
      
      expect(handleValueChange).toHaveBeenCalledWith('option1')
    })

    it('should render with disabled state', () => {
      render(
        <Select disabled>
          <SelectTrigger>
            <SelectValue placeholder="Disabled select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDisabled()
    })
  })

  // ============================================================================
  // SelectTrigger Component Tests
  // ============================================================================

  describe('SelectTrigger', () => {
    it('should render trigger button', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })

    it('should open select when clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })
    })

    it('should render with custom className', () => {
      render(
        <Select>
          <SelectTrigger className="custom-trigger">
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(screen.getByRole('combobox')).toHaveClass('custom-trigger')
    })
  })

  // ============================================================================
  // SelectValue Component Tests
  // ============================================================================

  describe('SelectValue', () => {
    it('should render with placeholder', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(screen.getByText('Select an option')).toBeInTheDocument()
    })

    it('should render selected value', () => {
      render(
        <Select defaultValue="option1">
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(screen.getByText('Option 1')).toBeInTheDocument()
    })

    it('should render with custom className', () => {
      render(
        <Select>
          <SelectTrigger>
            <SelectValue className="custom-value" placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(screen.getByText('Select')).toHaveClass('custom-value')
    })
  })

  // ============================================================================
  // SelectContent Component Tests
  // ============================================================================

  describe('SelectContent', () => {
    it('should render with default props', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })
    })

    it('should render with custom className', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent className="custom-content">
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        const content = screen.getByText('Option 1').closest('[data-state="open"]')
        expect(content).toHaveClass('custom-content')
      })
    })

    it('should close when clicking outside', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })
      
      await user.click(document.body)
      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // SelectItem Component Tests
  // ============================================================================

  describe('SelectItem', () => {
    it('should render with default props', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })
    })

    it('should call onSelect when clicked', async () => {
      const handleSelect = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem onSelect={handleSelect} value="option1">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        const item = screen.getByText('Option 1')
        await user.click(item)
      })
      
      expect(handleSelect).toHaveBeenCalledWith('option1')
    })

    it('should not call onSelect when disabled', async () => {
      const handleSelect = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem disabled onSelect={handleSelect} value="option1">
              Disabled Option
            </SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(async () => {
        const item = screen.getByText('Option 1')
        await user.click(item)
      })
      
      expect(handleSelect).not.toHaveBeenCalled()
    })

    it('should render with custom className', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem className="custom-item" value="option1">
              Option 1
            </SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toHaveClass('custom-item')
      })
    })
  })

  // ============================================================================
  // SelectLabel Component Tests
  // ============================================================================

  describe('SelectLabel', () => {
    it('should render with default props', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel>Menu Label</SelectLabel>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Menu Label')).toBeInTheDocument()
      })
    })

    it('should render with custom className', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel className="custom-label">Label</SelectLabel>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Label')).toHaveClass('custom-label')
      })
    })
  })

  // ============================================================================
  // SelectSeparator Component Tests
  // ============================================================================

  describe('SelectSeparator', () => {
    it('should render with default props', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator />
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        const separator = document.querySelector('[role="separator"]')
        expect(separator).toBeInTheDocument()
      })
    })

    it('should render with custom className', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator className="custom-separator" />
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        const separator = document.querySelector('[role="separator"]')
        expect(separator).toHaveClass('custom-separator')
      })
    })
  })

  // ============================================================================
  // SelectGroup Component Tests
  // ============================================================================

  describe('SelectGroup', () => {
    it('should render with default props', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
        expect(screen.getByText('Option 2')).toBeInTheDocument()
      })
    })

    it('should render with custom className', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup className="custom-group">
              <SelectItem value="option1">Option 1</SelectItem>
              <SelectItem value="option2">Option 2</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        const group = screen.getByText('Option 1').closest('[role="group"]')
        expect(group).toHaveClass('custom-group')
      })
    })
  })

  // ============================================================================
  // Full Select Composition Tests
  // ============================================================================

  describe('Full Select Composition', () => {
    it('should render complete select with all components', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select an option" />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel>Menu Label</SelectLabel>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator />
            <SelectItem value="option2">Option 2</SelectItem>
            <SelectItem value="option3">Option 3</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Menu Label')).toBeInTheDocument()
        expect(screen.getByText('Option 1')).toBeInTheDocument()
        expect(screen.getByText('Option 2')).toBeInTheDocument()
        expect(screen.getByText('Option 3')).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Interaction Tests
  // ============================================================================

  describe('Interactions', () => {
    it('should open select when trigger is clicked', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })
    })

    it('should close when clicking outside', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })
      
      await user.click(document.body)
      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
      })
    })

    it('should close on Escape key', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Option 1')).toBeInTheDocument()
      })
      
      await user.keyboard('{Escape}')
      await waitFor(() => {
        expect(screen.queryByText('Option 1')).not.toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  describe('Accessibility', () => {
    it('should have proper ARIA roles', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        const trigger = screen.getByRole('combobox')
        expect(trigger).toBeInTheDocument()
      })
    })

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        await user.keyboard('{ArrowDown}')
        expect(screen.getByText('Option 2')).toHaveFocus()
      })
    })

    it('should trap focus within select', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        await user.tab()
        expect(screen.getByText('Option 1') || screen.getByText('Option 2')).toHaveFocus()
      })
    })
  })

  // ============================================================================
  // Edge Cases
  // ============================================================================

  describe('Edge Cases', () => {
    it('should render with empty select', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent></SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        const content = document.querySelector('[role="listbox"]')
        expect(content).toBeInTheDocument()
      })
    })

    it('should render with very long text', async () => {
      const user = userEvent.setup()
      const longText = 'A'.repeat(200)
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">{longText}</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText(longText)).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Snapshot Tests
  // ============================================================================

  describe('Snapshots', () => {
    it('should match snapshot with minimal select', () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(container.firstChild).toMatchSnapshot()
    })

    it('should match snapshot with full select', () => {
      const { container } = render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectLabel>Menu Label</SelectLabel>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectSeparator />
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(container.firstChild).toMatchSnapshot()
    })
  })
  })

  // ============================================================================
  // Additional Edge Cases - Null/Undefined Handling
  // ============================================================================

  describe('Additional Edge Cases - Null/Undefined Handling', () => {
    it('should render with empty options list', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent></SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        const content = document.querySelector('[role="listbox"]')
        expect(content).toBeInTheDocument()
      })
    })

    it('should render with null defaultValue', () => {
      render(
        <Select defaultValue={null}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
          </SelectContent>
        </Select>
      )
      expect(screen.getByRole('combobox')).toBeInTheDocument()
    })
  })

  // ============================================================================
  // Additional Edge Cases - Boundary Conditions
  // ============================================================================

  describe('Additional Edge Cases - Boundary Conditions', () => {
    it('should handle 100+ options', async () => {
      const user = userEvent.setup()
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 100 }, (_, i) => (
              <SelectItem key={i} value={`option${i}`}>
                Option {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText('Option 0')).toBeInTheDocument()
        expect(screen.getByText('Option 99')).toBeInTheDocument()
      })
    })

    it('should handle options with extremely long text', async () => {
      const user = userEvent.setup()
      const longText = 'A'.repeat(200)
      
      render(
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">{longText}</SelectItem>
          </SelectContent>
        </Select>
      )
      
      await user.click(screen.getByRole('combobox'))
      await waitFor(() => {
        expect(screen.getByText(longText)).toBeInTheDocument()
      })
    })
  })

  // ============================================================================
  // Additional Edge Cases - Concurrent Operations
  // ============================================================================

  describe('Additional Edge Cases - Concurrent Operations', () => {
    it('should handle rapidly changing value 50 times', async () => {
      const handleValueChange = vi.fn()
      const user = userEvent.setup()
      
      render(
        <Select onValueChange={handleValueChange}>
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      // Rapid value changes
      for (let i = 0; i < 50; i++) {
        await user.click(screen.getByRole('combobox'))
        await waitFor(() => {
          const item = screen.getByText(i % 2 === 0 ? 'Option 1' : 'Option 2')
          if (item) await user.click(item)
        })
      }
      
      expect(handleValueChange).toHaveBeenCalled()
    })
  })

  // ============================================================================
  // Additional Edge Cases - Accessibility
  // ============================================================================

  describe('Additional Edge Cases - Accessibility', () => {
    it('should announce selected value to screen readers', async () => {
      const user = userEvent.setup()
      
      render(
        <Select defaultValue="option1">
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="option1">Option 1</SelectItem>
            <SelectItem value="option2">Option 2</SelectItem>
          </SelectContent>
        </Select>
      )
      
      const trigger = screen.getByRole('combobox')
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox')
      expect(trigger).toHaveAttribute('aria-expanded')
    })
  })
})
