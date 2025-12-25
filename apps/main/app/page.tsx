import type { Metadata } from "next";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Header } from "@aah/ui/header";
import { Footer } from "@aah/ui/footer";

const Hero = dynamic(
  () => import("./components/hero").then((mod) => ({ default: mod.Hero })),
  {
    loading: () => (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    ),
  },
);

const Features = dynamic(
  () =>
    import("./components/features").then((mod) => ({ default: mod.Features })),
  {
    loading: () => <div className="h-96" />,
  },
);

const Testimonials = dynamic(
  () =>
    import("./components/testimonials").then((mod) => ({
      default: mod.Testimonials,
    })),
  {
    loading: () => <div className="h-96" />,
  },
);

const FAQ = dynamic(
  () => import("./components/faq").then((mod) => ({ default: mod.FAQ })),
  {
    loading: () => <div className="h-96" />,
  },
);

export const metadata: Metadata = {
  title: "Home - Athletic Academics Hub",
  description:
    "Empower student-athletes with smart compliance tracking, academic eligibility monitoring, and transfer credit management. The all-in-one platform for universities.",
  openGraph: {
    type: "website",
    url: "/",
    title: "Athletic Academics Hub - NCAA Compliance & Academic Support",
    description:
      "Empower student-athletes with smart compliance tracking, academic eligibility monitoring, and transfer credit management.",
  },
};

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "FAQ", href: "#faq" },
  { label: "Documentation", href: "/docs" },
];

const footerSections = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "#features" },
      { label: "Documentation", href: "/docs" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "API Reference", href: "/api" },
      { label: "Contact Support", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/careers" },
    ],
  },
];

const footerBottomLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Header
        logo="AAH"
        logoHref="/"
        title="Athletic Academics Hub"
        navItems={navItems}
        showUserMenu={false}
      />
      <main>
        <Hero />
        <Features />
        <Testimonials />
        <FAQ />
      </main>
      <Footer
        sections={footerSections}
        bottomLinks={footerBottomLinks}
        showBranding={true}
      />
    </div>
  );
}
