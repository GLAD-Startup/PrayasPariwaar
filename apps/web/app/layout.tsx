import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://prayas-sanstha.org"),
  title: {
    default: "Prayas Sanstha | Emergency Blood & Medical Equipment Assistance NGO",
    template: "%s | Prayas Sanstha",
  },
  description:
    "Prayas Sanstha is a registered humanitarian NGO providing 24/7 emergency blood donation connectivity, free medical equipment leasing bank, disaster relief, and volunteer mobilization.",
  keywords: [
    "Prayas Sanstha",
    "Emergency Blood Donation",
    "Medical Equipment Bank",
    "Oxygen Concentrator NGO",
    "Blood Donor Network India",
    "Humanitarian NGO",
    "Volunteer Social Work",
    "80G Tax Exemption Donations",
  ],
  authors: [{ name: "Prayas Sanstha Team" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://prayas-sanstha.org",
    title: "Prayas Sanstha | Saving Lives Through Community Action",
    description:
      "24/7 Emergency Blood Coordination, Medical Equipment Support Bank, and Dedicated Volunteers.",
    siteName: "Prayas Sanstha",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prayas Sanstha | Humanitarian Action",
    description: "Emergency blood donor network and medical equipment support.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // JSON-LD structured data for NGO SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: "Prayas Sanstha",
    alternateName: "Prayas Humanitarian Society",
    url: "https://prayas-sanstha.org",
    logo: "https://prayas-sanstha.org/logo.png",
    description:
      "Non-profit organization dedicated to emergency blood donation matching, free medical equipment loans, and community relief.",
    foundingDate: "2015",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Prayas Seva Bhawan, Main Road",
      addressLocality: "Jaipur",
      addressRegion: "Rajasthan",
      postalCode: "302001",
      addressCountry: "IN",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9876543210",
      contactType: "Emergency Blood Helpline",
      availableLanguage: ["Hindi", "English"],
      areaServed: "IN",
    },
    sameAs: [
      "https://facebook.com/prayassanstha",
      "https://twitter.com/prayassanstha",
      "https://instagram.com/prayassanstha",
    ],
  };

  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col font-sans antialiased text-slate-800 bg-slate-50">
        {children}
      </body>
    </html>
  );
}
