"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { THEME_KEY } from "@/lib/theme";
import { LANGUAGES, type Language } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n-context";
import ActionModal from "@/components/ui/ActionModal";
import {
  Languages, ArrowLeftRight, RefreshCw, Maximize2, Minimize2,
  HelpCircle, Settings, Sun, Moon, ExternalLink, Info, Globe2,
  ArrowUpRight, ArrowLeft, ChevronDown,
} from "lucide-react";

const PAIR_KEY = "nlc_pair_v1";

type LangCode = "ne" | "en" | "hi" | "es" | "fr" | "de" | "zh" | "ja" | "ar";

const LANGS: Record<LangCode, { label: string; native: string; flag: string }> = {
  ne: { label: "Nepali", native: "नेपाली", flag: "🇳🇵" },
  en: { label: "English", native: "English", flag: "🇺🇸" },
  hi: { label: "Hindi", native: "हिन्दी", flag: "🇮🇳" },
  es: { label: "Spanish", native: "Español", flag: "🇪🇸" },
  fr: { label: "French", native: "Français", flag: "🇫🇷" },
  de: { label: "German", native: "Deutsch", flag: "🇩🇪" },
  zh: { label: "Chinese", native: "中文", flag: "🇨🇳" },
  ja: { label: "Japanese", native: "日本語", flag: "🇯🇵" },
  ar: { label: "Arabic", native: "العربية", flag: "🇸🇦" },
};

const LANG_CODES = Object.keys(LANGS) as LangCode[];

