import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Client Portal | Guardia",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

