"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, UTILITY_HOSTED_URL } from "@/lib/site";
import { THEME_KEY } from "@/lib/theme";
import { LANGUAGES, type Language } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n-context";
import ActionModal from "@/components/ui/ActionModal";
import {
  Calendar, Wallet, Languages, ArrowRight, Sun, Moon, HelpCircle, Settings,
  Sparkles, Globe, Clock, Globe2
} from "lucide-react";

type Tool = {
  href: string;
  titleKey: string;
  tagKey: string;
  descriptionKey: string;
  icon: React.ReactNode;
  accent: string;
  available: boolean;
};

const TOOLS: Tool[] = [
  {
    href: "/convert_date",
    titleKey: "dateConverter",
    tagKey: "bsToAd",
    descriptionKey: "dateDescription",
    icon: <Calendar size={22} />,
    accent: "from-sky-500/20 to-sky-500/0",
    available: true,
  },
  {
    href: "/convert_currency",
    titleKey: "currencyConverter",
    tagKey: "live",
    descriptionKey: "currencyDescription",
    icon: <Wallet size={22} />,
    accent: "from-emerald-500/20 to-emerald-500/0",
    available: true,
  },
  {
    href: "/convert_language",
    titleKey: "languageConverter",
    tagKey: "translate",
    descriptionKey: "languageDescription",
    icon: <Languages size={22} />,
    accent: "from-violet-500/20 to-violet-500/0",
    available: true,
  },
];

const TOOL_TEXTS: Record<string, Record<Language, { title: string; tag: string; description: string }>> = {
  dateConverter: {
    en: { title: "Date Converter", tag: "BS ⇄ AD", description: "Convert between Bikram Sambat and Gregorian calendars with weekday, relative time, and Devanagari output." },
    ne: { title: "मिति रूपान्तरक", tag: "विक्रम ⇄ अंग्रेजी", description: "विक्रम संवत् र ग्रेगोरियन क्यालेन्डरहरू बीच हप्ताको दिन, सापेक्ष समय, र देवनागरी आउटपुटसहित रूपान्तरण गर्नुहोस्।" },
  },
  currencyConverter: {
    en: { title: "Currency Converter", tag: "Live Rates", description: "Live exchange rates with NPR-focused popular pairs, favorites, history, and CSV export." },
    ne: { title: "मुद्रा रूपान्तरक", tag: "लाइभ दरहरू", description: "NPR केन्द्रित लोकप्रिय जोडीहरू, मनपर्ने, इतिहास, र CSV निर्यातसहित लाइभ विनिमय दरहरू।" },
  },
  languageConverter: {
    en: { title: "Language Converter", tag: "Translate", description: "Translate between Nepali, English, Hindi and more — with quick swap and one-tap language pairs." },
    ne: { title: "भाषा रूपान्तरक", tag: "अनुवाद", description: "छिटो स्वाप र एक-ट्याप भाषा जोडीहरूसहित नेपाली, अंग्रेजी, हिन्दी र थप बीच अनुवाद गर्नुहोस्।" },
  },
};

