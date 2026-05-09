import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Language Converter",
  description:
    "Translate text between Nepali, English, Hindi, and other languages with quick pair switching and an embedded live translator.",
  alternates: {
    canonical: "/convert_language",
  },
};

export default function ConvertLanguageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
