import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getWebPageGraph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Donate & Sponsor a Child",
  description:
    "Support grassroots seva in Vrindavan. Sponsor a child's education, support emergency healthcare, or fund native tree plantation with Prayas Pariwaar.",
  alternates: {
    canonical: "/donate",
  },
  openGraph: {
    title: "Donate & Sponsor a Child",
    description:
      "Support grassroots seva in Vrindavan. Sponsor a child's education, support emergency healthcare, or fund native tree plantation with Prayas Pariwaar.",
    url: "/donate",
  },
};

export default function DonateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getWebPageGraph({
    title: "Donate & Sponsor a Child | Prayas Pariwaar (Vrindavan)",
    description:
      "Support grassroots seva in Vrindavan. Sponsor a child's education, support emergency healthcare, or fund native tree plantation with Prayas Pariwaar.",
    path: "/donate",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Donate & Support", path: "/donate" },
    ],
  });

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}

