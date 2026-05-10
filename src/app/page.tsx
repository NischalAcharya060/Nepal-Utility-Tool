"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useState } from "react";
import { THEME_KEY } from "@/lib/theme";
import { LANGUAGES, type Language } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n-context";
import ActionModal from "@/components/ui/ActionModal";
import {
  Calendar, Wallet, Languages, Clock, ArrowUpRight, Sun, Moon, HelpCircle, Settings,
  Globe2, Command, ShieldCheck, WifiOff, Heart,
} from "lucide-react";

const TOOLS = [
  {
    href: "/convert_date",
    icon: Calendar,
    index: "01",
    titleKey: "dateConverter",
    titleEn: "Date Converter",
    titleNe: "मिति रूपान्तरण",
    tagEn: "BS ⇄ AD",
    tagNe: "वि.सं ⇄ ई.सं",
    descEn: "Convert between Bikram Sambat and Gregorian calendars with weekday and Devanagari output.",
    descNe: "विक्रम संवत् र अंग्रेजी मिति बीच वार सहित देवनागरीमा रूपान्तरण।",
    metaEn: "1970 — 2099 BS",
    metaNe: "१९७० — २०९९ वि.सं",
  },
  {
    href: "/convert_currency",
    icon: Wallet,
    index: "02",
    titleKey: "currencyConverter",
    titleEn: "Currency Converter",
    titleNe: "मुद्रा रूपान्तरण",
    tagEn: "Live FX",
    tagNe: "प्रत्यक्ष दर",
    descEn: "Real-time exchange rates with NPR-focused pairs, favorites, and CSV export.",
    descNe: "NPR केन्द्रित जोडी, मनपर्ने सूची र CSV निर्यातसहित प्रत्यक्ष दरहरू।",
    metaEn: "150+ currencies",
    metaNe: "१५०+ मुद्राहरू",
  },
  {
    href: "/convert_language",
    icon: Languages,
    index: "03",
    titleKey: "languageConverter",
    titleEn: "Language Converter",
    titleNe: "भाषा अनुवाद",
    tagEn: "Translate",
    tagNe: "अनुवाद",
    descEn: "Translate between Nepali, English, Hindi and more with one-tap presets.",
    descNe: "नेपाली, अंग्रेजी, हिन्दी लगायत भाषाहरूबीच एक-ट्याप अनुवाद।",
    metaEn: "9 languages",
    metaNe: "९ भाषाहरू",
  },
  {
    href: "/world_time",
    icon: Clock,
    index: "04",
    titleKey: "worldClock",
    titleEn: "World Time",
    titleNe: "विश्व समय",
    tagEn: "Live Clock",
    tagNe: "प्रत्यक्ष घडी",
    descEn: "Real-time world clock with Nepal time, multiple timezones, and timezone conversion.",
    descNe: "नेपाली समय, धेरै समय क्षेत्रहरू र समय रूपान्तरणसहित वास्तविक विश्व घडी।",
    metaEn: "12 cities",
    metaNe: "१२ शहरहरू",
  },
];

