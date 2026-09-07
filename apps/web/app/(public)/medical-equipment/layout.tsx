import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getWebPageGraph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Free Medical Equipment Lending Bank",
  description:
    "Borrow essential medical equipment including 10L oxygen concentrators, hospital beds, wheelchairs, and suction machines on free temporary loan in Vrindavan and Mathura.",
  alternates: {
    canonical: "/medical-equipment",
  },
  openGraph: {
    title: "Free Medical Equipment Lending Bank",
    description:
      "Borrow essential medical equipment including 10L oxygen concentrators, hospital beds, wheelchairs, and suction machines on free temporary loan in Vrindavan and Mathura.",
    url: "/medical-equipment",
  },
};

export default function MedicalEquipmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getWebPageGraph({
    title: "Free Medical Equipment Lending Bank | Prayas Pariwaar (Vrindavan)",
    description:
      "Borrow essential medical equipment including 10L oxygen concentrators, hospital beds, wheelchairs, and suction machines on free temporary loan in Vrindavan and Mathura.",
    path: "/medical-equipment",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Free Medical Equipment Lending Bank", path: "/medical-equipment" },
    ],
  });

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}

