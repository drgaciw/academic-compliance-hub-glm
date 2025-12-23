# shadcn/ui Current Usage Documentation

**Date:** 2025-12-23  
**Migration Phase:** Phase 1 - Preparation  
**Target Version:** shadcn/ui v2

## Overview

This document catalogs the current shadcn/ui component usage across the Athletic Academics Hub monorepo before migrating to shadcn/ui v2.

## Component Inventory

### Available Components in `packages/ui`

The shared UI package (`@aah/ui`) contains the following shadcn/ui components:

| Component | Location | Sub-components |
|-----------|----------|----------------|
| **Button** | `packages/ui/src/components/button.tsx` | - |
| **Card** | `packages/ui/src/components/card.tsx` | CardHeader, CardTitle, CardDescription, CardContent, CardFooter |
| **Dialog** | `packages/ui/src/components/dialog.tsx` | DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose, DialogOverlay |
| **DropdownMenu** | `packages/ui/src/components/dropdown-menu.tsx` | DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup |
| **Input** | `packages/ui/src/components/input.tsx` | - |
| **Label** | `packages/ui/src/components/label.tsx` | - |
| **Select** | `packages/ui/src/components/select.tsx` | SelectTrigger, SelectContent, SelectValue, SelectItem, SelectLabel, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton, SelectGroup |
| **Tabs** | `packages/ui/src/components/tabs.tsx` | TabsList, TabsTrigger, TabsContent |

## Component Details

### Button

**File:** `packages/ui/src/components/button.tsx`

**Variants:**
- `default` - Primary button style
- `destructive` - Destructive/danger action style
- `outline` - Outlined button style
- `secondary` - Secondary action style
- `ghost` - Ghost/hover style
- `link` - Link-style button

**Sizes:**
- `default` - h-10 px-4 py-2
- `sm` - h-9 rounded-md px-3
- `lg` - h-11 rounded-md px-8
- `icon` - h-10 w-10 (square)

**Props:**
- `variant?: ButtonVariants['variant']`
- `size?: ButtonVariants['size']`
- `asChild?: boolean` - For composition with Radix UI Slot
- All standard HTML button attributes

**Dependencies:**
- `@radix-ui/react-slot`
- `class-variance-authority`

**Current Usage:**
- **apps/admin**: Local copy exists at `apps/admin/src/components/ui/button.tsx` but not currently used in pages
- **packages/ui**: Shared component available but not actively used in any app pages

### Card

**File:** `packages/ui/src/components/card.tsx`

**Sub-components:**
- `Card` - Container with border, rounded corners, shadow
- `CardHeader` - Flex column with spacing
- `CardTitle` - H3 element with text-2xl font-semibold
- `CardDescription` - Small muted text
- `CardContent` - Content area with padding
- `CardFooter` - Footer area for actions

**Current Usage:**
- No active usage found in any app pages

### Dialog

**File:** `packages/ui/src/components/dialog.tsx`

**Sub-components:**
- `Dialog` - Root component (Radix DialogPrimitive.Root)
- `DialogTrigger` - Trigger button
- `DialogPortal` - Portal for rendering
- `DialogOverlay` - Backdrop overlay
- `DialogContent` - Main dialog content with close button
- `DialogHeader` - Header container
- `DialogFooter` - Footer with action buttons
- `DialogTitle` - Dialog title
- `DialogDescription` - Dialog description text
- `DialogClose` - Close button component

**Dependencies:**
- `@radix-ui/react-dialog`
- `lucide-react` (X icon)

**Current Usage:**
- No active usage found in any app pages

### DropdownMenu

**File:** `packages/ui/src/components/dropdown-menu.tsx`

**Sub-components:**
- `DropdownMenu` - Root component
- `DropdownMenuTrigger` - Trigger button
- `DropdownMenuContent` - Menu content container
- `DropdownMenuItem` - Menu item
- `DropdownMenuCheckboxItem` - Checkbox menu item
- `DropdownMenuRadioItem` - Radio menu item
- `DropdownMenuLabel` - Menu label
- `DropdownMenuSeparator` - Horizontal separator
- `DropdownMenuShortcut` - Keyboard shortcut display
- `DropdownMenuGroup` - Menu item grouping
- `DropdownMenuPortal` - Portal for rendering
- `DropdownMenuSub` - Nested submenu
- `DropdownMenuSubContent` - Submenu content
- `DropdownMenuSubTrigger` - Submenu trigger
- `DropdownMenuRadioGroup` - Radio group for menu items

**Props:**
- `DropdownMenuItem.inset?: boolean` - Adds left padding
- `DropdownMenuContent.sideOffset?: number` - Default 4
- `DropdownMenuLabel.inset?: boolean` - Adds left padding

**Dependencies:**
- `@radix-ui/react-dropdown-menu`
- `lucide-react` (Check, ChevronRight, Circle icons)

**Current Usage:**
- No active usage found in any app pages

### Input

**File:** `packages/ui/src/components/input.tsx`

**Props:**
- Extends all standard HTML input attributes
- Default type is text

**Styling:**
- Height: h-10
- Border with focus ring
- Rounded corners
- Disabled state styling

**Current Usage:**
- No active usage found in any app pages

### Label

**File:** `packages/ui/src/components/label.tsx`

**Props:**
- Extends Radix Label props
- `VariantProps<typeof labelVariants>`

**Styling:**
- Text-sm font-medium
- Peer-disabled states for form integration

**Dependencies:**
- `@radix-ui/react-label`
- `class-variance-authority`

