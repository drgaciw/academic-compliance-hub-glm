# shadcn/ui Update Plan

**Project:** Athletic Academics Hub (AAH)  
**Current Version:** Custom Implementation (no components.json)  
**Target Version:** shadcn/ui v2.x (latest stable)  
**Date:** 2025-12-23  

---

## Executive Summary

This document outlines a comprehensive plan to migrate the Athletic Academics Hub project from a custom shadcn/ui component implementation to the official shadcn/ui v2.x CLI-based system. The project currently uses manually implemented shadcn/ui components without a `components.json` configuration file.

---

## 1. Current Version Analysis

### 1.1 Project Structure

```
academic-compliance-hub-glm/
├── apps/
│   ├── admin/       (Next.js app - uses @aah/ui)
│   ├── main/        (Next.js app - uses @aah/ui)
│   └── student/     (Next.js app - uses @aah/ui)
├── packages/
│   └── ui/          (Shared UI components - custom shadcn implementation)
│       ├── package.json
│       └── src/
│           ├── components/
│           │   ├── button.tsx
│           │   ├── card.tsx
│           │   ├── dialog.tsx
│           │   ├── dropdown-menu.tsx
│           │   ├── input.tsx
│           │   ├── label.tsx
│           │   ├── select.tsx
│           │   └── tabs.tsx
│           └── lib/
│               └── utils.ts
```

### 1.2 Current Dependencies (packages/ui/package.json)

| Package | Current Version | Purpose |
|---------|-----------------|---------|
| react | ^18.2.0 | UI framework |
| react-dom | ^18.2.0 | React DOM renderer |
| @radix-ui/react-slot | ^1.0.2 | Slot primitive |
| @radix-ui/react-dialog | ^1.0.5 | Dialog primitive |
| @radix-ui/react-dropdown-menu | ^2.0.6 | Dropdown menu primitive |
| @radix-ui/react-label | ^2.0.2 | Label primitive |
| @radix-ui/react-select | ^2.0.0 | Select primitive |
| @radix-ui/react-tabs | ^1.0.4 | Tabs primitive |
| class-variance-authority | ^0.7.0 | Variant management |
| clsx | ^2.0.0 | Class name utilities |
| tailwind-merge | ^2.2.0 | Tailwind class merging |
| lucide-react | ^0.303.0 | Icon library |

### 1.3 Current Components Installed

1. **Button** - 6 variants (default, destructive, outline, secondary, ghost, link)
2. **Card** - Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
3. **Input** - Basic input component
4. **Label** - Label with CVA variants
5. **Dialog** - Full dialog implementation with overlay, content, header, footer, title, description
6. **Dropdown Menu** - Complete dropdown menu with all sub-components
7. **Select** - Full select component with scroll buttons, content, items
8. **Tabs** - Tabs, TabsList, TabsTrigger, TabsContent

### 1.4 Key Observations

- **No components.json**: The project does not have a shadcn/ui configuration file
- **Manual Implementation**: All components are manually implemented, likely copied from shadcn/ui examples
- **Monorepo Setup**: Uses pnpm workspace with shared UI package
- **Consistent Styling**: Uses standard shadcn/ui styling patterns (ring-offset, focus-visible, etc.)
- **Tailwind v3**: Currently using Tailwind CSS v3.4.0

---

## 2. Latest Stable Version Details

### 2.1 shadcn/ui v2.x Overview

As of December 2025, shadcn/ui v2.x is the latest stable version with the following key features:

- **CLI-based installation**: Components are installed via `npx shadcn@latest add <component>`
- **components.json**: Centralized configuration for component customization
- **Base UI v1.x**: Updated Base UI primitives
- **New Components**: Additional components like Sheet, Popover, Toast, etc.
- **Improved TypeScript**: Better type inference and support
- **Tailwind v4 Support**: Optional support for Tailwind CSS v4
- **Improved DX**: Better developer experience with CLI tools

### 2.2 Latest Base UI Versions (as of late 2025)

