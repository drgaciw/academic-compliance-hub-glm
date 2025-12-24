/**
 * Component Props Fixtures
 * 
 * This file contains reusable prop fixtures for testing UI components.
 * All fixtures use synthetic, non-identifiable data for FERPA compliance.
 */

import { ReactNode } from 'react'

// ============================================================================
// Button Component Props
// ============================================================================

export const buttonVariants = [
  'default',
  'destructive',
  'outline',
  'secondary',
  'ghost',
  'link',
] as const

export const buttonSizes = [
  'default',
  'sm',
  'lg',
  'icon',
  'icon-sm',
  'icon-lg',
] as const

export const buttonPropsFixtures = {
  default: {
    children: 'Click me',
  },
  withVariant: (variant: typeof buttonVariants[number]) => ({
    children: `${variant} button`,
    variant,
  }),
  withSize: (size: typeof buttonSizes[number]) => ({
    children: `${size} button`,
    size,
  }),
  withIcon: {
    children: <span data-testid="icon">★</span>,
    size: 'icon',
  },
  disabled: {
    children: 'Disabled',
    disabled: true,
  },
  withOnClick: {
    children: 'Click me',
    onClick: vi.fn(),
  },
  withClassName: {
    children: 'Styled',
    className: 'custom-class',
  },
  asChild: {
    children: <a href="/link">Link Button</a>,
    asChild: true,
  },
}

// ============================================================================
// Card Component Props
// ============================================================================

export const cardPropsFixtures = {
  default: {
    children: 'Card content',
  },
  withHeader: {
    children: (
      <>
        <div data-slot="card-header">Header</div>
        <div data-slot="card-content">Content</div>
      </>
    ),
  },
  withTitle: {
    children: (
      <>
        <div data-slot="card-header">
          <div data-slot="card-title">Card Title</div>
        </div>
        <div data-slot="card-content">Content</div>
      </>
    ),
  },
  withDescription: {
    children: (
      <>
        <div data-slot="card-header">
          <div data-slot="card-title">Title</div>
          <div data-slot="card-description">Description text</div>
        </div>
        <div data-slot="card-content">Content</div>
      </>
    ),
  },
  withFooter: {
    children: (
      <>
        <div data-slot="card-content">Content</div>
        <div data-slot="card-footer">Footer content</div>
      </>
    ),
  },
  withAction: {
    children: (
      <>
        <div data-slot="card-header">
          <div data-slot="card-title">Title</div>
          <div data-slot="card-action">Action</div>
        </div>
        <div data-slot="card-content">Content</div>
      </>
    ),
  },
  fullCard: {
    children: (
      <>
        <div data-slot="card-header">
          <div data-slot="card-title">Full Card Title</div>
          <div data-slot="card-description">Full card description</div>
          <div data-slot="card-action">Action</div>
        </div>
        <div data-slot="card-content">Card content goes here</div>
        <div data-slot="card-footer">Footer content</div>
      </>
    ),
  },
  withClassName: {
    children: 'Styled card',
    className: 'custom-card-class',
  },
}

// ============================================================================
// Dialog Component Props
// ============================================================================

export const dialogPropsFixtures = {
  default: {
    open: true,
    children: (
      <>
        <div data-slot="dialog-content">
          <div data-slot="dialog-header">
            <div data-slot="dialog-title">Dialog Title</div>
          </div>
          <div data-slot="dialog-description">Dialog description</div>
        </div>
      </>
    ),
  },
  withFooter: {
    open: true,
    children: (
      <>
        <div data-slot="dialog-content">
          <div data-slot="dialog-header">
            <div data-slot="dialog-title">Title</div>
          </div>
          <div data-slot="dialog-description">Description</div>
          <div data-slot="dialog-footer">
            <button>Cancel</button>
            <button>Confirm</button>
          </div>
        </div>
      </>
    ),
  },
  withOnOpenChange: {
    open: true,
    onOpenChange: vi.fn(),
    children: (
      <>
        <div data-slot="dialog-content">
          <div data-slot="dialog-title">Title</div>
        </div>
      </>
    ),
  },
  withClassName: {
    open: true,
    children: (
      <>
        <div data-slot="dialog-content" className="custom-dialog">
          <div data-slot="dialog-title">Styled Dialog</div>
        </div>
      </>
    ),
  },
}

// ============================================================================
// Dropdown Menu Component Props
// ============================================================================

