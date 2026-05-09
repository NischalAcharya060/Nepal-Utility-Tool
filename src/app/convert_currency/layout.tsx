import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Currency Converter (NPR Focus)",
  description:
    "Live currency conversion with Nepal-focused NPR pairs, favorites, and conversion history in a clean interface.",
  alternates: {
    canonical: "/convert_currency",
  },
};

export default function ConvertCurrencyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
