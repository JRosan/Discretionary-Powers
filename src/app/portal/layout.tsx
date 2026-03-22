import type { Metadata } from "next";
import { PublicLayout } from "@/components/layout/public-layout";

export const metadata: Metadata = {
  title: "Discretionary Powers Transparency Portal | Government of the Virgin Islands",
  description:
    "Promoting accountability and good governance through the structured 10-step framework for the proper and lawful exercise of discretionary powers in the BVI.",
  openGraph: {
    title: "Discretionary Powers Transparency Portal",
    description:
      "Browse published discretionary power decisions from the Government of the Virgin Islands.",
    type: "website",
  },
};

export default function PublicPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