| Package | Latest Version |
|---------|----------------|
| @radix-ui/react-slot | ^1.1.0 |
| @radix-ui/react-dialog | ^1.1.2 |
| @radix-ui/react-dropdown-menu | ^2.1.2 |
| @radix-ui/react-label | ^2.1.0 |
| @radix-ui/react-select | ^2.1.2 |
| @radix-ui/react-tabs | ^1.1.1 |

### 2.3 Key Changes from Custom Implementation to v2.x

| Aspect | Current (Custom) | shadcn/ui v2.x |
|--------|------------------|---------------|
| Installation | Manual copy-paste | CLI-based (`npx shadcn@latest add`) |
| Configuration | None | components.json |
| Updates | Manual | CLI-based updates |
| Component Source | Custom files | Official registry |
| TypeScript Support | Basic | Enhanced with better types |
| Customization | Edit files directly | Edit files + CLI configuration |

---

## 3. Breaking Changes to Be Aware Of

### 3.1 Base UI API Changes

Some Base UI primitives may have updated APIs. Key areas to check:

1. **Dialog**: Props and event handlers may have changed
2. **Select**: The `position` prop behavior may be different
3. **Dropdown Menu**: Some sub-component APIs may have evolved

### 3.2 Class Name Patterns

The new shadcn/ui components may use slightly different class name patterns:
- `ring-offset-background` → may use different offset values
- Animation classes may have updated names
- Focus-visible styles may have changed

### 3.3 TypeScript Types

- Component props may have stricter or different TypeScript definitions
- `VariantProps` from CVA may have different signatures

### 3.4 Import Paths

- New components may use different import patterns
- Some utilities may be imported from different locations

---

## 4. Step-by-Step Update Process

### Phase 1: Preparation

#### Step 1.1: Backup Current Implementation
```bash
# Create a backup branch
git checkout -b backup/shadcn-pre-update
git add .
git commit -m "Backup: Current shadcn/ui implementation before v2 migration"
git push origin backup/shadcn-pre-update
```

#### Step 1.2: Create Feature Branch
```bash
git checkout main
git checkout -b feature/shadcn-v2-migration
```

#### Step 1.3: Document Current Component Usage
- Search for component usage across all apps
- Document any custom props or modifications
- Note any custom styling extensions

```bash
# Search for component usage in apps
grep -r "Button" apps/ --include="*.tsx" --include="*.ts"
grep -r "Card" apps/ --include="*.tsx" --include="*.ts"
grep -r "Dialog" apps/ --include="*.tsx" --include="*.ts"
# ... repeat for other components
```

### Phase 2: Initialize shadcn/ui

#### Step 2.1: Initialize shadcn/ui in the UI Package
```bash
cd packages/ui
npx shadcn@latest init
```

**Expected Configuration:**
```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/index.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils",
    "ui": "@/components",
    "lib": "@/lib",
    "hooks": "@/hooks"
  }
}
```

**Note:** Since this is a library package, we may need to adjust paths to work with the monorepo structure.

#### Step 2.2: Create Tailwind Configuration (if not exists)
The project needs a proper Tailwind config in the UI package. Create `packages/ui/tailwind.config.ts`:

```typescript
import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
```

#### Step 2.3: Create Global CSS File
Create `packages/ui/src/index.css` with shadcn/ui CSS variables:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### Phase 3: Update Dependencies

#### Step 3.1: Update packages/ui/package.json
Update to latest versions:

```json
{
  "name": "@aah/ui",
  "version": "2.1.0",
  "private": true,
  "description": "Shared UI components using Shadcn/UI",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-dialog": "^1.1.2",
    "@radix-ui/react-dropdown-menu": "^2.1.2",
    "@radix-ui/react-label": "^2.1.0",
    "@radix-ui/react-select": "^2.1.2",
    "@radix-ui/react-tabs": "^1.1.1",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.4",
    "lucide-react": "^0.462.0",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "typescript": "^5.6.3",
    "eslint": "^8.57.1",
    "tailwindcss": "^3.4.15",
    "postcss": "^8.4.49",
    "autoprefixer": "^10.4.20"
  },
  "peerDependencies": {
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  }
}
```

#### Step 3.2: Install Updated Dependencies
```bash
cd packages/ui
pnpm install
```

### Phase 4: Migrate Components

