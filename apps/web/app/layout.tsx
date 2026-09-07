import type { Metadata, Viewport } from "next";
import { Lora, Source_Sans_3 } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2E5339",
};

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-lora",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://prayaspariwaar.com"),
  title: {
    default: "Prayas Pariwaar | 18 Years of Grassroots Community Seva in Vrindavan, UP",
    template: "%s | Prayas Pariwaar (Vrindavan)",
  },
  alternates: {
    canonical: "/",
  },
  description:
    "Registered grassroots non-profit society in Vrindavan, Mathura District, UP. Serving rural communities through free education, 24/7 volunteer emergency blood coordination, medical equipment lending bank, tree plantation, and healthcare camps.",
  keywords: [
    "Prayas Pariwaar",
    "Prayas Sanstha Vrindavan",
    "NGO in Vrindavan",
    "Blood Donation Mathura Vrindavan",
    "Medical Equipment Bank Vrindavan",
    "Rural Education UP",
    "Tree Plantation Braj",
    "Community Donation India",
    "Oxygen Concentrator Vrindavan",
  ],
  authors: [{ name: "Prayas Pariwaar" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://prayaspariwaar.com",
    title: "Prayas Pariwaar | 18 Years of Community Service in Vrindavan",
    description:
      "Grassroots humanitarian NGO in Mathura District, UP. 24/7 Emergency Blood Coordination, Medical Equipment Bank, Rural Education, and Environmental Seva.",
    siteName: "Prayas Pariwaar",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prayas Pariwaar - 18 Years of Grassroots Community Seva in Vrindavan, UP",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prayas Pariwaar | Grassroots Seva in Vrindavan",
    description: "24/7 Emergency Blood Registry, Medical Equipment Bank, and Rural Education in Mathura District.",
    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Prayas Pariwaar - 18 Years of Grassroots Community Seva in Vrindavan, UP",
      },
    ],
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
  return (
    <html lang="en" className={`${lora.variable} ${sourceSans.variable} scroll-smooth`}>
      <body className="min-h-screen flex flex-col font-sans antialiased text-prayas-ink bg-prayas-paper selection:bg-prayas-neem selection:text-white">
        {children}
      </body>
    </html>
  );
}