export const dropdownMenuPropsFixtures = {
  default: {
    children: (
      <>
        <button data-slot="dropdown-menu-trigger">Open Menu</button>
        <div data-slot="dropdown-menu-content">
          <div data-slot="dropdown-menu-item">Item 1</div>
          <div data-slot="dropdown-menu-item">Item 2</div>
          <div data-slot="dropdown-menu-item">Item 3</div>
        </div>
      </>
    ),
  },
  withLabel: {
    children: (
      <>
        <button data-slot="dropdown-menu-trigger">Menu</button>
        <div data-slot="dropdown-menu-content">
          <div data-slot="dropdown-menu-label">Menu Label</div>
          <div data-slot="dropdown-menu-item">Item 1</div>
          <div data-slot="dropdown-menu-item">Item 2</div>
        </div>
      </>
    ),
  },
  withSeparator: {
    children: (
      <>
        <button data-slot="dropdown-menu-trigger">Menu</button>
        <div data-slot="dropdown-menu-content">
          <div data-slot="dropdown-menu-item">Item 1</div>
          <div data-slot="dropdown-menu-separator" />
          <div data-slot="dropdown-menu-item">Item 2</div>
        </div>
      </>
    ),
  },
  withCheckboxItem: {
    children: (
      <>
        <button data-slot="dropdown-menu-trigger">Menu</button>
        <div data-slot="dropdown-menu-content">
          <div data-slot="dropdown-menu-checkbox-item" checked={true}>
            Checked Item
          </div>
          <div data-slot="dropdown-menu-checkbox-item" checked={false}>
            Unchecked Item
          </div>
        </div>
      </>
    ),
  },
  withRadioItem: {
    children: (
      <>
        <button data-slot="dropdown-menu-trigger">Menu</button>
        <div data-slot="dropdown-menu-content">
          <div data-slot="dropdown-menu-radio-group">
            <div data-slot="dropdown-menu-radio-item" value="option1">
              Option 1
            </div>
            <div data-slot="dropdown-menu-radio-item" value="option2">
              Option 2
            </div>
          </div>
        </div>
      </>
    ),
  },
  withShortcut: {
    children: (
      <>
        <button data-slot="dropdown-menu-trigger">Menu</button>
        <div data-slot="dropdown-menu-content">
          <div data-slot="dropdown-menu-item">
            Item
            <span data-slot="dropdown-menu-shortcut">⌘K</span>
          </div>
        </div>
      </>
    ),
  },
  withSubmenu: {
    children: (
      <>
        <button data-slot="dropdown-menu-trigger">Menu</button>
        <div data-slot="dropdown-menu-content">
          <div data-slot="dropdown-menu-sub">
            <div data-slot="dropdown-menu-sub-trigger">Submenu</div>
            <div data-slot="dropdown-menu-sub-content">
              <div data-slot="dropdown-menu-item">Sub Item 1</div>
              <div data-slot="dropdown-menu-item">Sub Item 2</div>
            </div>
          </div>
        </div>
      </>
    ),
  },
}

// ============================================================================
// Input Component Props
// ============================================================================

export const inputTypes = [
  'text',
  'password',
  'email',
  'number',
  'tel',
  'url',
  'search',
  'date',
  'time',
  'datetime-local',
] as const

export const inputPropsFixtures = {
  default: {
    placeholder: 'Enter text',
  },
  withType: (type: typeof inputTypes[number]) => ({
    type,
    placeholder: `Enter ${type}`,
  }),
  withValue: {
    value: 'Test value',
    placeholder: 'Enter text',
  },
  disabled: {
    disabled: true,
    placeholder: 'Disabled input',
  },
  withClassName: {
    className: 'custom-input',
    placeholder: 'Styled input',
  },
  withOnChange: {
    onChange: vi.fn(),
    placeholder: 'Type here',
  },
  withOnFocus: {
    onFocus: vi.fn(),
    placeholder: 'Focus me',
  },
  withOnBlur: {
    onBlur: vi.fn(),
    placeholder: 'Blur me',
  },
  withRequired: {
    required: true,
    placeholder: 'Required field',
  },
  withMinMaxLength: {
    minLength: 3,
    maxLength: 20,
    placeholder: '3-20 characters',
  },
}

// ============================================================================
// Label Component Props
// ============================================================================

export const labelPropsFixtures = {
  default: {
    children: 'Label text',
  },
  withHtmlFor: {
    htmlFor: 'input-id',
    children: 'Input Label',
  },
  withClassName: {
    className: 'custom-label',
    children: 'Styled Label',
  },
  withDisabled: {
    disabled: true,
    children: 'Disabled Label',
  },
}

// ============================================================================
// Select Component Props
// ============================================================================