#### Step 4.1: Backup and Remove Old Components
```bash
cd packages/ui/src/components
mkdir -p old-components
mv button.tsx card.tsx dialog.tsx dropdown-menu.tsx input.tsx label.tsx select.tsx tabs.tsx old-components/
```

#### Step 4.2: Install Components via CLI
```bash
cd packages/ui

# Install all current components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add dropdown-menu
npx shadcn@latest add input
npx shadcn@latest add label
npx shadcn@latest add select
npx shadcn@latest add tabs
```

#### Step 4.3: Compare and Merge Custom Changes
For each component:
1. Compare new component with old version
2. Identify any custom modifications
3. Apply necessary customizations to new components
4. Test component behavior

**Key Areas to Check:**
- Custom variants or props
- Modified styling
- Custom event handlers
- Extended functionality

### Phase 5: Update App Configurations

#### Step 5.1: Update App Tailwind Configurations
Each app needs to import the UI package's Tailwind config.

**apps/main/tailwind.config.ts:**
```typescript
import type { Config } from "tailwindcss"
import { uiConfig } from "@aah/ui/tailwind.config"

const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  ...uiConfig.theme,
  plugins: [],
} satisfies Config

export default config
```

#### Step 5.2: Update App Global CSS
Each app needs to import the UI package's CSS.

**apps/main/app/globals.css:**
```css
@import "@aah/ui/src/index.css";

/* App-specific styles */
```

#### Step 5.3: Update App package.json Dependencies
Ensure all apps reference the updated UI package:

```json
{
  "dependencies": {
    "@aah/ui": "workspace:*",
    // ... other dependencies
  }
}
```

### Phase 6: Testing and Validation

#### Step 6.1: Type Check All Packages
```bash
# Type check UI package
cd packages/ui
pnpm type-check

# Type check all apps
cd ../../
pnpm type-check
```

#### Step 6.2: Lint All Packages
```bash
pnpm lint
```

#### Step 6.3: Build All Packages
```bash
pnpm build
```

#### Step 6.4: Manual Testing Checklist
- [ ] Test Button component with all variants
- [ ] Test Card component rendering
- [ ] Test Dialog open/close functionality
- [ ] Test Dropdown Menu navigation
- [ ] Test Input component focus states
- [ ] Test Label component
- [ ] Test Select component options
- [ ] Test Tabs component switching
- [ ] Test keyboard navigation for all components
- [ ] Test screen reader accessibility
- [ ] Test dark mode (if implemented)

#### Step 6.5: Visual Regression Testing
Compare the visual appearance of components before and after migration:
- Take screenshots of key pages
- Ensure styling matches or is improved
- Check spacing, colors, and typography

### Phase 7: Cleanup and Documentation

#### Step 7.1: Remove Backup Files
```bash
rm -rf packages/ui/src/components/old-components
```

#### Step 7.2: Update Documentation
Update relevant documentation files:
- `README.md` - Add shadcn/ui v2 information
- `docs/frontend-ui-tech-spec.md` - Update component documentation
- Create `packages/ui/README.md` with component usage examples

#### Step 7.3: Create Migration Notes
Document any breaking changes or migration notes for developers.

---

## 5. Dependencies That Need Updating

### 5.1 packages/ui/package.json Updates

| Dependency | Current | Target | Reason |
|------------|---------|--------|--------|
| react | ^18.2.0 | ^18.3.1 | Latest stable React 18 |
| react-dom | ^18.2.0 | ^18.3.1 | Latest stable React DOM |
| @radix-ui/react-slot | ^1.0.2 | ^1.1.0 | Latest Base UI |
| @radix-ui/react-dialog | ^1.0.5 | ^1.1.2 | Latest Base UI |
| @radix-ui/react-dropdown-menu | ^2.0.6 | ^2.1.2 | Latest Base UI |
| @radix-ui/react-label | ^2.0.2 | ^2.1.0 | Latest Base UI |
| @radix-ui/react-select | ^2.0.0 | ^2.1.2 | Latest Base UI |
| @radix-ui/react-tabs | ^1.0.4 | ^1.1.1 | Latest Base UI |
| class-variance-authority | ^0.7.0 | ^0.7.0 | No update needed |
| clsx | ^2.0.0 | ^2.1.1 | Latest stable |
| tailwind-merge | ^2.2.0 | ^2.5.4 | Latest stable |
| lucide-react | ^0.303.0 | ^0.462.0 | Latest stable |
| tailwindcss-animate | - | ^1.0.7 | **NEW** - Required for shadcn/ui animations |