**Current Usage:**
- No active usage found in any app pages

### Select

**File:** `packages/ui/src/components/select.tsx`

**Sub-components:**
- `Select` - Root component
- `SelectTrigger` - Select button with dropdown icon
- `SelectContent` - Dropdown content container
- `SelectValue` - Display value
- `SelectItem` - Select option
- `SelectLabel` - Label for select group
- `SelectSeparator` - Horizontal separator
- `SelectScrollUpButton` - Scroll up button for long lists
- `SelectScrollDownButton` - Scroll down button for long lists
- `SelectGroup` - Group for items

**Props:**
- `SelectContent.position?: 'popper' | 'item-aligned'` - Default 'popper'

**Dependencies:**
- `@radix-ui/react-select`
- `lucide-react` (Check, ChevronDown, ChevronUp icons)

**Current Usage:**
- No active usage found in any app pages

### Tabs

**File:** `packages/ui/src/components/tabs.tsx`

**Sub-components:**
- `Tabs` - Root component
- `TabsList` - Tab list container
- `TabsTrigger` - Individual tab button
- `TabsContent` - Tab content panel

**Styling:**
- TabsList: Muted background with rounded corners
- TabsTrigger: Active state with background and shadow
- TabsContent: Basic content container

**Dependencies:**
- `@radix-ui/react-tabs`

**Current Usage:**
- No active usage found in any app pages

## App-Specific Usage

### apps/admin

**Status:** Partially configured

**Configuration:**
- Has `components.json` configured for shadcn/ui
- Style: "new-york"
- RSC: true
- CSS Variables: true
- Base Color: neutral
- Icon Library: lucide
- Aliases configured for `@/components/ui`

**Components:**
- Local copy of `Button` at `apps/admin/src/components/ui/button.tsx`
- Local copy of `utils.ts` at `apps/admin/src/lib/utils.ts`

**Usage in Pages:**
- `app/page.tsx`: No shadcn components used
- `app/layout.tsx`: No shadcn components used

**Dependencies:**
- `@aah/ui` (workspace package)
- `@radix-ui/react-slot`
- `class-variance-authority`
- `clsx`
- `lucide-react`
- `tailwind-merge`
- `tailwindcss-animate`

### apps/main

**Status:** Not configured

**Configuration:**
- No `components.json` found
- No local UI components

**Usage in Pages:**
- No shadcn components used

**Dependencies:**
- Does not import `@aah/ui`

### apps/student

**Status:** Not configured

**Configuration:**
- No `components.json` found
- No local UI components

**Usage in Pages:**
- No shadcn components used

**Dependencies:**
- Does not import `@aah/ui`

## Shared UI Package

### packages/ui

**Package:** `@aah/ui`  
**Version:** 2.0.0

**Dependencies:**
```json
{
  "@radix-ui/react-slot": "^1.0.2",
  "@radix-ui/react-dialog": "^1.0.5",
  "@radix-ui/react-dropdown-menu": "^2.0.6",
  "@radix-ui/react-label": "^2.0.2",
  "@radix-ui/react-select": "^2.0.0",
  "@radix-ui/react-tabs": "^1.0.4",
  "class-variance-authority": "^0.7.0",
  "clsx": "^2.0.0",
  "tailwind-merge": "^2.2.0",
  "lucide-react": "^0.303.0"
}
```

**Exported Components:**
All 8 components are exported from `src/index.ts`

## Custom Props and Modifications

### Button
- No custom modifications beyond standard shadcn/ui v1 implementation

### Card
- No custom modifications beyond standard shadcn/ui v1 implementation

### Dialog
- No custom modifications beyond standard shadcn/ui v1 implementation
- Uses lucide-react X icon for close button

### DropdownMenu
- No custom modifications beyond standard shadcn/ui v1 implementation
- Uses lucide-react icons (Check, ChevronRight, Circle)

### Input
- No custom modifications beyond standard shadcn/ui v1 implementation

### Label
- No custom modifications beyond standard shadcn/ui v1 implementation

### Select
- No custom modifications beyond standard shadcn/ui v1 implementation
- Uses lucide-react icons (Check, ChevronDown, ChevronUp)

### Tabs
- No custom modifications beyond standard shadcn/ui v1 implementation

## Styling Extensions

All components use the standard shadcn/ui v1 styling approach:
- Tailwind CSS classes
- CSS variables for theming
- `cn()` utility for className merging
- Radix UI primitives for accessibility

## Key Findings

1. **Low Component Usage**: None of the 8 available shadcn/ui components are actively used in any app pages
2. **Shared Package Available**: `@aah/ui` package contains all components but is not imported by apps
3. **Partial Admin Setup**: Only the admin app has shadcn/ui configuration and local Button component
4. **No Custom Modifications**: All components are standard shadcn/ui v1 implementations
5. **Consistent Dependencies**: All Radix UI versions are compatible with v1

## Migration Considerations

### Potential Breaking Changes to Monitor

1. **Radix UI Updates**: Check for API changes in Radix UI primitives between versions
2. **Class Variants**: Verify CVA patterns are compatible
3. **Tailwind Config**: Ensure theme variables match v2 requirements
4. **Component Props**: Check for new required props or removed props
5. **Icon Library**: Verify lucide-react version compatibility

### Components to Test Post-Migration

- Button variants and sizes
- Dialog overlay and animation behavior
- DropdownMenu positioning and submenus
- Select dropdown behavior
- Tabs state management

## Next Steps

Proceed to Phase 2: Dependency Updates and Configuration Migration
