import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "World Time",
  description:
    "Real-time world clock with Nepal time, multiple timezones, and timezone conversion.",
  alternates: {
    canonical: "/world_time",
  },
};

export default function WorldTimeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}