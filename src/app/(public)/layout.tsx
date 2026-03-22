import { PublicLayout } from "@/components/layout/public-layout";

export default function PublicPortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
