/**
 * Test Utilities
 * 
 * This file contains reusable utility functions for testing UI components.
 */

import { render, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'

// ============================================================================
// Custom Render Function
// ============================================================================

/**
 * Custom render function that includes any global providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { ...options })
}

// ============================================================================
// Accessibility Helpers
// ============================================================================

/**
 * Check if an element has proper ARIA attributes
 */
export function checkAriaAttributes(element: HTMLElement, attributes: Record<string, string>) {
  Object.entries(attributes).forEach(([attr, expectedValue]) => {
    const actualValue = element.getAttribute(attr)
    expect(actualValue).toBe(expectedValue)
  })
}

/**
 * Check if an element has proper ARIA role
 */
export function checkAriaRole(element: HTMLElement, role: string) {
  expect(element).toHaveAttribute('role', role)
}

/**
 * Check if an element is keyboard accessible
 */
export function checkKeyboardAccessible(element: HTMLElement) {
  expect(element).toHaveAttribute('tabindex')
  expect(element.getAttribute('tabindex')).not.toBe('-1')
}

// ============================================================================
// Event Helpers
// ============================================================================

/**
 * Create a mock event handler
 */
export function createMockEventHandler<T = any>() {
  return {
    fn: vi.fn<T, any>(),
    expectCalled: (times = 1) => {
      expect(vi.mocked(vi.fn())).toHaveBeenCalledTimes(times)
    },
    expectCalledWith: (...args: any[]) => {
      expect(vi.mocked(vi.fn())).toHaveBeenCalledWith(...args)
    },
  }
}

/**
 * Wait for a condition to be true
 */
export async function waitForCondition(
  condition: () => boolean,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    if (condition()) {
      return
    }
    await new Promise(resolve => setTimeout(resolve, interval))
  }
  
  throw new Error(`Condition not met within ${timeout}ms`)
}

// ============================================================================
// Component State Helpers
// ============================================================================

/**
 * Check if a component is in a disabled state
 */
export function checkDisabledState(element: HTMLElement) {
  expect(element).toHaveAttribute('disabled')
  expect(element).toHaveClass('disabled', 'opacity-50')
}

/**
 * Check if a component is in a loading state
 */
export function checkLoadingState(element: HTMLElement) {
  expect(element).toHaveAttribute('aria-busy', 'true')
}

/**
 * Check if a component has focus
 */
export function checkHasFocus(element: HTMLElement) {
  expect(element).toBe(document.activeElement)
}

// ============================================================================
// Form Helpers
// ============================================================================

/**
 * Fill a form input with a value
 */
export async function fillInput(input: HTMLElement, value: string) {
  const user = userEvent.setup()
  await user.clear(input)
  await user.type(input, value)
}

/**
 * Select an option from a select element
 */
export async function selectOption(select: HTMLElement, value: string) {
  const user = userEvent.setup()
  await user.selectOptions(select, value)
}

/**
 * Check a checkbox
 */
export async function checkCheckbox(checkbox: HTMLInputElement) {
  const user = userEvent.setup()
  await user.click(checkbox)
  expect(checkbox).toBeChecked()
}

/**
 * Uncheck a checkbox
 */
export async function uncheckCheckbox(checkbox: HTMLInputElement) {
  const user = userEvent.setup()
  await user.click(checkbox)
  expect(checkbox).not.toBeChecked()
}

// ============================================================================
// Assertion Helpers
// ============================================================================

/**
 * Assert that an element has specific classes
 */
export function assertHasClasses(element: HTMLElement, classes: string[]) {
  classes.forEach(className => {
    expect(element).toHaveClass(className)
  })
}

/**
 * Assert that an element does not have specific classes
 */
export function assertDoesNotHaveClasses(element: HTMLElement, classes: string[]) {
  classes.forEach(className => {
    expect(element).not.toHaveClass(className)
  })
}

/**
 * Assert that an element has specific data attributes
 */
export function assertHasDataAttributes(
  element: HTMLElement,
  attributes: Record<string, string>
) {
  Object.entries(attributes).forEach(([key, value]) => {
    expect(element).toHaveAttribute(`data-${key}`, value)
  })
}

// ============================================================================
// Mock Helpers
// ============================================================================

/**
 * Create a mock ref
 */
export function createMockRef<T = HTMLElement>() {
  return {
    current: null,
  } as React.RefObject<T>
}

/**
 * Mock a component
 */
export function mockComponent(componentName: string) {
  return vi.fn(({ children, ...props }) => (
    <div data-testid={`mock-${componentName}`} {...props}>
      {children}
    </div>
  ))
}

// ============================================================================
// Performance Helpers
// ============================================================================

/**
 * Measure render time
 */
export async function measureRenderTime(
  renderFn: () => void
): Promise<number> {
  const start = performance.now()
  renderFn()
  const end = performance.now()
  return end - start
}

/**
 * Assert that render time is within threshold
 */
export function assertRenderTimeWithinThreshold(
  renderTime: number,
  threshold: number
) {
  expect(renderTime).toBeLessThan(threshold)
}

// ============================================================================
// Responsive Helpers
// ============================================================================

/**
 * Set viewport size
 */
export function setViewportSize(width: number, height: number) {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  })
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  })
  window.dispatchEvent(new Event('resize'))
}

/**
 * Reset viewport size to default
 */
export function resetViewportSize() {
  setViewportSize(1024, 768)
}

// ============================================================================
// Animation Helpers
// ============================================================================

/**
 * Wait for animation to complete
 */
export async function waitForAnimation(element: HTMLElement, timeout = 1000) {
  return new Promise<void>((resolve, reject) => {
    const startTime = Date.now()
    
    const checkAnimation = () => {
      if (Date.now() - startTime > timeout) {
        reject(new Error('Animation timeout'))
        return
      }
      
      const computedStyle = window.getComputedStyle(element)
      const isAnimating =
        computedStyle.animationName !== 'none' ||
        computedStyle.transitionDuration !== '0s'
      
      if (!isAnimating) {
        resolve()
      } else {
        requestAnimationFrame(checkAnimation)
      }
    }
    
    checkAnimation()
  })
}

// ============================================================================
// Scroll Helpers
// ============================================================================

/**
 * Scroll an element into view
 */
export async function scrollIntoView(element: HTMLElement) {
  element.scrollIntoView({ behavior: 'smooth', block: 'center' })
  await new Promise(resolve => setTimeout(resolve, 100))
}

/**
 * Check if an element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
  const rect = element.getBoundingClientRect()
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
