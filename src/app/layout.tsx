import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import { Footer } from "@/components/Footer";
import { MotionProvider } from "@/components/MotionProvider";
import { Nav } from "@/components/Nav";
import { profile } from "@/data/profile";
import { siteDescription, siteTitle, siteUrl } from "@/lib/site";
import "./globals.css";

const sans = Instrument_Sans({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-instrument-sans",
  display: "swap",
});

const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteTitle, template: `%s | ${profile.name}` },
  description: siteDescription,
  applicationName: `${profile.name} Portfolio`,
  authors: [{ name: profile.name, url: siteUrl }],
  creator: profile.name,
  keywords: [
    "Bishoy Emad",
    "AI creative",
    "AI video production",
    "AI ad creatives",
    "digital marketing",
    "social media content",
    "AI automation",
    "Dubai",
    "freelancer",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: profile.name,
    title: siteTitle,
    description: siteDescription,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${profile.name}, ${profile.role}` }],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/og.jpg"],
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false, email: false, address: false },
};

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  jobTitle: profile.role,
  description: siteDescription,
  url: siteUrl,
  image: `${siteUrl}/og.jpg`,
  email: `mailto:${profile.email}`,
  address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
  sameAs: [profile.linkedin],
  knowsAbout: [
    "AI video production",
    "Advertising creatives",
    "Social media content",
    "Digital marketing",
    "E-commerce",
    "Marketing automation",
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <head>
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body className="grain">
        <a
          href="#main"
          className="sr-only z-[100] rounded-full bg-paper px-5 py-3 text-ink focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <MotionProvider>
          <Nav />
          <main id="main">{children}</main>
          <Footer />
        </MotionProvider>
        <script
          type="application/ld+json"
          // Static, trusted content defined in this repository.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
      </body>
    </html>
  );
}
