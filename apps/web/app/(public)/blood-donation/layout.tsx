import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getWebPageGraph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "24/7 Emergency Blood Registry",
  description:
    "Access Prayas Pariwaar's 24/7 voluntary emergency blood donor coordination desk in Vrindavan and Mathura. Request urgent blood units or register as a voluntary blood donor.",
  alternates: {
    canonical: "/blood-donation",
  },
  openGraph: {
    title: "24/7 Emergency Blood Registry",
    description:
      "Access Prayas Pariwaar's 24/7 voluntary emergency blood donor coordination desk in Vrindavan and Mathura. Request urgent blood units or register as a voluntary blood donor.",
    url: "/blood-donation",
  },
};

export default function BloodDonationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getWebPageGraph({
    title: "24/7 Emergency Blood Registry | Prayas Pariwaar (Vrindavan)",
    description:
      "Access Prayas Pariwaar's 24/7 voluntary emergency blood donor coordination desk in Vrindavan and Mathura. Request urgent blood units or register as a voluntary blood donor.",
    path: "/blood-donation",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Emergency Blood Registry", path: "/blood-donation" },
    ],
  });

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}

