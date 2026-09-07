import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getWebPageGraph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Volunteer With Us",
  description:
    "Join the Prayas Pariwaar volunteer taskforce in Vrindavan and Mathura. Contribute your time and skills across education, healthcare, blood coordination, and tree plantation.",
  alternates: {
    canonical: "/volunteer",
  },
  openGraph: {
    title: "Volunteer With Us",
    description:
      "Join the Prayas Pariwaar volunteer taskforce in Vrindavan and Mathura. Contribute your time and skills across education, healthcare, blood coordination, and tree plantation.",
    url: "/volunteer",
  },
};

export default function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getWebPageGraph({
    title: "Volunteer With Us | Prayas Pariwaar (Vrindavan)",
    description:
      "Join the Prayas Pariwaar volunteer taskforce in Vrindavan and Mathura. Contribute your time and skills across education, healthcare, blood coordination, and tree plantation.",
    path: "/volunteer",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Volunteer With Us", path: "/volunteer" },
    ],
  });

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}

