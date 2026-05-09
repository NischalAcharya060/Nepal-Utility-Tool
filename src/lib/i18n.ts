export const LANGUAGE_KEY = "nut_language_v1";

export type Language = "en" | "ne";

export const LANGUAGES: Record<Language, { label: string; native: string; dir: "ltr" | "rtl" }> = {
  en: { label: "English", native: "English", dir: "ltr" },
  ne: { label: "Nepali", native: "नेपाली", dir: "ltr" },
};