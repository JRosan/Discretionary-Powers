import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Published Decisions | DPMS — Government of the Virgin Islands",
  description:
    "Browse published discretionary power decisions made by the Government of the Virgin Islands, searchable by ministry, type, and date.",
};

export default function PublicDecisionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
