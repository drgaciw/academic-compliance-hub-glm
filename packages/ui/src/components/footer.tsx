import * as React from "react";
import Link from "next/link";

import { cn } from "../lib/utils";

export interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

export interface FooterSection {
  title: string;
  links: FooterLink[];
}

export interface FooterProps extends React.HTMLAttributes<HTMLElement> {
  sections?: FooterSection[];
  bottomLinks?: FooterLink[];
  copyright?: string;
  showBranding?: boolean;
  basePath?: string;
}

export function Footer({
  sections = [],
  bottomLinks = [],
  copyright = `© ${new Date().getFullYear()} Academic Compliance Hub. All rights reserved.`,
  showBranding = true,
  basePath = "",
  className,
  ...props
}: FooterProps) {
  return (
    <footer className={cn("border-t bg-background", className)} {...props}>
      <div className="container px-4 py-12 md:py-16">
        {sections.length > 0 && (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {showBranding && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">
                  Academic Compliance Hub
                </h3>
                <p className="text-sm text-muted-foreground">
                  Streamlining athletic academic compliance for universities
                  nationwide.
                </p>
              </div>
            )}
            {sections.map((section) => (
              <div key={section.title} className="space-y-3">
                <h4 className="text-sm font-semibold">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={`${basePath}${link.href}`}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {(bottomLinks.length > 0 || copyright) && (
          <div
            className={cn(
              "mt-12 flex flex-col items-center gap-4 pt-8",
              "border-t md:flex-row md:justify-between",
            )}
          >
            {bottomLinks.length > 0 && (
              <nav className="flex flex-wrap items-center justify-center gap-4 md:justify-start">
                {bottomLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={`${basePath}${link.href}`}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            )}
            {copyright && (
              <p className="text-sm text-muted-foreground">{copyright}</p>
            )}
          </div>
        )}
      </div>
    </footer>
  );
}
