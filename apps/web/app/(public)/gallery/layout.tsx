import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getWebPageGraph } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Photo Gallery & Seva Highlights",
  description:
    "Browse visual photo stories and albums highlighting community programs, blood donation camps, child education centers, and tree plantations in Vrindavan.",
  alternates: {
    canonical: "/gallery",
  },
  openGraph: {
    title: "Photo Gallery & Seva Highlights",
    description:
      "Browse visual photo stories and albums highlighting community programs, blood donation camps, child education centers, and tree plantations in Vrindavan.",
    url: "/gallery",
  },
};

export default function GalleryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const schema = getWebPageGraph({
    title: "Photo Gallery & Seva Highlights | Prayas Pariwaar (Vrindavan)",
    description:
      "Browse visual photo stories and albums highlighting community programs, blood donation camps, child education centers, and tree plantations in Vrindavan.",
    path: "/gallery",
    type: "CollectionPage",
    breadcrumbs: [
      { name: "Home", path: "/" },
      { name: "Photo Gallery & Seva Highlights", path: "/gallery" },
    ],
  });

  return (
    <>
      <JsonLd data={schema} />
      {children}
    </>
  );
}