export default function Home() {
  const { lang, setLang, t } = useI18n();
  const [dark, setDark] = useState(false);
  const [now, setNow] = useState<string>("");
  const [mounted, setMounted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const th = localStorage.getItem(THEME_KEY);
      if (th === "dark") setDark(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (!mounted) return;
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch {}
  }, [dark, mounted]);

  useEffect(() => {
    const update = () => setNow(new Date().toLocaleString(lang === "ne" ? "ne-NP" : "en-US", { dateStyle: "medium", timeStyle: "short" }));
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [lang]);

  const themeBg = dark ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-800";
  const cardBg = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const mutedText = dark ? "text-slate-400" : "text-slate-500";
  const headerBg = dark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200";
  const subtleSurface = dark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50/50 border-slate-100";
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    sameAs: [SITE_URL, UTILITY_HOSTED_URL],
    inLanguage: lang === "ne" ? "ne-NP" : "en-US",
  };

  return (
    <div className={`min-h-screen flex-1 ${themeBg} font-sans selection:bg-sky-100 transition-colors`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <header className={`${headerBg} border-b px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur`}>
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold tracking-tighter uppercase flex items-center gap-2">
            <Sparkles className="text-sky-500" size={20} />
            {t("siteName")}
          </h1>
          {mounted && now && (
            <div className={`hidden md:flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest ${mutedText}`} suppressHydrationWarning>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              {now}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 ${mutedText}`}>
          <button
            onClick={() => setLang(lang === "en" ? "ne" : "en")}
            className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors flex items-center gap-1.5 text-xs font-bold"
            aria-label="Toggle language"
            title={lang === "en" ? "नेपाली" : "English"}
          >
            <Globe2 size={18} />
            <span className="hidden sm:inline">{LANGUAGES[lang === "en" ? "ne" : "en"].native}</span>
          </button>
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors"
            aria-label="Help"
          >
            <HelpCircle size={18} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors"
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className={`${cardBg} rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md`}>
            <div className={`p-6 border-b ${dark ? "border-slate-800" : "border-slate-100"} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-sky-500" />
                <span className="text-xs font-bold uppercase tracking-widest">{t("availableTools")}</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                {TOOLS.filter(t => t.available).length} {t("tools")}
              </span>
            </div>

            <div className="p-6 md:p-8 grid gap-4 md:grid-cols-2">
              {TOOLS.map(tool => {
                const texts = TOOL_TEXTS[tool.titleKey][lang];
                return (
                  <Link
                    key={tool.href}
                    href={tool.href}
                    className={`group relative overflow-hidden rounded-2xl border ${subtleSurface} p-6 transition-all hover:-translate-y-1 hover:shadow-lg hover:border-sky-300`}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${tool.accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
                    <div className="relative space-y-4">
                      <div className="flex items-start justify-between">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dark ? "bg-slate-800 text-sky-400" : "bg-sky-50 text-sky-600"}`}>
                          {tool.icon}
                        </div>
                        <span className={`text-[9px] font-bold px-2 py-1 rounded-full uppercase tracking-widest ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                          {texts.tag}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <h3 className={`text-lg font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>
                          {texts.title}
                        </h3>
                        <p className={`text-xs leading-relaxed ${mutedText}`}>
                          {texts.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-sky-600 group-hover:gap-3 transition-all">
                        {t("openTool")} <ArrowRight size={14} />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl border shadow-sm p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Clock size={16} className="text-sky-500" />
                {t("whyThisExists")}
              </h3>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>{t("builtForNepal")}</span>
            </div>
            <p className={`text-sm leading-relaxed ${mutedText}`}>
              {t("whyThisExistsDesc")}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${cardBg} p-6 rounded-2xl border shadow-sm`}>
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" />
              {t("quickHighlights")}
            </h3>
            <ul className="space-y-3">
              {[
                t("bsDatesSupport"),
                t("liveFxRates"),
                t("activityLogExport"),
                t("keyboardFirst"),
              ].map(item => (
                <li key={item} className={`flex gap-3 text-xs leading-relaxed ${mutedText}`}>
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 aspect-square flex flex-col justify-end group">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1544984243-ec57ea16fe25?auto=format&fit=crop&q=80&w=600"
              className="absolute inset-0 h-full w-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-[2s]"
              alt="Nepal"
            />
            <div className="relative z-20 space-y-3">
              <div className="w-8 h-1 bg-sky-500 rounded-full" />
              <p className="text-[10px] font-bold uppercase text-sky-400 tracking-[0.2em]">{lang === "ne" ? "स्थानीय अन्तरदृष्टि" : "Local Insight"}</p>
              <p className="text-sm leading-relaxed text-slate-200 font-medium">
                {lang === "ne"
                  ? "विक्रम संवत् क्यालेन्डरदेखि दैनिक NPR विनिमय स्विङसम्म — यी उपकरणहरूले नेपालले पहिले नै प्रयोग गर्ने भाषा बोल्छन्।"
                  : "From the Bikram Sambat calendar to the daily NPR exchange swing — these tools speak the language Nepal already uses."}
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className={`max-w-6xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] border-t mt-8 ${dark ? "border-slate-800 text-slate-500" : "border-slate-100 text-slate-400"}`}>
        <p suppressHydrationWarning>© {new Date().getFullYear()} {t("siteName")}</p>
        <p>{t("craftedWithCare")}</p>
      </footer>

      <ActionModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title={t("quickHelp")}
        dark={dark}
      >
        <p>{t("useMainCards")}</p>
        <p>{t("toolSpecificHistory")}</p>
      </ActionModal>

      <ActionModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title={t("homeSettings")}
        dark={dark}
      >
        <div className="flex items-center gap-3 px-3 py-2 border rounded-lg">
          <Globe2 size={16} />
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as Language)}
            className="bg-transparent outline-none text-sm font-semibold flex-1 cursor-pointer"
          >
            {Object.entries(LANGUAGES).map(([code, info]) => (
              <option key={code} value={code} className={dark ? "bg-slate-900 text-white" : "bg-white text-slate-800"}>
                {info.label} · {info.native}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={() => setDark(d => !d)}
          className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold ${dark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"}`}
        >
          {t("toggleTheme")}
        </button>
        <button
          type="button"
          onClick={() => {
            setDark(false);
            try { localStorage.removeItem(THEME_KEY); } catch {}
            setShowSettings(false);
          }}
          className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold ${dark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"}`}
        >
          {t("resetThemePreference")}
        </button>
      </ActionModal>
    </div>
  );
}