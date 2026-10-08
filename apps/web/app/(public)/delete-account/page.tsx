import type { Metadata } from "next";
import { CANONICAL_BASE_URL } from "@/lib/schema";
import DeleteAccountClient from "./DeleteAccountClient";

export const metadata: Metadata = {
  title: "Account & Data Deletion Request | Prayas Pariwaar",
  description:
    "Official account and data deletion request instructions and form for Prayas Pariwaar (Prayas Sanstha) mobile app and web platform users.",
  alternates: {
    canonical: `${CANONICAL_BASE_URL}/delete-account`,
  },
};

export default function DeleteAccountPage() {
  return <DeleteAccountClient />;
}
