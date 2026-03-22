import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Government Ministries | DPMS — Government of the Virgin Islands",
  description:
    "Browse the Government of the Virgin Islands ministries and their published discretionary power decisions.",
};

export default function MinistriesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
