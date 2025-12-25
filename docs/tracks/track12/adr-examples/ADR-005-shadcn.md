# ADR-005: Shadcn/UI v2 Component Library

**Status**: Accepted
**Date**: 2025-01-25
**Decision Makers**: Tech Lead, Senior Architect, Design Lead
**Technical Story**: https://github.com/your-org/athletic-academics-hub/issues/112

---

## Context

We need to choose a UI component library that provides:

- Modern, accessible components
- Excellent TypeScript support
- Customization via Tailwind CSS
- Copy-paste components (no bloat)
- Built-in dark mode
- Good documentation
- Active maintenance and updates

Current constraints:

- Using Tailwind CSS for styling
- Need WCAG 2.2 AA accessibility
- Want modern design aesthetics
- Team values developer productivity
- Design system needs consistency

## Decision

We selected **Shadcn/UI v2** as our primary UI component library.

Key features:

- Copy-paste components (no npm package to install)
- Built on Radix UI primitives (accessible)
- Styled with Tailwind CSS
- Excellent TypeScript support
- Dark mode built-in
- Customizable via CSS variables
- Modern design aesthetics
- Active development and community

## Consequences

### Positive

- **Developer Experience**: Copy-paste components, minimal setup
- **Customization**: Full control via Tailwind and CSS variables
- **Type Safety**: Excellent TypeScript support
- **Accessibility**: Radix UI primitives provide WCAG compliance
- **Bundle Size**: Only include components you use
- **Modern Design**: Contemporary aesthetics out of the box
- **Dark Mode**: Built-in support with CSS variables
- **Performance**: Optimized Radix UI primitives
- **Maintenance**: Frequent updates and bug fixes

### Negative

- **Learning Curve**: Team needs to learn Radix UI patterns
- **Initial Setup**: More boilerplate than ready-made component library
- **Styling Responsibility**: Developers must style components themselves
- **Documentation**: Some components lack comprehensive docs
- **Versioning**: Updates may require manual component updates

### Risks and Mitigations

- **Risk**: Inconsistent component usage across team
  - **Mitigation**: Create internal component guidelines, document patterns, code reviews enforce consistency

- **Risk**: Breaking changes in Radix UI
  - **Mitigation**: Pin to specific versions, test updates carefully, follow changelog

- **Risk**: Over-customization leading to inconsistency
  - **Mitigation**: Use design tokens, create variant system, document customization patterns

## Alternatives Considered

### Alternative 1: Material-UI (MUI)

- **Description**: Use Material-UI as component library
- **Pros**:
  - Comprehensive component set
  - Excellent documentation
  - Established patterns
  - Built-in themes
- **Cons**:
  - Heavy bundle size
  - Difficult to customize deeply
  - Material design may not match brand
  - More opinionated styling
- **Rejection Reason**: Too opinionated, heavy, harder to customize

### Alternative 2: Chakra UI

- **Description**: Use Chakra UI for components
- **Pros**:
  - Accessible by default
  - Composable API
  - Good TypeScript support
  - Easy theming
- **Cons**:
  - Emotion-based (not Tailwind)
  - Would need two styling systems
  - Additional styling layer
  - Less control over styles
- **Rejection Reason**: Doesn't integrate with Tailwind, adds styling complexity

### Alternative 3: Headless UI

- **Description**: Use Headless UI for components
- **Pros**:
  - Fully accessible
  - Unstyled (full control)
  - Good TypeScript support
- **Cons**:
  - Must style everything yourself
  - Less variety of components
  - More initial work
- **Rejection Reason**: More initial work than needed, Shadcn provides similar benefits with better patterns

### Alternative 4: Custom Components

- **Description**: Build all components from scratch
- **Pros**:
  - Full control
  - Minimal dependencies
  - Learn a lot
- **Cons**:
  - Significant time investment
  - Must ensure accessibility yourself
  - Reinventing the wheel
  - Maintenance burden
- **Rejection Reason**: High initial cost, accessibility requires expertise

## Implementation Details

### Component Installation

```bash
# Install dependencies (run once)
pnpm add class-variance-authority clsx tailwind-merge

# Install specific component (example: button)
# Copy component code from Shadcn/UI
# Paste to packages/ui/src/components/button.tsx
```

### Component Pattern

```typescript
// packages/ui/src/components/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@packages/ui/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### Usage in Applications

```typescript
'use client';

import { Button } from '@packages/ui/components/button';

export function MyComponent() {
  return (
    <div>
      <Button variant="default">Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button size="lg">Large</Button>
    </div>
  );
}
```

### Theming with CSS Variables

```css
/* packages/ui/src/styles/globals.css */
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
    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
  }
}
```

### Storybook Integration

```typescript
// packages/ui/src/components/button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './button';

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Default: Story = {
  args: {
    children: 'Button',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button variant="default">Default</Button>
      <Button variant="primary">Primary</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="ghost">Ghost</Button>
    </div>
  ),
};
```

## Best Practices

- Use Shadcn/UI CLI for initial setup
- Copy only components you need
- Customize via CSS variables, not component props
- Use Radix UI primitives directly if needed
- Create variants with `class-variance-authority`
- Maintain internal consistency (spacing, colors, typography)
- Document custom components with Storybook
- Test for accessibility (keyboard, screen reader)
- Keep components simple and composable

## Related Decisions

- [ADR-001: Next.js Framework](../ADR-001-nextjs-framework.md)
- [ADR-002: TypeScript Adoption](../ADR-002-typescript.md)

## References

- [Shadcn/UI Documentation](https://ui.shadcn.com)
- [Radix UI Documentation](https://www.radix-ui.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WCAG 2.2 Guidelines](https://www.w3.org/WAI/WCAG22/quickref/)

## Sign-off

- [x] John Doe, Tech Lead
- [x] Jane Smith, Senior Architect
- [x] Sarah Davis, Design Lead
