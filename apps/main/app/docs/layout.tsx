"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Hash, FileText, Code } from "lucide-react";
import { cn } from "@aah/ui/lib/utils";

const docNavItems = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs", icon: Book },
      { title: "Quick Start", href: "/docs/quick-start", icon: FileText },
      { title: "Installation", href: "/docs/installation", icon: Code },
    ],
  },
  {
    title: "Core Concepts",
    items: [
      { title: "Architecture", href: "/docs/architecture", icon: Hash },
      { title: "Compliance Engine", href: "/docs/compliance", icon: Book },
      { title: "Data Models", href: "/docs/data-models", icon: FileText },
    ],
  },
  {
    title: "API Reference",
    items: [
      { title: "REST API", href: "/docs/api/rest", icon: Code },
      { title: "tRPC", href: "/docs/api/trpc", icon: Code },
      { title: "Webhooks", href: "/docs/api/webhooks", icon: Hash },
    ],
  },
];

interface TableOfContentsProps {
  headings: Array<{ id: string; text: string; level: number }>;
}

export function TableOfContents({ headings }: TableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string>("");
  const pathname = usePathname();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0% -35% 0%" },
    );

    document.querySelectorAll("h2, h3").forEach((section) => {
      observer.observe(section);
    });

    return () => observer.disconnect();
  }, [pathname]);

  return (
    <nav className="hidden lg:block">
      <div className="sticky top-20">
        <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
          On this page
        </h3>
        <ScrollArea className="h-[calc(100vh-8rem)]">
          <ul className="space-y-2 text-sm">
            {headings.map((heading) => (
              <motion.li
                key={heading.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Link
                  href={`#${heading.id}`}
                  className={cn(
                    "block rounded-md py-1 px-2 transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                    activeId === heading.id
                      ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400",
                    heading.level === 3 && "pl-6",
                  )}
                  onClick={(e) => {
                    e.preventDefault();
                    document
                      .getElementById(heading.id)
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {heading.text}
                </Link>
              </motion.li>
            ))}
          </ul>
        </ScrollArea>
      </div>
    </nav>
  );
}

export function DocsLayout({
  children,
  headings,
}: {
  children: React.ReactNode;
  headings?: Array<{ id: string; text: string; level: number }>;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="sticky top-0 z-50 border-b bg-white dark:bg-gray-950 dark:border-gray-800">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <Link
                href="/"
                className="text-xl font-bold text-gray-900 dark:text-white"
              >
                Athletic Academics Hub
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden"
                aria-label="Toggle menu"
              >
                <svg
                  className="size-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={
                      mobileMenuOpen
                        ? "M6 18L18 6M6 6l12 12"
                        : "M4 6h16M4 12h16M4 18h16"
                    }
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-8 lg:hidden"
            >
              <nav className="space-y-4">
                {docNavItems.map((section) => (
                  <div key={section.title}>
                    <h4 className="mb-2 font-semibold text-gray-900 dark:text-white">
                      {section.title}
                    </h4>
                    <ul className="space-y-1 pl-4">
                      {section.items.map((item) => (
                        <li key={item.href}>
                          <Link
                            href={item.href}
                            className={cn(
                              "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                              pathname === item.href
                                ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                            )}
                          >
                            <item.icon className="size-4" />
                            {item.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
          <aside className="hidden lg:block">
            <nav className="sticky top-20 space-y-8">
              {docNavItems.map((section) => (
                <div key={section.title}>
                  <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                            pathname === item.href
                              ? "bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100"
                              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
                          )}
                        >
                          <item.icon className="size-4" />
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          <div className="min-w-0">
            {headings && <TableOfContents headings={headings} />}
            <div className="prose dark:prose-invert max-w-none">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