### 5.2 New Dependencies

| Dependency | Version | Purpose |
|------------|---------|---------|
| tailwindcss-animate | ^1.0.7 | Animation utilities for shadcn/ui |

### 5.3 Dev Dependencies Updates

| Dependency | Current | Target |
|------------|---------|--------|
| @types/react | ^18.2.0 | ^18.3.12 |
| @types/react-dom | ^18.2.0 | ^18.3.1 |
| typescript | ^5.3.3 | ^5.6.3 |
| eslint | ^8.55.0 | ^8.57.1 |
| tailwindcss | ^3.4.0 | ^3.4.15 |
| postcss | ^8.4.32 | ^8.4.49 |
| autoprefixer | ^10.4.16 | ^10.4.20 |

---

## 6. Component Migration Notes

### 6.1 Button Component
**Current:** Custom implementation with 6 variants  
**New:** Official shadcn/ui button with similar variants

**Migration Notes:**
- Variants should match: default, destructive, outline, secondary, ghost, link
- Sizes should match: default, sm, lg, icon
- Check `asChild` prop behavior

### 6.2 Card Component
**Current:** Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter  
**New:** Same component structure

**Migration Notes:**
- Component names should match exactly
- Check padding and spacing values

### 6.3 Dialog Component
**Current:** Full dialog implementation  
**New:** Official shadcn/ui dialog

**Migration Notes:**
- Check DialogContent animation classes
- Verify DialogClose button placement
- Test Portal behavior

### 6.4 Dropdown Menu Component
**Current:** Complete dropdown menu  
**New:** Official shadcn/ui dropdown-menu

**Migration Notes:**
- Check all sub-components
- Verify keyboard navigation
- Test sub-menus

### 6.5 Input Component
**Current:** Basic input  
**New:** Official shadcn/ui input

**Migration Notes:**
- Check file input styling
- Verify focus states

### 6.6 Label Component
**Current:** Label with CVA variants  
**New:** Official shadcn/ui label

**Migration Notes:**
- Check peer-disabled behavior
- Verify variant support

### 6.7 Select Component
**Current:** Full select with scroll buttons  
**New:** Official shadcn/ui select

**Migration Notes:**
- Check `position` prop behavior
- Verify scroll button visibility
- Test keyboard navigation

### 6.8 Tabs Component
**Current:** Tabs, TabsList, TabsTrigger, TabsContent  
**New:** Official shadcn/ui tabs

**Migration Notes:**
- Check animation classes
- Verify keyboard navigation

---

## 7. Testing Recommendations

### 7.1 Unit Testing
- Test component rendering
- Test variant changes
- Test prop passing
- Test event handlers

### 7.2 Integration Testing
- Test component interactions
- Test form submissions
- Test navigation flows

### 7.3 Visual Regression Testing
- Use tools like Percy, Chromatic, or Storybook
- Compare before/after screenshots
- Test responsive breakpoints

### 7.4 Accessibility Testing
- Test keyboard navigation
- Test screen reader compatibility
- Test ARIA attributes
- Test color contrast

### 7.5 Cross-Browser Testing
- Test in Chrome, Firefox, Safari, Edge
- Test on mobile devices
- Test different screen sizes

### 7.6 Performance Testing
- Measure bundle size impact
- Test component render performance
- Check for unnecessary re-renders

---

## 8. Rollback Strategy

### 8.1 Pre-Migration Backup
```bash
# Create backup branch
git checkout -b backup/shadcn-pre-update
git add .
git commit -m "Backup: Current shadcn/ui implementation before v2 migration"
git push origin backup/shadcn-pre-update
```

### 8.2 Rollback Steps
If issues arise during migration:

