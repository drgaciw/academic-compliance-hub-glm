import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SkipToContent } from "@aah/ui";
import { Header } from "@aah/ui";
import { Footer } from "@aah/ui";
import { VercelSpeedInsights } from "./components/speed-insights";
import {
  LayoutDashboard,
  FileText,
  Upload,
  Users,
  BarChart,
} from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://athleticacademics.com";

export const metadata: Metadata = {
  title: "Admin Dashboard - Athletic Academics Hub",
  description:
    "Admin dashboard for Athletic Academics Hub - manage compliance, course mapping, and student eligibility",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://athleticacademics.com",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/admin",
    siteName: "Athletic Academics Hub",
    title: "Admin Dashboard - Athletic Academics Hub",
    description:
      "Admin dashboard for Athletic Academics Hub - manage compliance, course mapping, and student eligibility",
    images: [
      {
        url: "/og-admin.png",
        width: 1200,
        height: 630,
        alt: "Admin Dashboard",
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

const navItems = [
  { href: "/", label: "Dashboard", icon: <LayoutDashboard /> },
  { href: "/transcripts", label: "Transcripts", icon: <FileText /> },
  { href: "/upload", label: "Upload", icon: <Upload /> },
  { href: "/compliance", label: "Compliance", icon: <BarChart /> },
  { href: "/users", label: "Users", icon: <Users /> },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Athletic Academics Hub - Admin Dashboard",
    description:
      "Admin dashboard for Athletic Academics Hub - manage compliance, course mapping, and student eligibility",
    url: `${baseUrl}/admin`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={inter.className}>
        <SkipToContent />
        <Header title="Admin Dashboard" navItems={navItems} basePath="/admin" />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer
          sections={[
            {
              title: "Admin Resources",
              links: [
                { label: "Help Center", href: "/help" },
                { label: "Documentation", href: "/docs" },
                { label: "API Reference", href: "/api" },
              ],
            },
            {
              title: "Quick Links",
              links: [
                { label: "Student Portal", href: "/student", external: true },
                { label: "Analytics", href: "/analytics" },
                { label: "Settings", href: "/settings" },
              ],
            },
          ]}
          bottomLinks={[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
          ]}
          basePath="/admin"
        />
        <VercelSpeedInsights />
      </body>
    </html>
  );
}
