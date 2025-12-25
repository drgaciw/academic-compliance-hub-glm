import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VercelAnalytics, VercelSpeedInsights } from "./components/analytics";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Athletic Academics Hub",
  description: "NCAA Compliance & Academic Support Platform",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://athleticacademics.com",
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Athletic Academics Hub",
    title: "Athletic Academics Hub - NCAA Compliance & Academic Support",
    description: "NCAA Compliance & Academic Support Platform",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Athletic Academics Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Athletic Academics Hub",
    description: "NCAA Compliance & Academic Support Platform",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const baseUrl =
  process.env.NEXT_PUBLIC_APP_URL || "https://athleticacademics.com";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Athletic Academics Hub",
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    description:
      "NCAA Compliance & Academic Support Platform - Empower student-athletes with smart compliance tracking, academic eligibility monitoring, and transfer credit management.",
    url: baseUrl,
    author: {
      "@type": "Organization",
      name: "Athletic Academics Hub",
      url: baseUrl,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
  };

  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Athletic Academics Hub",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description:
      "Comprehensive platform for NCAA compliance management and academic support for student-athletes",
    sameAs: [
      "https://twitter.com/athleticacademics",
      "https://linkedin.com/company/athleticacademics",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-800-555-0199",
      contactType: "customer service",
      availableLanguage: ["English"],
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Athletic Academics Hub?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Athletic Academics Hub is a comprehensive platform for NCAA compliance management and academic support for student-athletes.",
        },
      },
      {
        "@type": "Question",
        name: "How does the compliance tracking work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our platform automatically tracks NCAA compliance requirements, monitors eligibility status, and provides real-time alerts for any issues.",
        },
      },
    ],
  };

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      </head>
      <body className={inter.className}>
        {children}
        <VercelAnalytics />
        <VercelSpeedInsights />
      </body>
    </html>
  );
}