1. **Immediate Rollback:**
```bash
git checkout backup/shadcn-pre-update
git checkout -b feature/shadcn-v2-migration
git push origin feature/shadcn-v2-migration
```

2. **Selective Rollback:**
```bash
# Restore specific components
git checkout backup/shadcn-pre-update -- packages/ui/src/components/button.tsx
git checkout backup/shadcn-pre-update -- packages/ui/src/components/card.tsx
# ... etc
```

3. **Dependency Rollback:**
```bash
git checkout backup/shadcn-pre-update -- packages/ui/package.json
pnpm install
```

### 8.3 Rollback Decision Criteria
Rollback should be considered if:
- Critical functionality is broken
- Performance degradation > 20%
- Significant visual regressions
- Accessibility issues
- Build failures that cannot be resolved

### 8.4 Post-Rollback Actions
1. Document the issue that caused rollback
2. Create a bug report
3. Schedule time to fix the issue
4. Plan a new migration attempt

---

## 9. Timeline Estimate

| Phase | Estimated Time |
|-------|----------------|
| Phase 1: Preparation | 1-2 hours |
| Phase 2: Initialize shadcn/ui | 1-2 hours |
| Phase 3: Update Dependencies | 1 hour |
| Phase 4: Migrate Components | 2-4 hours |
| Phase 5: Update App Configurations | 1-2 hours |
| Phase 6: Testing and Validation | 4-6 hours |
| Phase 7: Cleanup and Documentation | 1-2 hours |
| **Total** | **11-19 hours** |

---

## 10. Risk Assessment

### 10.1 High Risk
- **Breaking changes in Base UI** - May require significant code changes
- **Custom component modifications** - May not be easily portable
- **Monorepo configuration** - Path resolution issues

### 10.2 Medium Risk
- **Styling differences** - Visual regressions
- **TypeScript errors** - Type mismatches
- **Build failures** - Dependency conflicts

### 10.3 Low Risk
- **Minor API changes** - Easy to fix
- **Documentation updates** - Straightforward

---

## 11. Post-Migration Benefits

### 11.1 Developer Experience
- Official CLI for component management
- Consistent component updates
- Better TypeScript support
- Improved documentation

### 11.2 Maintainability
- Standardized component structure
- Easier to add new components
- Clear upgrade path
- Community support

### 11.3 Features
- Access to new shadcn/ui components
- Improved accessibility
- Better performance
- Enhanced animations

---

## 12. Next Steps

1. **Review this plan** with the development team
2. **Schedule the migration** during a low-traffic period
3. **Create the backup branch** before starting
4. **Begin with Phase 1** (Preparation)
5. **Proceed sequentially** through each phase
6. **Test thoroughly** at each step
7. **Document any issues** encountered
8. **Complete rollback** if critical issues arise

---

## 13. References

- [shadcn/ui Documentation](https://ui.shadcn.com)
- [shadcn/ui GitHub Repository](https://github.com/shadcn-ui/ui)
- [Base UI Documentation](https://www.base-ui.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [Project Repository](https://github.com/your-org/academic-compliance-hub-glm)

---

## Appendix A: Component Usage Examples

### A.1 Button Component
```tsx
import { Button } from "@aah/ui"

// Default button
<Button>Click me</Button>

// Variant buttons
<Button variant="destructive">Delete</Button>
<Button variant="outline">Cancel</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Size buttons
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>
```

### A.2 Card Component
```tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@aah/ui"

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description goes here</CardDescription>
  </CardHeader>
  <CardContent>
    <p>Card content</p>
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

## Appendix B: Troubleshooting Guide

### B.1 Common Issues

**Issue: Components not found after migration**
- Solution: Check import paths in components.json
- Verify components are installed in the correct directory

**Issue: Styling not applied**
- Solution: Ensure global CSS is imported
- Check Tailwind config is properly configured

**Issue: TypeScript errors**
- Solution: Update TypeScript types
- Check peer dependencies are installed

**Issue: Build failures**
- Solution: Check for dependency conflicts
- Verify all dependencies are installed

---

**Document Version:** 1.0  
**Last Updated:** 2025-12-23  
**Author:** Architect Mode (Kilo Code)  
**Status:** Ready for Review
