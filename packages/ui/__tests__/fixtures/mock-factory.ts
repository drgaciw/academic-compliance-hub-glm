/**
 * Mock Factories
 *
 * This file provides factory functions for creating mock data and objects
 * commonly used in tests across the UI package.
 */

// ============================================================================
// User Mocks
// ============================================================================

export function createMockUser(overrides: Partial<any> = {}) {
  return {
    id: "user-123",
    email: "test@example.com",
    name: "Test User",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

// ============================================================================
// Form Mocks
// ============================================================================

export function createMockFormData(overrides: Record<string, any> = {}) {
  return {
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "(555) 123-4567",
    address: "",
    city: "",
    state: "",
    zip: "",
    ...overrides,
  };
}

// ============================================================================
// Component Props Mocks
// ============================================================================

export function createMockButtonProps(
  overrides: Partial<React.ButtonHTMLAttributes<HTMLButtonElement>> = {},
) {
  return {
    type: "button" as const,
    disabled: false,
    children: "Click me",
    onClick: vi.fn(),
    ...overrides,
  };
}

export function createMockInputProps(
  overrides: Partial<React.InputHTMLAttributes<HTMLInputElement>> = {},
) {
  return {
    type: "text",
    placeholder: "Enter text",
    disabled: false,
    required: false,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    ...overrides,
  };
}

export function createMockSelectProps(overrides: any = {}) {
  return {
    disabled: false,
    required: false,
    onChange: vi.fn(),
    ...overrides,
  };
}

// ============================================================================
// Event Mocks
// ============================================================================

export function createMockEvent(type: string = "click") {
  return {
    type,
    target: { value: "" },
    currentTarget: { value: "" },
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    bubbles: true,
    cancelable: true,
    timeStampt: Date.now(),
  } as any;
}

export function createMockKeyboardEvent(
  key: string,
  overrides: Partial<KeyboardEvent> = {},
) {
  return {
    key,
    code: key,
    keyCode: key.charCodeAt(0),
    charCode: key.charCodeAt(0),
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides,
  } as any;
}

export function createMockMouseEvent(overrides: Partial<MouseEvent> = {}) {
  return {
    clientX: 0,
    clientY: 0,
    pageX: 0,
    pageY: 0,
    screenX: 0,
    screenY: 0,
    button: 0,
    buttons: 0,
    ctrlKey: false,
    shiftKey: false,
    altKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides,
  } as any;
}

// ============================================================================
// Response Mocks
// ============================================================================

export function createMockResponse(
  data: any,
  status: number = 200,
  statusText: string = "OK",
) {
  return {
    data,
    status,
    statusText,
    headers: {},
    config: {},
  };
}

export function createMockErrorResponse(
  message: string,
  status: number = 400,
  statusText: string = "Bad Request",
) {
  return {
    data: { error: message },
    status,
    statusText,
    headers: {},
    config: {},
  };
}

// ============================================================================
// Async Mocks
// ============================================================================

export function createMockAsync<T>(data: T, delay: number = 0): Promise<T> {
  return new Promise((resolve) => {
    setTimeout(() => resolve(data), delay);
  });
}

export function createMockAsyncError(
  error: Error,
  delay: number = 0,
): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(error), delay);
  });
}

// ============================================================================
// Router Mocks
// ============================================================================

export function createMockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    pathname: "/",
    query: {},
    asPath: "/",
  };
}

// ============================================================================
// Ref Mocks
// ============================================================================

export function createMockRef<T = HTMLElement>() {
  return {
    current: null as T | null,
  };
}

// ============================================================================
// Data Table Mocks
// ============================================================================

export function createMockData(columns: number = 5, rows: number = 10) {
  const data = [];
  for (let i = 0; i < rows; i++) {
    const row: Record<string, any> = { id: i };
    for (let j = 0; j < columns; j++) {
      row[`column${j}`] = `Data ${i}-${j}`;
    }
    data.push(row);
  }
  return data;
}

export function createMockColumns(count: number = 5) {
  return Array.from({ length: count }, (_, i) => ({
    id: `column${i}`,
    header: `Column ${i}`,
    accessorKey: `column${i}`,
  }));
}