export const selectPropsFixtures = {
  default: {
    children: (
      <>
        <div data-slot="select-trigger">
          <span data-slot="select-value">Select an option</span>
        </div>
        <div data-slot="select-content">
          <div data-slot="select-item" value="option1">
            Option 1
          </div>
          <div data-slot="select-item" value="option2">
            Option 2
          </div>
          <div data-slot="select-item" value="option3">
            Option 3
          </div>
        </div>
      </>
    ),
  },
  withDefaultValue: {
    defaultValue: 'option1',
    children: (
      <>
        <div data-slot="select-trigger">
          <span data-slot="select-value">Select an option</span>
        </div>
        <div data-slot="select-content">
          <div data-slot="select-item" value="option1">
            Option 1
          </div>
          <div data-slot="select-item" value="option2">
            Option 2
          </div>
        </div>
      </>
    ),
  },
  withLabel: {
    children: (
      <>
        <div data-slot="select-label">Select Label</div>
        <div data-slot="select-trigger">
          <span data-slot="select-value">Select an option</span>
        </div>
        <div data-slot="select-content">
          <div data-slot="select-item" value="option1">
            Option 1
          </div>
        </div>
      </>
    ),
  },
  withSeparator: {
    children: (
      <>
        <div data-slot="select-trigger">
          <span data-slot="select-value">Select</span>
        </div>
        <div data-slot="select-content">
          <div data-slot="select-item" value="group1-1">
            Group 1 - Item 1
          </div>
          <div data-slot="select-item" value="group1-2">
            Group 1 - Item 2
          </div>
          <div data-slot="select-separator" />
          <div data-slot="select-item" value="group2-1">
            Group 2 - Item 1
          </div>
        </div>
      </>
    ),
  },
  withDisabledItem: {
    children: (
      <>
        <div data-slot="select-trigger">
          <span data-slot="select-value">Select</span>
        </div>
        <div data-slot="select-content">
          <div data-slot="select-item" value="option1">
            Option 1
          </div>
          <div data-slot="select-item" value="option2" disabled>
            Disabled Option
          </div>
        </div>
      </>
    ),
  },
  withOnValueChange: {
    onValueChange: vi.fn(),
    children: (
      <>
        <div data-slot="select-trigger">
          <span data-slot="select-value">Select</span>
        </div>
        <div data-slot="select-content">
          <div data-slot="select-item" value="option1">
            Option 1
          </div>
        </div>
      </>
    ),
  },
  disabled: {
    disabled: true,
    children: (
      <>
        <div data-slot="select-trigger">
          <span data-slot="select-value">Disabled Select</span>
        </div>
        <div data-slot="select-content">
          <div data-slot="select-item" value="option1">
            Option 1
          </div>
        </div>
      </>
    ),
  },
}

// ============================================================================
// Tabs Component Props
// ============================================================================

export const tabsPropsFixtures = {
  default: {
    defaultValue: 'tab1',
    children: (
      <>
        <div data-slot="tabs-list">
          <div data-slot="tabs-trigger" value="tab1">
            Tab 1
          </div>
          <div data-slot="tabs-trigger" value="tab2">
            Tab 2
          </div>
        </div>
        <div data-slot="tabs-content" value="tab1">
          Content 1
        </div>
        <div data-slot="tabs-content" value="tab2">
          Content 2
        </div>
      </>
    ),
  },
  withMultipleTabs: {
    defaultValue: 'tab1',
    children: (
      <>
        <div data-slot="tabs-list">
          <div data-slot="tabs-trigger" value="tab1">
            Tab 1
          </div>
          <div data-slot="tabs-trigger" value="tab2">
            Tab 2
          </div>
          <div data-slot="tabs-trigger" value="tab3">
            Tab 3
          </div>
          <div data-slot="tabs-trigger" value="tab4">
            Tab 4
          </div>
        </div>
        <div data-slot="tabs-content" value="tab1">
          Content 1
        </div>
        <div data-slot="tabs-content" value="tab2">
          Content 2
        </div>
        <div data-slot="tabs-content" value="tab3">
          Content 3
        </div>
        <div data-slot="tabs-content" value="tab4">
          Content 4
        </div>
      </>
    ),
  },
  withOnValueChange: {
    defaultValue: 'tab1',
    onValueChange: vi.fn(),
    children: (
      <>
        <div data-slot="tabs-list">
          <div data-slot="tabs-trigger" value="tab1">
            Tab 1
          </div>
          <div data-slot="tabs-trigger" value="tab2">
            Tab 2
          </div>
        </div>
        <div data-slot="tabs-content" value="tab1">
          Content 1
        </div>
        <div data-slot="tabs-content" value="tab2">
          Content 2
        </div>
      </>
    ),
  },
  withDisabledTab: {
    defaultValue: 'tab1',
    children: (
      <>
        <div data-slot="tabs-list">
          <div data-slot="tabs-trigger" value="tab1">
            Tab 1
          </div>
          <div data-slot="tabs-trigger" value="tab2" disabled>
            Disabled Tab
          </div>
        </div>
        <div data-slot="tabs-content" value="tab1">
          Content 1
        </div>
        <div data-slot="tabs-content" value="tab2">
          Content 2
        </div>
      </>
    ),
  },
  withClassName: {
    defaultValue: 'tab1',
    children: (
      <>
        <div data-slot="tabs-list" className="custom-tabs-list">
          <div data-slot="tabs-trigger" value="tab1">
            Tab 1
          </div>
          <div data-slot="tabs-trigger" value="tab2">
            Tab 2
          </div>
        </div>
        <div data-slot="tabs-content" value="tab1" className="custom-content">
          Content 1
        </div>
      </>
    ),
  },
}

// ============================================================================
// Common Test Data
// ============================================================================

export const commonTestData = {
  ariaLabels: {
    button: 'Submit button',
    input: 'Email input',
    dialog: 'Confirmation dialog',
    menu: 'Actions menu',
  },
  testIds: {
    button: 'test-button',
    input: 'test-input',
    card: 'test-card',
    dialog: 'test-dialog',
  },
  classNames: {
    primary: 'bg-primary text-primary-foreground',
    destructive: 'bg-destructive text-white',
    outline: 'border border-input',
  },
}