export default function Home() {
  const { lang, setLang, t } = useI18n();
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem(THEME_KEY) === "dark") setDark(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch {}
  }, [dark, mounted]);

  const isNe = lang === "ne";

  // Restrained palette: near-black + paper-white + a single emerald accent.
  const page = dark ? "bg-[#0a0a0a] text-zinc-100" : "bg-[#fafaf7] text-zinc-900";
  const surface = dark ? "bg-zinc-950 border-zinc-800/80" : "bg-white border-zinc-200/80";
  const subtle = dark ? "text-zinc-400" : "text-zinc-600";
  const muted = dark ? "text-zinc-500" : "text-zinc-500";
  const hairline = dark ? "border-zinc-800/80" : "border-zinc-200/80";
  const chipBg = dark ? "bg-zinc-900 border-zinc-800 text-zinc-300" : "bg-white border-zinc-200 text-zinc-700";
  const iconBtn = dark
    ? "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300"
    : "border-zinc-200 hover:border-zinc-300 hover:bg-white text-zinc-700";
  const accentDot = "bg-emerald-500";

  return (
    <div className={`min-h-screen ${page} antialiased selection:bg-emerald-500/30 selection:text-inherit`}>
      {/* Editorial grid backdrop */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.35] dark:opacity-[0.18]"
        style={{
          backgroundImage: dark
            ? "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)"
            : "linear-gradient(to right, rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.04) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
          maskImage: "radial-gradient(ellipse at 50% 0%, black 30%, transparent 75%)",
        }}
      />

      {/* Header */}
      <header className={`sticky top-0 z-40 border-b ${hairline} backdrop-blur-md ${dark ? "bg-[#0a0a0a]/75" : "bg-[#fafaf7]/75"}`}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Wordmark */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-md ${dark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"}`}>
                <span className="text-[13px] font-semibold tracking-tight">N</span>
                <span className={`absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 rounded-full ${accentDot} ring-2 ${dark ? "ring-[#0a0a0a]" : "ring-[#fafaf7]"}`} />
              </div>
              <div className="leading-tight">
                <div className="text-[13px] font-semibold tracking-tight">{t("siteName")}</div>
                <div className={`text-[10px] tracking-[0.14em] uppercase ${muted}`}>
                  {isNe ? "नेपाली डिजिटल उपकरण" : "Nepal · Digital Utilities"}
                </div>
              </div>
            </Link>

            {/* Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === "en" ? "ne" : "en")}
                className={`hidden sm:inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] font-medium ${iconBtn}`}
                aria-label="Toggle language"
              >
                <Globe2 size={14} />
                <span>{LANGUAGES[lang === "en" ? "ne" : "en"].native}</span>
              </button>
              <button
                onClick={() => setDark(d => !d)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${iconBtn}`}
                aria-label="Toggle theme"
              >
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button
                onClick={() => setShowHelp(true)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${iconBtn}`}
                aria-label="Help"
              >
                <HelpCircle size={15} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${iconBtn}`}
                aria-label="Settings"
              >
                <Settings size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6">
        {/* Hero */}
        <section className="relative pt-20 pb-16 md:pt-28 md:pb-20">
          <div className={`inline-flex items-center gap-2 rounded-full border ${hairline} ${chipBg} px-3 py-1`}>
            <span className={`h-1.5 w-1.5 rounded-full ${accentDot} animate-pulse`} />
            <span className="text-[11px] font-medium tracking-wide">
              {isNe ? "सबै उपकरणहरू निःशुल्क" : "All utilities · free forever"}
            </span>
          </div>

          <h1 className="mt-6 max-w-3xl text-balance text-[40px] leading-[1.05] font-semibold tracking-[-0.02em] md:text-[64px] md:leading-[1.02]">
            {isNe ? (
              <>
                नेपाली दैनिकीका लागि{" "}
                <span className="italic font-serif font-normal">सरल</span> डिजिटल उपकरणहरू।
              </>
            ) : (
              <>
                Quietly capable utilities,{" "}
                <span className="italic font-serif font-normal">crafted</span> for Nepal.
              </>
            )}
          </h1>

          <p className={`mt-6 max-w-xl text-[15px] leading-relaxed ${subtle}`}>
            {isNe
              ? "मिति, मुद्रा र भाषा रूपान्तरण — एकै ठाउँमा। छिटो, कीबोर्ड-मैत्री र अफलाइन-योग्य।"
              : "Date, currency, and language conversions — one focused workspace. Fast, keyboard-first, and offline-aware."}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/convert_date"
              className={`group inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-medium transition ${
                dark ? "bg-zinc-100 text-zinc-900 hover:bg-white" : "bg-zinc-900 text-white hover:bg-zinc-800"
              }`}
            >
              {isNe ? "अहिले सुरु गर्नुहोस्" : "Get started"}
              <ArrowUpRight size={14} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <button
              onClick={() => setShowHelp(true)}
              className={`inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-[13px] font-medium ${iconBtn}`}
            >
              <Command size={13} />
              {isNe ? "कसरी प्रयोग गर्ने" : "How it works"}
            </button>
          </div>

          {/* Inline metrics */}
          <dl className={`mt-16 grid grid-cols-3 gap-8 border-t ${hairline} pt-8 max-w-2xl`}>
            {[
              { v: "1970–2099", l: isNe ? "वि.सं समर्थन" : "BS years" },
              { v: "150+", l: isNe ? "मुद्राहरू" : "Currencies" },
              { v: "12", l: isNe ? "शहरहरू" : "Cities" },
            ].map((s, i) => (
              <div key={i}>
                <dt className={`text-[11px] uppercase tracking-[0.16em] ${muted}`}>{s.l}</dt>
                <dd className="mt-2 text-2xl font-medium tracking-tight tabular-nums">{s.v}</dd>
              </div>
            ))}
          </dl>
        </section>

        {/* Utilities directory */}
        <section className="pb-20">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <div className={`text-[11px] uppercase tracking-[0.18em] ${muted}`}>
                {isNe ? "उपकरण निर्देशिका" : "Utilities · index"}
              </div>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {isNe ? "चार उपकरण, एउटै लय" : "Four tools, one rhythm"}
              </h2>
            </div>
            <span className={`hidden md:block text-[11px] uppercase tracking-[0.16em] ${muted}`}>
              {isNe ? "अद्यावधिक · " : "Updated · "}
              {new Date().toLocaleDateString(isNe ? "ne-NP" : "en-US", { month: "short", year: "numeric" })}
            </span>
          </div>

          <ul className={`overflow-hidden rounded-xl border ${hairline} ${surface}`}>
            {TOOLS.map((tool, i) => {
              const Icon = tool.icon;
              return (
                <li key={tool.href} className={i !== TOOLS.length - 1 ? `border-b ${hairline}` : ""}>
                  <Link
                    href={tool.href}
                    className={`group relative grid grid-cols-12 items-center gap-4 px-5 py-6 md:px-8 md:py-8 transition ${
                      dark ? "hover:bg-zinc-900/60" : "hover:bg-zinc-50"
                    }`}
                  >
                    {/* Index + accent rule on hover */}
                    <div className="col-span-2 md:col-span-1 flex items-center gap-3">
                      <span className={`text-[11px] tabular-nums tracking-widest ${muted}`}>{tool.index}</span>
                    </div>

                    {/* Icon */}
                    <div className="col-span-2 md:col-span-1">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${hairline} ${dark ? "bg-zinc-950" : "bg-white"} transition group-hover:border-emerald-500/40`}>
                        <Icon size={18} className={dark ? "text-zinc-200" : "text-zinc-800"} />
                      </div>
                    </div>

                    {/* Title + tag */}
                    <div className="col-span-8 md:col-span-4">
                      <div className="flex items-center gap-3">
                        <h3 className="text-[17px] font-semibold tracking-tight">
                          {isNe ? tool.titleNe : tool.titleEn}
                        </h3>
                        <span className={`hidden sm:inline-flex items-center rounded-full border ${hairline} px-2 py-0.5 text-[10px] font-medium tracking-wide ${muted}`}>
                          {isNe ? tool.tagNe : tool.tagEn}
                        </span>
                      </div>
                      <p className={`mt-1 text-[12px] uppercase tracking-[0.14em] ${muted}`}>
                        {isNe ? tool.metaNe : tool.metaEn}
                      </p>
                    </div>

                    {/* Description */}
                    <p className={`col-span-12 md:col-span-5 text-[14px] leading-relaxed ${subtle}`}>
                      {isNe ? tool.descNe : tool.descEn}
                    </p>

                    {/* Arrow */}
                    <div className="col-span-12 md:col-span-1 flex md:justify-end">
                      <span
                        className={`inline-flex h-9 w-9 items-center justify-center rounded-full border ${hairline} ${
                          dark ? "bg-zinc-950 group-hover:bg-emerald-500 group-hover:border-emerald-500" : "bg-white group-hover:bg-emerald-500 group-hover:border-emerald-500"
                        } transition`}
                      >
                        <ArrowUpRight size={15} className="transition group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Principles */}
        <section className="pb-24">
          <div className={`grid gap-px overflow-hidden rounded-xl border ${hairline} ${dark ? "bg-zinc-800/60" : "bg-zinc-200/60"} md:grid-cols-3`}>
            {[
              {
                icon: Command,
                titleEn: "Keyboard-first",
                titleNe: "किबोर्ड-मैत्री",
                bodyEn: "Press Enter to convert. Tab through every input. Built for fluent muscle memory.",
                bodyNe: "रूपान्तरणका लागि Enter थिच्नुहोस्। प्रत्येक इनपुटमा Tab गर्नुहोस्।",
              },
              {
                icon: ShieldCheck,
                titleEn: "Private by design",
                titleNe: "गोप्य रूपमा निर्मित",
                bodyEn: "Your inputs and history live in your browser. Nothing is shipped to a server.",
                bodyNe: "तपाईंका इनपुट र इतिहास तपाईंकै ब्राउजरमा रहन्छन्।",
              },
              {
                icon: WifiOff,
                titleEn: "Offline aware",
                titleNe: "अफलाइन-योग्य",
                bodyEn: "Cached after first load. Conversions keep working when the network doesn't.",
                bodyNe: "पहिलो पटक लोड पछि क्यास हुन्छ। नेटवर्क बिना पनि चल्छ।",
              },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className={`${dark ? "bg-[#0a0a0a]" : "bg-[#fafaf7]"} p-7`}>
                  <div className={`flex h-9 w-9 items-center justify-center rounded-md border ${hairline}`}>
                    <Icon size={16} />
                  </div>
                  <h4 className="mt-5 text-[15px] font-semibold tracking-tight">
                    {isNe ? f.titleNe : f.titleEn}
                  </h4>
                  <p className={`mt-2 text-[13px] leading-relaxed ${subtle}`}>
                    {isNe ? f.bodyNe : f.bodyEn}
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={`border-t ${hairline}`}>
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className={`flex h-7 w-7 items-center justify-center rounded-md ${dark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white"}`}>
                <span className="text-[11px] font-semibold">N</span>
              </div>
              <div className="leading-tight">
                <div className="text-[12px] font-semibold tracking-tight">{t("siteName")}</div>
                <div className={`text-[10px] tracking-[0.14em] uppercase ${muted}`}>
                  © {new Date().getFullYear()} · {t("craftedWithCare")}
                </div>
              </div>
            </div>

            <div className={`flex items-center gap-5 text-[12px] ${subtle}`}>
              <Link href="/convert_date" className="hover:text-emerald-500 transition">{isNe ? "मिति" : "Date"}</Link>
              <Link href="/convert_currency" className="hover:text-emerald-500 transition">{isNe ? "मुद्रा" : "Currency"}</Link>
              <Link href="/convert_language" className="hover:text-emerald-500 transition">{isNe ? "भाषा" : "Language"}</Link>
              <Link href="/world_time" className="hover:text-emerald-500 transition">{isNe ? "समय" : "Time"}</Link>
              <span className={`inline-flex h-8 items-center gap-1.5 rounded-md border px-2.5 ${iconBtn}`}>
                <Heart size={11} className="text-emerald-500" fill="currentColor" />
                <span className="text-[11px] tracking-wide">{isNe ? "नेपालमा" : "Nepal"}</span>
              </span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ActionModal open={showHelp} onClose={() => setShowHelp(false)} title={t("quickHelp")} dark={dark}>
        <p>{t("useMainCards")}</p>
        <p>{t("toolSpecificHistory")}</p>
      </ActionModal>

      <ActionModal open={showSettings} onClose={() => setShowSettings(false)} title={t("homeSettings")} dark={dark}>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${dark ? "border-zinc-800" : "border-zinc-200"}`}>
          <Globe2 size={18} />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="bg-transparent outline-none text-sm font-semibold flex-1 cursor-pointer"
          >
            {Object.entries(LANGUAGES).map(([code, info]) => (
              <option key={code} value={code}>
                {info.label} · {info.native}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setDark(d => !d)}
          className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold ${dark ? "border-zinc-800 hover:bg-zinc-900" : "border-zinc-200 hover:bg-zinc-50"}`}
        >
          {t("toggleTheme")}
        </button>
      </ActionModal>
    </div>
  );
}
