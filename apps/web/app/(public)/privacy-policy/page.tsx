import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getWebPageGraph, CANONICAL_BASE_URL } from "@/lib/schema";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

export const metadata: Metadata = {
  title: "Privacy Policy & Data Governance Charter | Prayas Pariwaar (Prayas Sanstha)",
  description:
    "Official Institutional Privacy Policy of Prayas Pariwaar (Prayas Sanstha, Vrindavan). Details of our registered society, comprehensive ledger of user data collected across blood coordination, medical equipment lending, and donations, and our strict zero-commercialization data pledge.",
  alternates: {
    canonical: `${CANONICAL_BASE_URL}/privacy-policy`,
  },
  openGraph: {
    title: "Privacy Policy & Data Governance Charter | Prayas Pariwaar",
    description:
      "Institutional privacy charter of Prayas Pariwaar (Reg. 142/2006-07 Mathura). Learn how user data is safeguarded during emergency blood coordination, medical equipment loans, and donations.",
    url: `${CANONICAL_BASE_URL}/privacy-policy`,
    type: "website",
  },
};

export default function PrivacyPolicyPage() {
  const jsonLdData = getWebPageGraph({
    title: "Privacy Policy & Data Governance Charter | Prayas Pariwaar",
    description:
      "Official Institutional Privacy Policy of Prayas Pariwaar (Prayas Sanstha, Vrindavan), registered under Societies Registration Act XXI of 1860 (Reg No. 142/2006-07).",
    path: "/privacy-policy",
    type: "WebPage",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Privacy Policy", path: "/privacy-policy" },
    ],
  });

  return (
    <>
      <JsonLd data={jsonLdData} />
      <PrivacyPolicyClient />
    </>
  );
}
