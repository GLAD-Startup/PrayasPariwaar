import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getWebPageGraph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Contact Us & Seva Karyalaya",
  description:
    "Contact Prayas Pariwaar's volunteer office in Vrindavan. Inquire about medical equipment lending, emergency blood coordination, donations, or volunteering.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact Us & Seva Karyalaya",
    description:
      "Contact Prayas Pariwaar's volunteer office in Vrindavan. Inquire about medical equipment lending, emergency blood coordination, donations, or volunteering.",
    url: "/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getWebPageGraph({
    title: "Contact Us & Seva Karyalaya | Prayas Pariwaar (Vrindavan)",
    description:
      "Contact Prayas Pariwaar's volunteer office in Vrindavan. Inquire about medical equipment lending, emergency blood coordination, donations, or volunteering.",
    path: "/contact",
    type: "ContactPage",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Contact Us & Seva Karyalaya", path: "/contact" },
    ],
  });

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}