export default function LanguageConverter() {
  const { lang, setLang, t } = useI18n();
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [from, setFrom] = useState<LangCode>("ne");
  const [to, setTo] = useState<LangCode>("en");
  const [expanded, setExpanded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const isNe = lang === "ne";

  useEffect(() => {
    setMounted(true);
    try {
      if (localStorage.getItem(THEME_KEY) === "dark") setDark(true);
      const raw = localStorage.getItem(PAIR_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { from?: LangCode; to?: LangCode };
        if (parsed.from && LANGS[parsed.from]) setFrom(parsed.from);
        if (parsed.to && LANGS[parsed.to]) setTo(parsed.to);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch {}
  }, [dark, mounted]);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(PAIR_KEY, JSON.stringify({ from, to })); } catch {}
  }, [from, to, mounted]);

  const iframeSrc = useMemo(
    () => `https://www.basiconlinetools.com/embed/language/translation?fo=${from}&to=${to}`,
    [from, to]
  );

  useEffect(() => {
    setIframeLoading(true);
  }, [iframeSrc, reloadKey]);

  const handleSwap = () => {
    if (from === to) return;
    setFrom(to);
    setTo(from);
  };

  const resetPreferences = () => {
    setFrom("ne");
    setTo("en");
    setExpanded(false);
    try { localStorage.removeItem(PAIR_KEY); } catch {}
    setShowSettings(false);
  };

  const page = dark ? "bg-[#0a0a0a] text-zinc-100" : "bg-[#fafaf7] text-zinc-900";
  const surface = dark ? "bg-zinc-950 border-zinc-800/80" : "bg-white border-zinc-200/80";
  const subtle = dark ? "text-zinc-400" : "text-zinc-600";
  const muted = dark ? "text-zinc-500" : "text-zinc-500";
  const hairline = dark ? "border-zinc-800/80" : "border-zinc-200/80";
  const iconBtn = dark
    ? "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300"
    : "border-zinc-200 hover:border-zinc-300 hover:bg-white text-zinc-700";

  return (
    <div className={`min-h-screen ${page} antialiased selection:bg-emerald-500/30 selection:text-inherit`}>
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

      <header className={`sticky top-0 z-40 border-b ${hairline} backdrop-blur-md ${dark ? "bg-[#0a0a0a]/75" : "bg-[#fafaf7]/75"}`}>
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Link
                href="/"
                className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] font-medium ${iconBtn}`}
              >
                <ArrowLeft size={13} />
                <span className="hidden sm:inline">{isNe ? "गृह" : "Home"}</span>
              </Link>
              <div className={`hidden md:block h-6 w-px ${dark ? "bg-zinc-800" : "bg-zinc-200"}`} />
              <div className="flex items-center gap-3 min-w-0">
                <div className={`flex h-8 w-8 items-center justify-center rounded-md border ${hairline}`}>
                  <Languages size={15} />
                </div>
                <div className="leading-tight min-w-0">
                  <div className="text-[13px] font-semibold tracking-tight truncate">{t("languageConverter")}</div>
                  <div className={`text-[10px] tracking-[0.16em] uppercase ${muted}`}>
                    {LANGS[from].native} → {LANGS[to].native}
                  </div>
                </div>
              </div>
              <div className={`hidden xl:flex items-center gap-2 ml-2 pl-4 border-l ${hairline} text-[11px] ${muted}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="tracking-wide">{isNe ? "प्रत्यक्ष अनुवाद" : "Live translation"}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang(lang === "en" ? "ne" : "en")}
                className={`hidden sm:inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] font-medium ${iconBtn}`}
              >
                <Globe2 size={14} />
                <span>{LANGUAGES[lang === "en" ? "ne" : "en"].native}</span>
              </button>
              <button
                onClick={() => setReloadKey(k => k + 1)}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${iconBtn}`}
                aria-label="Reload"
                title={t("reload")}
              >
                <RefreshCw size={14} />
              </button>
              <button onClick={() => setDark(d => !d)} className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${iconBtn}`}>
                {dark ? <Sun size={15} /> : <Moon size={15} />}
              </button>
              <button onClick={() => setShowHelp(true)} className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${iconBtn}`}>
                <HelpCircle size={15} />
              </button>
              <button onClick={() => setShowSettings(true)} className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${iconBtn}`}>
                <Settings size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-end justify-between">
            <div>
              <div className={`text-[11px] uppercase tracking-[0.18em] ${muted}`}>
                {isNe ? "उपकरण · ०३" : "Utility · 03"}
              </div>
              <h1 className="mt-2 text-[28px] md:text-[32px] font-semibold tracking-tight leading-tight">
                {isNe ? "भाषा अनुवाद" : "Language Translation"}
              </h1>
            </div>
            <button
              onClick={() => setExpanded(e => !e)}
              className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] font-medium ${iconBtn}`}
            >
              {expanded ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
              {expanded ? t("collapse") : t("expand")}
            </button>
          </div>

          <div className={`overflow-hidden rounded-xl border ${hairline} ${surface}`}>
            {/* Selectors row */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-stretch">
              <LanguageSelect
                label={t("from")}
                value={from}
                onChange={(c) => setFrom(c)}
                exclude={to}
                muted={muted}
                hairline={hairline}
                dark={dark}
              />
              <div className={`flex items-center justify-center px-4 py-3 md:py-0 border-y md:border-y-0 md:border-x ${hairline}`}>
                <button
                  onClick={handleSwap}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${iconBtn} rotate-90 md:rotate-0 transition hover:border-emerald-500/50`}
                  aria-label="Swap"
                  title="Swap"
                >
                  <ArrowLeftRight size={15} />
                </button>
              </div>
              <LanguageSelect
                label={t("to")}
                value={to}
                onChange={(c) => setTo(c)}
                exclude={from}
                muted={muted}
                hairline={hairline}
                dark={dark}
              />
            </div>

            {/* Iframe panel */}
            <div className={`border-t ${hairline} p-3 ${dark ? "bg-zinc-950/60" : "bg-zinc-50/60"}`}>
              <div className={`relative overflow-hidden rounded-md border ${hairline} bg-white`}>
                {iframeLoading && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white">
                    <div className="flex items-center gap-2 text-[12px] text-zinc-500">
                      <RefreshCw size={13} className="animate-spin" />
                      {isNe ? "लोड हुँदैछ..." : "Loading translator..."}
                    </div>
                  </div>
                )}
                <iframe
                  key={reloadKey}
                  src={iframeSrc}
                  allow="clipboard-read; clipboard-write"
                  width="100%"
                  height={expanded ? 900 : 600}
                  style={{ border: 0, display: "block" }}
                  title="Translator"
                  loading="lazy"
                  onLoad={() => setIframeLoading(false)}
                />
              </div>
              <div className={`mt-3 flex items-center justify-between text-[11px] ${muted}`}>
                <span className="flex items-center gap-2">
                  <Info size={12} /> {t("embeddedService")}
                </span>
                <a
                  href={iframeSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-emerald-600 hover:text-emerald-500 transition dark:text-emerald-400"
                >
                  {t("openInNewTab")} <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </div>

          {/* Quick pairs */}
          <div className={`rounded-xl border ${hairline} ${surface}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${hairline}`}>
              <div className="flex items-center gap-2">
                <Languages size={14} className={muted} />
                <h3 className="text-[12px] font-semibold tracking-wide uppercase">{t("quickPairs")}</h3>
              </div>
              <span className={`text-[10px] uppercase tracking-[0.16em] ${muted}`}>{t("oneTapPresets")}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px">
              {([
                ["ne", "en"], ["en", "ne"], ["ne", "hi"], ["hi", "ne"],
                ["en", "es"], ["en", "fr"], ["en", "zh"], ["en", "ja"],
              ] as Array<[LangCode, LangCode]>).map(([f, ts]) => {
                const isActive = from === f && to === ts;
                return (
                  <button
                    key={`${f}-${ts}`}
                    onClick={() => { setFrom(f); setTo(ts); }}
                    className={`group relative flex flex-col items-start gap-1 p-4 text-left transition ${
                      isActive
                        ? (dark ? "bg-emerald-500/10" : "bg-emerald-50")
                        : `${dark ? "hover:bg-zinc-900/60" : "hover:bg-zinc-50"}`
                    }`}
                  >
                    {isActive && <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r bg-emerald-500" />}
                    <div className="flex items-center gap-1.5 text-[12px] font-medium">
                      <span className="text-base leading-none">{LANGS[f].flag}</span>
                      <span>{LANGS[f].label}</span>
                      <span className={muted}>→</span>
                      <span className="text-base leading-none">{LANGS[ts].flag}</span>
                      <span>{LANGS[ts].label}</span>
                    </div>
                    <p className={`text-[11px] ${muted}`}>{LANGS[f].native} → {LANGS[ts].native}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Insight */}
          <div className={`grid md:grid-cols-[auto_1fr] gap-6 rounded-xl border ${hairline} ${surface} p-6`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-md border ${hairline}`}>
              <Languages size={16} />
            </div>
            <div>
              <div className={`text-[11px] uppercase tracking-[0.16em] ${muted}`}>{t("languageInsight")}</div>
              <p className={`mt-2 text-[14px] leading-relaxed ${subtle}`}>{t("languageInsightDesc")}</p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className={`rounded-xl border ${hairline} ${surface}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${hairline}`}>
              <h3 className="text-[12px] font-semibold tracking-wide uppercase">{t("howItWorks")}</h3>
            </div>
            <ol className="p-3 space-y-1">
              {[
                isNe ? "स्रोत र लक्षित भाषाहरू चयन गर्नुहोस्।" : "Pick the source and target languages.",
                isNe ? "एम्बेड गरिएको अनुवादक पैनलमा टेक्स्ट टाइप गर्नुहोस्।" : "Type or paste text in the translator panel.",
                isNe ? "दिशा फिपाउन Swap प्रयोग गर्नुहोस्।" : "Use Swap to flip direction without retyping.",
                isNe ? "एम्बेड अनुत्तरदायी भएमा पुनः लोड गर्नुहोस्।" : "Reload if the embed becomes unresponsive.",
              ].map((item, i) => (
                <li key={item} className={`flex items-start gap-3 rounded-lg px-3 py-2.5 text-[12.5px] leading-relaxed ${dark ? "hover:bg-zinc-900/60" : "hover:bg-zinc-50"}`}>
                  <span className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] tabular-nums font-medium ${hairline} ${muted}`}>
                    {i + 1}
                  </span>
                  <span className={subtle}>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className={`rounded-xl border ${hairline} ${surface} p-5`}>
            <div className={`text-[11px] uppercase tracking-[0.16em] ${muted}`}>
              {isNe ? "अन्य उपकरण" : "More utilities"}
            </div>
            <div className="mt-3 space-y-2">
              <CrossLink href="/convert_date" label={isNe ? "मिति रूपान्तरण" : "Date Converter"} sub="01" hairline={hairline} dark={dark} />
              <CrossLink href="/convert_currency" label={isNe ? "मुद्रा रूपान्तरण" : "Currency Converter"} sub="02" hairline={hairline} dark={dark} />
              <CrossLink href="/world_time" label={isNe ? "विश्व समय" : "World Time"} sub="04" hairline={hairline} dark={dark} />
            </div>
          </div>
        </aside>
      </main>

      <footer className={`border-t ${hairline} mt-8`}>
        <div className="mx-auto max-w-6xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className={`text-[11px] tracking-wide ${muted}`} suppressHydrationWarning>
            © {new Date().getFullYear()} · {t("siteName")}
          </p>
          <p className={`text-[11px] ${muted}`}>
            {isNe ? "basiconlinetools.com द्वारा संचालित" : "Powered by basiconlinetools.com"}
          </p>
        </div>
      </footer>

      <ActionModal open={showHelp} onClose={() => setShowHelp(false)} title={t("languageHelp")} dark={dark}>
        <p>{t("languageHelpDesc1")}</p>
        <p>{t("languageHelpDesc2")}</p>
      </ActionModal>

      <ActionModal open={showSettings} onClose={() => setShowSettings(false)} title={t("languageSettings")} dark={dark}>
        <div className={`flex items-center gap-3 px-3 py-2 border rounded-lg ${hairline}`}>
          <Globe2 size={16} />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="bg-transparent outline-none text-sm font-semibold flex-1 cursor-pointer"
          >
            {Object.entries(LANGUAGES).map(([code, info]) => (
              <option key={code} value={code} className={dark ? "bg-zinc-900 text-white" : "bg-white text-zinc-800"}>
                {info.label} · {info.native}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setDark(d => !d)}
          className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold ${dark ? "border-zinc-800 hover:bg-zinc-900" : "border-zinc-200 hover:bg-zinc-50"}`}
        >
          {t("toggleTheme")}
        </button>
        <button
          type="button"
          onClick={resetPreferences}
          className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold ${dark ? "border-zinc-800 hover:bg-zinc-900" : "border-zinc-200 hover:bg-zinc-50"}`}
        >
          {t("resetLanguagePreferences")}
        </button>
      </ActionModal>
    </div>
  );
}

function LanguageSelect({
  label, value, onChange, exclude, muted, dark,
}: {
  label: string;
  value: LangCode;
  onChange: (c: LangCode) => void;
  exclude: LangCode;
  muted: string;
  hairline: string;
  dark: boolean;
}) {
  const info = LANGS[value];
  return (
    <div className="p-5">
      <label className={`text-[10px] font-medium uppercase tracking-[0.16em] ${muted}`}>{label}</label>
      <div className={`mt-2 relative rounded-md border ${dark ? "border-zinc-800 bg-zinc-950 hover:border-zinc-700" : "border-zinc-200 bg-white hover:border-zinc-300"} transition`}>
        <div className="flex items-center gap-3 px-3 py-2.5 pointer-events-none">
          <span className="text-2xl leading-none shrink-0">{info.flag}</span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-semibold tracking-tight">{info.label}</div>
            <div className={`text-[11px] truncate ${muted}`}>{info.native}</div>
          </div>
          <ChevronDown size={15} className="shrink-0" />
        </div>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as LangCode)}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          aria-label={label}
        >
          {LANG_CODES.filter(c => c !== exclude).map(c => (
            <option key={c} value={c}>
              {LANGS[c].flag} {LANGS[c].label} · {LANGS[c].native}
            </option>
          ))}
        </select>
      </div>
      <p className={`mt-2 text-[10px] tracking-wide ${muted}`}>
        {LANG_CODES.length - 1} {LANG_CODES.length - 1 === 1 ? "language" : "options"}
      </p>
    </div>
  );
}

function CrossLink({ href, label, sub, hairline, dark }: { href: string; label: string; sub: string; hairline: string; dark: boolean }) {
  return (
    <Link
      href={href}
      className={`group flex items-center justify-between rounded-md border ${hairline} px-3 py-2.5 transition ${dark ? "hover:bg-zinc-900" : "hover:bg-zinc-50"}`}
    >
      <div className="flex items-center gap-3">
        <span className={`text-[10px] tabular-nums tracking-widest ${dark ? "text-zinc-500" : "text-zinc-400"}`}>{sub}</span>
        <span className="text-[13px] font-medium">{label}</span>
      </div>
      <ArrowUpRight size={14} className="transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-500" />
    </Link>
  );
}
