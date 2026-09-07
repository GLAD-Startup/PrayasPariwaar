import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getWebPageGraph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "CSR & Institutional Alliances",
  description:
    "Collaborate with Prayas Pariwaar for transparent CSR partnerships and institutional community impact in education, healthcare, and ecology across Mathura district.",
  alternates: {
    canonical: "/partner/corporate",
  },
  openGraph: {
    title: "CSR & Institutional Alliances",
    description:
      "Collaborate with Prayas Pariwaar for transparent CSR partnerships and institutional community impact in education, healthcare, and ecology across Mathura district.",
    url: "/partner/corporate",
  },
};

export default function CorporatePartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getWebPageGraph({
    title: "CSR & Institutional Alliances | Prayas Pariwaar (Vrindavan)",
    description:
      "Collaborate with Prayas Pariwaar for transparent CSR partnerships and institutional community impact in education, healthcare, and ecology across Mathura district.",
    path: "/partner/corporate",
    type: "WebPage",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about" },
      { name: "Corporate & CSR Partnerships", path: "/partner/corporate" },
    ],
  });

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}

