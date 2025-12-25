export const colors = {
  border: "hsl(var(--border))",
  input: "hsl(var(--input))",
  ring: "hsl(var(--ring))",
  background: "hsl(var(--background))",
  foreground: "hsl(var(--foreground))",
  primary: "hsl(var(--primary))",
  primaryForeground: "hsl(var(--primary-foreground))",
  secondary: "hsl(var(--secondary))",
  secondaryForeground: "hsl(var(--secondary-foreground))",
  destructive: "hsl(var(--destructive))",
  destructiveForeground: "hsl(var(--destructive-foreground))",
  muted: "hsl(var(--muted))",
  mutedForeground: "hsl(var(--muted-foreground))",
  accent: "hsl(var(--accent))",
  accentForeground: "hsl(var(--accent-foreground))",
  popover: "hsl(var(--popover))",
  popoverForeground: "hsl(var(--popover-foreground))",
  card: "hsl(var(--card))",
  cardForeground: "hsl(var(--card-foreground))",
} as const;

export type Color = (typeof colors)[keyof typeof colors];

export const spacing = {
  0: "var(--spacing-0)",
  1: "var(--spacing-1)",
  2: "var(--spacing-2)",
  3: "var(--spacing-3)",
  4: "var(--spacing-4)",
  5: "var(--spacing-5)",
  6: "var(--spacing-6)",
  8: "var(--spacing-8)",
  10: "var(--spacing-10)",
  12: "var(--spacing-12)",
  16: "var(--spacing-16)",
  20: "var(--spacing-20)",
  24: "var(--spacing-24)",
  32: "var(--spacing-32)",
  40: "var(--spacing-40)",
  48: "var(--spacing-48)",
  56: "var(--spacing-56)",
  64: "var(--spacing-64)",
} as const;

export type Spacing = (typeof spacing)[keyof typeof spacing];

export const fontSize = {
  xs: "var(--text-xs)",
  sm: "var(--text-sm)",
  base: "var(--text-base)",
  lg: "var(--text-lg)",
  xl: "var(--text-xl)",
  "2xl": "var(--text-2xl)",
  "3xl": "var(--text-3xl)",
  "4xl": "var(--text-4xl)",
  "5xl": "var(--text-5xl)",
  "6xl": "var(--text-6xl)",
} as const;

export type FontSize = (typeof fontSize)[keyof typeof fontSize];

export const lineHeight = {
  none: "var(--leading-none)",
  tight: "var(--leading-tight)",
  normal: "var(--leading-normal)",
  relaxed: "var(--leading-relaxed)",
  loose: "var(--leading-loose)",
} as const;

export type LineHeight = (typeof lineHeight)[keyof typeof lineHeight];

export const borderRadius = {
  lg: "var(--radius)",
  md: "calc(var(--radius) - 2px)",
  sm: "calc(var(--radius) - 4px)",
} as const;

export type BorderRadius = (typeof borderRadius)[keyof typeof borderRadius];

export const breakpoints = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1400px",
} as const;

export type Breakpoint = (typeof breakpoints)[keyof typeof breakpoints];

export const designTokens = {
  colors,
  spacing,
  fontSize,
  lineHeight,
  borderRadius,
  breakpoints,
} as const;

export type DesignTokens = typeof designTokens;
