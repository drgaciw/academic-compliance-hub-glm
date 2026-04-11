import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SkipToContent } from "@aah/ui";
import { Header } from "@aah/ui";
import { Footer } from "@aah/ui";
import { VercelSpeedInsights } from "./components/speed-insights";
import {
  Home,
  FileText,
  Upload,
  CheckCircle,
  Bell,
  FileText as FileTextIcon,
  Shield,
  GraduationCap,
  HelpCircle,
} from "lucide-react";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://athleticacademics.com";

export const metadata: Metadata = {
  title: "Student Portal - Athletic Academics Hub",
  description:
    "Student self-service portal for Athletic Academics Hub - track eligibility, upload transcripts, and monitor compliance status",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://athleticacademics.com",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/student",
    siteName: "Athletic Academics Hub",
    title: "Student Portal - Athletic Academics Hub",
    description:
      "Student self-service portal for Athletic Academics Hub - track eligibility, upload transcripts, and monitor compliance status",
    images: [
      {
        url: "/og-student.png",
        width: 1200,
        height: 630,
        alt: "Student Portal",
      },
    ],
  },
  robots: {
    index: false,
    follow: false,
  },
};

const navItems = [
  { href: "/", label: "Dashboard", icon: <Home /> },
  { href: "/preliminary", label: "Preliminary", icon: <FileText /> },
  { href: "/upload", label: "Upload", icon: <Upload /> },
  { href: "/status", label: "Status", icon: <CheckCircle /> },
  { href: "/eligibility", label: "Eligibility", icon: <Shield /> },
  { href: "/advising", label: "Advising", icon: <GraduationCap /> },
  { href: "/transcripts", label: "Transcripts", icon: <FileTextIcon /> },
  { href: "/reports", label: "Reports", icon: <FileTextIcon /> },
  { href: "/support", label: "Support", icon: <HelpCircle /> },
  { href: "/notifications", label: "Notifications", icon: <Bell /> },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Athletic Academics Hub - Student Portal",
    description:
      "Student self-service portal for Athletic Academics Hub - track eligibility, upload transcripts, and monitor compliance status",
    url: `${baseUrl}/student`,
    applicationCategory: "EducationalApplication",
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
        <Header
          title="Student Portal"
          navItems={navItems}
          basePath="/student"
        />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer
          sections={[
            {
              title: "Resources",
              links: [
                { label: "Help Center", href: "/help" },
                { label: "Documentation", href: "/docs" },
                { label: "Contact Support", href: "/contact" },
              ],
            },
            {
              title: "Quick Links",
              links: [
                {
                  label: "NCAA Portal",
                  href: "https://web3.ncaa.org",
                  external: true,
                },
                { label: "Transfer Portal", href: "/transfer" },
              ],
            },
          ]}
          bottomLinks={[
            { label: "Privacy Policy", href: "/privacy" },
            { label: "Terms of Service", href: "/terms" },
          ]}
          basePath="/student"
        />
        <VercelSpeedInsights />
      </body>
    </html>
  );
}
