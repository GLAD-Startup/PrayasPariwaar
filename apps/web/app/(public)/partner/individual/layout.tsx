import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getWebPageGraph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Individual Partnership & Patronage",
  description:
    "Become an individual patron of Prayas Pariwaar. Sponsor children's schooling, dedicate medical equipment, or support healthcare camps in memory of loved ones.",
  alternates: {
    canonical: "/partner/individual",
  },
  openGraph: {
    title: "Individual Partnership & Patronage",
    description:
      "Become an individual patron of Prayas Pariwaar. Sponsor children's schooling, dedicate medical equipment, or support healthcare camps in memory of loved ones.",
    url: "/partner/individual",
  },
};

export default function IndividualPartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getWebPageGraph({
    title: "Individual Partnership & Patronage | Prayas Pariwaar (Vrindavan)",
    description:
      "Become an individual patron of Prayas Pariwaar. Sponsor children's schooling, dedicate medical equipment, or support healthcare camps in memory of loved ones.",
    path: "/partner/individual",
    type: "WebPage",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "About Us", path: "/about" },
      { name: "Individual Patronage & Seva Partnership", path: "/partner/individual" },
    ],
  });

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}

