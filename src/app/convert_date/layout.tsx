import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Date Converter (BS to AD / AD to BS)",
  description:
    "Convert Nepali Bikram Sambat and Gregorian dates instantly with weekday context, relative time, and Nepali date display.",
  alternates: {
    canonical: "/convert_date",
  },
};

export default function ConvertDateLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