// ============================================================================
// Pagination Mocks
// ============================================================================

export function createMockPagination() {
  return {
    page: 1,
    pageSize: 10,
    total: 100,
    totalPages: 10,
    hasNext: true,
    hasPrev: false,
    onNext: vi.fn(),
    onPrev: vi.fn(),
    onPageChange: vi.fn(),
    onPageSizeChange: vi.fn(),
  };
}

// ============================================================================
// Dialog Mocks
// ============================================================================

export function createMockDialogProps(overrides: any = {}) {
  return {
    open: true,
    onOpenChange: vi.fn(),
    ...overrides,
  };
}

// ============================================================================
// Toast/Notification Mocks
// ============================================================================

export function createMockToast() {
  return {
    id: "toast-123",
    title: "Success",
    description: "Operation completed successfully",
    variant: "default",
    duration: 5000,
  };
}

// ============================================================================
// Progress Mocks
// ============================================================================

export function createMockProgressProps(overrides: any = {}) {
  return {
    value: 50,
    max: 100,
    min: 0,
    ...overrides,
  };
}

// ============================================================================
// File Upload Mocks
// ============================================================================

export function createMockFile(
  name: string = "test.txt",
  size: number = 1024,
): File {
  const file = new File(["test content"], name, { type: "text/plain" });
  Object.defineProperty(file, "size", { value: size });
  return file;
}

export function createMockFileList(files: File[] = []): FileList {
  const fileList = {
    length: files.length,
    item: (index: number) => files[index],
    [Symbol.iterator]: function* () {
      for (const file of files) {
        yield file;
      }
    },
  } as any;
  return fileList;
}

// ============================================================================
// Date/Time Mocks
// ============================================================================

export function createMockDate(date: string | Date = new Date()): Date {
  return typeof date === "string" ? new Date(date) : date;
}

export function createMockDateRange() {
  return {
    from: new Date("2024-01-01"),
    to: new Date("2024-12-31"),
  };
}

// ============================================================================
// Search/Filter Mocks
// ============================================================================

export function createMockSearchParams() {
  return new URLSearchParams({
    page: "1",
    limit: "10",
    sort: "createdAt",
    order: "desc",
    q: "",
  });
}

export function createMockFilters() {
  return {
    status: "all",
    category: "all",
    dateRange: null,
    search: "",
  };
}

// ============================================================================
// Badge Mocks
// ============================================================================

export function createMockBadgeProps(overrides: any = {}) {
  return {
    variant: "default",
    children: "Badge",
    ...overrides,
  };
}

// ============================================================================
// Tabs Mocks
// ============================================================================

export function createMockTabsProps(overrides: any = {}) {
  return {
    defaultValue: "tab-1",
    ...overrides,
  };
}

export function createMockTabList(count: number = 3) {
  return Array.from({ length: count }, (_, i) => ({
    value: `tab-${i}`,
    label: `Tab ${i + 1}`,
  }));
}

// ============================================================================
// Select Mocks
// ============================================================================

export function createMockSelectOptions(count: number = 5) {
  return Array.from({ length: count }, (_, i) => ({
    value: `option-${i}`,
    label: `Option ${i + 1}`,
  }));
}

export function createMockSelectProps(overrides: any = {}) {
  return {
    options: createMockSelectOptions(),
    value: "option-0",
    onValueChange: vi.fn(),
    ...overrides,
  };
}

// ============================================================================
// Checkbox/Radio Mocks
// ============================================================================

export function createMockCheckboxProps(overrides: any = {}) {
  return {
    checked: false,
    onCheckedChange: vi.fn(),
    disabled: false,
    ...overrides,
  };
}

export function createMockRadioGroupProps(overrides: any = {}) {
  return {
    defaultValue: "option-1",
    onValueChange: vi.fn(),
    ...overrides,
  };
}

// ============================================================================
// Skeleton/Loading Mocks
// ============================================================================

export function createMockSkeletonProps(overrides: any = {}) {
  return {
    className: "",
    ...overrides,
  };
}
