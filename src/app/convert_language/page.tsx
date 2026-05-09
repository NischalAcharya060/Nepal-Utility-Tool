"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useMemo, useState } from "react";
import { THEME_KEY } from "@/lib/theme";
import ActionModal from "@/components/ui/ActionModal";
import {
  Languages, ArrowLeftRight, RefreshCw, Maximize2, Minimize2,
  HelpCircle, Settings, Sun, Moon, Globe, ExternalLink, Info
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
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [from, setFrom] = useState<LangCode>("ne");
  const [to, setTo] = useState<LangCode>("en");
  const [expanded, setExpanded] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

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

  const handleSwap = () => {
    if (from === to) return;
    setFrom(to);
    setTo(from);
  };

  const resetPreferences = () => {
    setFrom("ne");
    setTo("en");
    setExpanded(false);
    try {
      localStorage.removeItem(PAIR_KEY);
    } catch {}
    setShowSettings(false);
  };

  const themeBg = dark ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-800";
  const cardBg = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const inputBg = dark
    ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-sky-400 focus:ring-sky-400/20"
    : "bg-white border-slate-200 focus:border-sky-500 focus:ring-sky-500/10";
  const mutedText = dark ? "text-slate-400" : "text-slate-500";
  const headerBg = dark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200";
  const subtleSurface = dark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50/50 border-slate-100";

  return (
    <div className={`min-h-screen ${themeBg} font-sans selection:bg-sky-100 transition-colors`}>
      <header className={`${headerBg} border-b px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur`}>
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold tracking-tighter uppercase flex items-center gap-2">
            <Languages className="text-sky-500" size={20} />
            Language Converter
          </h1>
          <div className={`hidden md:flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest ${mutedText}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {LANGS[from].native} → {LANGS[to].native}
          </div>
        </div>
        <div className={`flex items-center gap-2 ${mutedText}`}>
          <button
            onClick={() => setReloadKey(k => k + 1)}
            className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors"
            aria-label="Reload"
            title="Reload translator"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors"
            aria-label="Toggle theme"
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
            <div className={`p-6 border-b ${dark ? "border-slate-800" : "border-slate-100"} flex items-center justify-between gap-4 flex-wrap`}>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-sky-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Live Translation</span>
              </div>
              <button
                onClick={() => setExpanded(e => !e)}
                className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase hover:bg-sky-500/10 px-3 py-2 rounded-lg transition-all"
                title={expanded ? "Collapse" : "Expand"}
              >
                {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                {expanded ? "Collapse" : "Expand"}
              </button>
            </div>

            <div className="p-8 grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-end gap-3">
              <LanguageSelect
                label="From"
                value={from}
                onChange={(c) => setFrom(c)}
                exclude={to}
                inputBg={inputBg}
                mutedText={mutedText}
              />
              <button
                onClick={handleSwap}
                className="p-4 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-200 transition-all active:scale-90 mx-auto rotate-90 md:rotate-0 md:mb-1"
                aria-label="Swap languages"
                title="Swap"
              >
                <ArrowLeftRight size={18} />
              </button>
              <LanguageSelect
                label="To"
                value={to}
                onChange={(c) => setTo(c)}
                exclude={from}
                inputBg={inputBg}
                mutedText={mutedText}
              />
            </div>

            <div className={`${dark ? "bg-slate-900/80 border-slate-800" : "bg-slate-50/80 border-slate-100"} border-t`}>
              <div className="p-2">
                <div className={`rounded-xl overflow-hidden border ${dark ? "border-slate-800" : "border-slate-200"} bg-white`}>
                  <iframe
                    key={reloadKey}
                    src={iframeSrc}
                    allow="clipboard-read; clipboard-write"
                    width="100%"
                    height={expanded ? 900 : 600}
                    style={{ border: 0, display: "block" }}
                    title="Translator"
                    loading="lazy"
                  />
                </div>
              </div>
              <div className={`px-6 py-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>
                <span className="flex items-center gap-2">
                  <Info size={12} /> Embedded service · basiconlinetools.com
                </span>
                <a
                  href={iframeSrc}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sky-600 hover:underline"
                >
                  Open in new tab <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-2xl border shadow-sm p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Languages size={16} className="text-sky-500" />
                Quick Pairs
              </h3>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>One-tap presets</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {([
                ["ne", "en"], ["en", "ne"], ["ne", "hi"], ["hi", "ne"],
                ["en", "es"], ["en", "fr"], ["en", "zh"], ["en", "ja"],
              ] as Array<[LangCode, LangCode]>).map(([f, t]) => {
                const isActive = from === f && to === t;
                return (
                  <button
                    key={`${f}-${t}`}
                    onClick={() => { setFrom(f); setTo(t); }}
                    className={`p-3 rounded-xl border text-left transition-all ${isActive
                      ? "border-sky-500 bg-sky-500/10"
                      : `${subtleSurface} hover:border-sky-300`}`}
                  >
                    <div className="text-xs font-bold mb-1">
                      {LANGS[f].flag} {LANGS[f].label} → {LANGS[t].flag} {LANGS[t].label}
                    </div>
                    <p className={`text-[11px] font-semibold ${mutedText}`}>
                      {LANGS[f].native} → {LANGS[t].native}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className={`${cardBg} p-6 rounded-2xl border shadow-sm`}>
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Info size={16} className="text-sky-500" />
              How it works
            </h3>
            <ul className="space-y-3">
              {[
                "Pick the source and target languages from the selectors above.",
                "Type or paste text in the embedded translator panel.",
                "Use Swap to flip direction without retyping.",
                "Reload if the embed becomes unresponsive.",
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
              src="https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=600"
              className="absolute inset-0 h-full w-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-[2s]"
              alt="Languages"
            />
            <div className="relative z-20 space-y-3">
              <div className="w-8 h-1 bg-sky-500 rounded-full" />
              <p className="text-[10px] font-bold uppercase text-sky-400 tracking-[0.2em]">Language Insight</p>
              <p className="text-sm leading-relaxed text-slate-200 font-medium">
                Translation runs in a sandboxed embed from basiconlinetools.com. Your text stays inside that frame — we never read or store it.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className={`max-w-6xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] border-t mt-8 ${dark ? "border-slate-800 text-slate-500" : "border-slate-100 text-slate-400"}`}>
        <p suppressHydrationWarning>© {new Date().getFullYear()} Language Converter</p>
        <p>Powered by basiconlinetools.com</p>
      </footer>

      <ActionModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Language Help"
        dark={dark}
      >
        <p>Select your source and target language, then type inside the embedded translator panel.</p>
        <p>Use quick-pairs for one-tap language combinations and Reload if the embed becomes unresponsive.</p>
      </ActionModal>

      <ActionModal
        open={showSettings}
        onClose={() => setShowSettings(false)}
        title="Language Settings"
        dark={dark}
      >
        <button
          type="button"
          onClick={() => setDark(d => !d)}
          className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold ${dark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"}`}
        >
          Toggle theme
        </button>
        <button
          type="button"
          onClick={resetPreferences}
          className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold ${dark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"}`}
        >
          Reset language preferences
        </button>
      </ActionModal>
    </div>
  );
}

function LanguageSelect({
  label, value, onChange, exclude, inputBg, mutedText,
}: {
  label: string;
  value: LangCode;
  onChange: (c: LangCode) => void;
  exclude: LangCode;
  inputBg: string;
  mutedText: string;
}) {
  return (
    <div className="space-y-2">
      <label className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as LangCode)}
          className={`w-full border ${inputBg} rounded-xl p-4 text-sm outline-none focus:ring-4 transition-all font-medium appearance-none cursor-pointer pr-10`}
        >
          {LANG_CODES.filter(c => c !== exclude).map(c => (
            <option key={c} value={c}>
              {LANGS[c].flag} {LANGS[c].label} · {LANGS[c].native}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
