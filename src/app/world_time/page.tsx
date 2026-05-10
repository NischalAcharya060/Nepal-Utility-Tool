"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { THEME_KEY } from "@/lib/theme";
import { LANGUAGES, type Language } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n-context";
import ActionModal from "@/components/ui/ActionModal";
import {
  Clock, Globe2, Sun, Moon, HelpCircle, Settings,
  Copy, Check, Search, Star, History, Download, Trash2,
  ArrowUpRight, ArrowLeft,
} from "lucide-react";

type TimezoneEntry = {
  id: number;
  name: string;
  label: string;
  offset: number;
  region: string;
  city: string;
  time: string;
  date: string;
  diff: string;
};

const POPULAR_CITIES = [
  { name: "America/New_York", label: "New York", region: "Americas", flag: "US" },
  { name: "America/Los_Angeles", label: "Los Angeles", region: "Americas", flag: "US" },
  { name: "Europe/London", label: "London", region: "Europe", flag: "GB" },
  { name: "Europe/Paris", label: "Paris", region: "Europe", flag: "FR" },
  { name: "Asia/Dubai", label: "Dubai", region: "Asia", flag: "AE" },
  { name: "Asia/Kolkata", label: "Mumbai", region: "Asia", flag: "IN" },
  { name: "Asia/Shanghai", label: "Shanghai", region: "Asia", flag: "CN" },
  { name: "Asia/Tokyo", label: "Tokyo", region: "Asia", flag: "JP" },
  { name: "Asia/Singapore", label: "Singapore", region: "Asia", flag: "SG" },
  { name: "Australia/Sydney", label: "Sydney", region: "Oceania", flag: "AU" },
  { name: "Pacific/Auckland", label: "Auckland", region: "Oceania", flag: "NZ" },
  { name: "Asia/Kathmandu", label: "Kathmandu", region: "Asia", flag: "NP" },
];

const HISTORY_KEY = "nwt_history_v1";
const FAVS_KEY = "nwt_favs_v1";

const getTimezoneOffset = (tzName: string): number => {
  try {
    const now = new Date();
    const utc = new Date(now.toLocaleString("en-US", { timeZone: "UTC" }));
    const local = new Date(now.toLocaleString("en-US", { timeZone: tzName }));
    return (local.getTime() - utc.getTime()) / (1000 * 60);
  } catch {
    return 0;
  }
};

const formatOffset = (offsetMinutes: number): string => {
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const abs = Math.abs(offsetMinutes);
  const hours = Math.floor(abs / 60);
  const mins = abs % 60;
  return `UTC${sign}${hours}${mins ? `:${mins.toString().padStart(2, "0")}` : ""}`;
};

const getRelativeDiff = (offsetMinutes: number, isNe: boolean): string => {
  const diff = offsetMinutes - 345;
  if (diff === 0) return isNe ? "अहिले" : "now";
  const hours = Math.abs(Math.floor(diff / 60));
  const mins = Math.abs(diff % 60);
  const label = hours > 0 ? `${hours}h` : "";
  const mlabel = mins > 0 ? `${mins}m` : "";
  if (diff > 0) return isNe ? `+${label}${mlabel}` : `+${label}${mlabel}`;
  return isNe ? `-${label}${mlabel}` : `-${label}${mlabel}`;
};

const FLAGS: Record<string, string> = {
  US: "🇺🇸", GB: "🇬🇧", FR: "🇫🇷", AE: "🇦🇪", IN: "🇮🇳", CN: "🇨🇳",
  JP: "🇯🇵", SG: "🇸🇬", AU: "🇦🇺", NZ: "🇳🇿", NP: "🇳🇵",
};

export default function WorldTime() {
  const { lang, setLang, t } = useI18n();
  const [dark, setDark] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<string[]>([]);
  const [history, setHistory] = useState<TimezoneEntry[]>([]);
  const [copied, setCopied] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const isNe = lang === "ne";

  useEffect(() => {
    try {
      const theme = localStorage.getItem(THEME_KEY);
      if (theme === "dark") setDark(true);
      const f = localStorage.getItem(FAVS_KEY);
      if (f) setFavorites(JSON.parse(f));
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch {}
  }, [dark]);

  useEffect(() => {
    try { localStorage.setItem(FAVS_KEY, JSON.stringify(favorites)); } catch {}
  }, [favorites]);

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 25))); } catch {}
  }, [history]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearch("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const kathmanduOffset = useMemo(() => getTimezoneOffset("Asia/Kathmandu"), []);

  const filteredCities = useMemo(() => {
    if (!search.trim()) return POPULAR_CITIES;
    const q = search.toLowerCase();
    return POPULAR_CITIES.filter(c =>
      c.label.toLowerCase().includes(q) ||
      c.region.toLowerCase().includes(q) ||
      c.name.toLowerCase().includes(q)
    );
  }, [search]);

  const handleCopyTime = async (city: typeof POPULAR_CITIES[0]) => {
    try {
      const time = currentTime.toLocaleString("en-US", {
        timeZone: city.name,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      await navigator.clipboard.writeText(time);
      setCopied(true);
      const offset = getTimezoneOffset(city.name);
      const entry: TimezoneEntry = {
        id: Date.now(),
        name: city.name,
        label: city.label,
        offset,
        region: city.region,
        city: city.label,
        time,
        date: currentTime.toLocaleDateString("en-US", { timeZone: city.name, weekday: "short", month: "short", day: "numeric" }),
        diff: getRelativeDiff(offset, isNe),
      };
      setHistory(h => [entry, ...h.filter(e => e.name !== city.name)].slice(0, 24));
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const toggleFavorite = (tzName: string) => {
    setFavorites(f => f.includes(tzName) ? f.filter(n => n !== tzName) : [tzName, ...f].slice(0, 12));
  };

  const exportCSV = () => {
    if (history.length === 0) return;
    const rows = [["City", "Timezone", "Time", "Date", "UTC Offset", "Diff from KTM"]];
    history.forEach(h => rows.push([h.label, h.name, h.time, h.date, formatOffset(h.offset), h.diff]));
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `world-time-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearToolData = () => {
    setHistory([]);
    setFavorites([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(FAVS_KEY);
    } catch {}
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
                  <Clock size={15} />
                </div>
                <div className="leading-tight min-w-0">
                  <div className="text-[13px] font-semibold tracking-tight truncate">{t("worldClock")}</div>
                  <div className={`text-[10px] tracking-[0.16em] uppercase ${muted}`}>
                    {isNe ? "विश्व समय" : "World Clock"}
                  </div>
                </div>
              </div>
              <div className={`hidden lg:flex items-center gap-2 ml-2 pl-4 border-l ${hairline} text-[11px] ${muted}`}>
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span suppressHydrationWarning>
                  {isNe ? "नेपाल" : "KTM"} · {currentTime.toLocaleTimeString("en-US", { timeZone: "Asia/Kathmandu", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                </span>
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
                {isNe ? "उपकरण · ०४" : "Utility · 04"}
              </div>
              <h1 className="mt-2 text-[28px] md:text-[32px] font-semibold tracking-tight leading-tight">
                {isNe ? "विश्व समय" : "World Time"}
              </h1>
            </div>
            <span className={`hidden md:block text-[11px] uppercase tracking-[0.16em] ${muted}`}>
              {isNe ? "नेपाली समय केन्द्रित" : "Nepal-centric timezone view"}
            </span>
          </div>

          {/* Nepal clock */}
          <div className={`overflow-hidden rounded-xl border ${hairline} ${surface}`}>
            <div className={`px-6 md:px-8 py-8 border-b ${hairline}`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{FLAGS.NP}</span>
                <div>
                  <div className="text-[15px] font-semibold tracking-tight">{isNe ? "काठमाडौं" : "Kathmandu"}</div>
                  <div className={`text-[11px] ${muted}`}>Asia/Kathmandu · {formatOffset(kathmanduOffset)}</div>
                </div>
              </div>
              <div className="flex items-baseline gap-3">
                <span suppressHydrationWarning className="text-[52px] md:text-[64px] font-semibold tracking-tight tabular-nums leading-none">
                  {currentTime.toLocaleTimeString("en-US", { timeZone: "Asia/Kathmandu", hour: "2-digit", minute: "2-digit", hour12: false })}
                </span>
                <span suppressHydrationWarning className={`text-[28px] font-medium tabular-nums ${muted}`}>
                  :{currentTime.toLocaleTimeString("en-US", { timeZone: "Asia/Kathmandu", second: "2-digit", hour12: false })}
                </span>
              </div>
              <div suppressHydrationWarning className={`mt-2 text-[13px] ${subtle}`}>
                {currentTime.toLocaleDateString("en-US", { timeZone: "Asia/Kathmandu", weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>

            {/* World cities */}
            <div className="p-6 md:p-7">
              <div className={`text-[10px] font-medium uppercase tracking-[0.16em] ${muted} mb-4`}>
                {isNe ? "विश्वका मुख्य शहरहरू" : "Major World Cities"}
              </div>
              <div className="flex items-center gap-2 mb-4">
                <div className={`flex-1 flex items-center gap-2 rounded-md border px-3 py-2 ${dark ? "bg-zinc-950 border-zinc-800" : "bg-zinc-50 border-zinc-200"}`}>
                  <Search size={13} className={muted} />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={isNe ? "शहर खोज्नुहोस्..." : "Search city..."}
                    className="bg-transparent outline-none text-[13px] w-full"
                  />
                </div>
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${iconBtn}`}
                    aria-label="Clear search"
                  >
                    <span className="text-[16px] leading-none">×</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {filteredCities.map((city) => {
                  const offset = getTimezoneOffset(city.name);
                  const diff = offset - kathmanduOffset;
                  const diffLabel = getRelativeDiff(diff, isNe);
                  const isFav = favorites.includes(city.name);
                  const cityTime = currentTime.toLocaleTimeString("en-US", {
                    timeZone: city.name,
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  });
                  const cityDate = currentTime.toLocaleDateString("en-US", {
                    timeZone: city.name,
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  });
                  return (
                    <div
                      key={city.name}
                      className={`relative flex flex-col gap-1 p-4 rounded-xl border ${hairline} transition ${dark ? "hover:bg-zinc-900/60 bg-zinc-950" : "hover:bg-zinc-50 bg-white"}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xl leading-none">{FLAGS[city.flag] || "🏳️"}</span>
                          <div>
                            <div className="text-[13px] font-semibold tracking-tight leading-tight">{city.label}</div>
                            <div className={`text-[10px] ${muted}`}>{city.region}</div>
                          </div>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleFavorite(city.name); }}
                          className="p-1 rounded hover:bg-zinc-500/10"
                          aria-label="Toggle favorite"
                        >
                          <Star size={13} className={isFav ? "fill-amber-400 text-amber-400" : muted} />
                        </button>
                      </div>

                      <div className="flex items-baseline gap-1.5 mt-1">
                        <span suppressHydrationWarning className="text-[22px] font-semibold tabular-nums tracking-tight">
                          {cityTime}
                        </span>
                        <span suppressHydrationWarning className={`text-[12px] tabular-nums ${muted}`}>
                          :{currentTime.toLocaleTimeString("en-US", { timeZone: city.name, second: "2-digit", hour12: false })}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] ${muted}`}>{cityDate}</span>
                        <span className={`text-[10px] font-medium ${diff > 0 ? "text-rose-500" : diff < 0 ? "text-blue-500" : "text-emerald-500"}`}>
                          {diffLabel !== "now" && diffLabel !== "अहिले" ? diffLabel : (isNe ? "अहिले" : "now")}
                        </span>
                      </div>

                      <button
                        onClick={() => handleCopyTime(city)}
                        className={`mt-2 flex items-center justify-center gap-1.5 rounded-md py-1.5 text-[11px] font-medium transition ${
                          copied
                            ? "bg-emerald-500 text-white"
                            : dark ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-200" : "bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                        }`}
                      >
                        {copied ? <Check size={11} /> : <Copy size={11} />}
                        {copied ? (isNe ? "भयो" : "Copied") : (isNe ? "प्रतिलिपि" : "Copy")}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Insight */}
          <div className={`grid md:grid-cols-[auto_1fr] gap-6 rounded-xl border ${hairline} ${surface} p-6`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-md border ${hairline}`}>
              <Clock size={16} />
            </div>
            <div>
              <div className={`text-[11px] uppercase tracking-[0.16em] ${muted}`}>{isNe ? "समय जानकारी" : "Time Insight"}</div>
              <p className={`mt-2 text-[14px] leading-relaxed ${subtle}`}>
                {isNe
                  ? "नेपाल एकमात्र देश हो जुन UTC+5:45 मा छ। यसले भारत र बंगलादेशसँग १५-१५ मिनेटको समय भिन्नता राख्छ।"
                  : "Nepal is the only country on UTC+5:45, maintaining a 15-minute offset from both India and Bangladesh. This unique timezone was adopted in 1986."}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          <div className={`rounded-xl border ${hairline} ${surface}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${hairline}`}>
              <div className="flex items-center gap-2">
                <History size={14} className={muted} />
                <h3 className="text-[12px] font-semibold tracking-wide uppercase">{t("activityLog")}</h3>
                {history.length > 0 && (
                  <span className={`text-[10px] tabular-nums ${muted}`}>· {history.length}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={exportCSV}
                  disabled={history.length === 0}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${history.length === 0 ? "opacity-30 cursor-not-allowed" : `${muted} hover:text-emerald-500`}`}
                  aria-label="Export"
                  title="Export CSV"
                >
                  <Download size={13} />
                </button>
                <button
                  onClick={() => setHistory([])}
                  disabled={history.length === 0}
                  className={`inline-flex h-7 w-7 items-center justify-center rounded-md transition ${history.length === 0 ? "opacity-30 cursor-not-allowed" : `${muted} hover:text-rose-500`}`}
                  aria-label="Clear"
                  title="Clear"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>

            <div className="max-h-[460px] overflow-auto p-3">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full border ${hairline}`}>
                    <Clock size={16} className={muted} />
                  </div>
                  <p className={`mt-3 text-[12px] px-4 ${muted}`}>
                    {isNe ? "प्रतिलिपि गरिएका समयहरू यहाँ देखाइनेछन्।" : "Copied times will appear here."}
                  </p>
                </div>
              ) : (
                <ul>
                  {history.map((item, idx) => (
                    <li key={item.id}>
                      <div className={`rounded-lg px-3 py-3 transition ${dark ? "hover:bg-zinc-900/60" : "hover:bg-zinc-50"}`}>
                        <div className={`flex items-center justify-between text-[10px] uppercase tracking-[0.14em] ${muted} mb-1.5`}>
                          <span className="tabular-nums">{String(idx + 1).padStart(2, "0")} · {item.label}</span>
                          <span>{item.diff}</span>
                        </div>
                        <div suppressHydrationWarning className={`text-[14px] font-semibold tabular-nums ${dark ? "text-zinc-100" : "text-zinc-900"}`}>
                          {item.time}
                        </div>
                        <div className={`text-[10px] ${muted}`}>{item.date} · {formatOffset(item.offset)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className={`rounded-xl border ${hairline} ${surface} p-5`}>
            <div className={`text-[11px] uppercase tracking-[0.16em] ${muted}`}>
              {isNe ? "अन्य उपकरण" : "More utilities"}
            </div>
            <div className="mt-3 space-y-2">
              <CrossLink href="/convert_date" label={isNe ? "मिति रूपान्तरण" : "Date Converter"} sub="01" hairline={hairline} dark={dark} />
              <CrossLink href="/convert_currency" label={isNe ? "मुद्रा रूपान्तरण" : "Currency Converter"} sub="02" hairline={hairline} dark={dark} />
              <CrossLink href="/convert_language" label={isNe ? "भाषा अनुवाद" : "Language Converter"} sub="03" hairline={hairline} dark={dark} />
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
            {isNe ? "नेपाली समय" : "Nepal time"} · {formatOffset(kathmanduOffset)}
          </p>
        </div>
      </footer>

      <ActionModal open={showHelp} onClose={() => setShowHelp(false)} title={isNe ? "समय सहायता" : "Time Help"} dark={dark}>
        <p>{isNe ? "यस पृष्ठमा विश्वका मुख्य शहरहरूको वास्तविक समय हेर्न सक्नुहुन्छ।" : "View real-time clocks for major world cities."}</p>
        <p>{isNe ? "Copy बटन थिचेर समय प्रतिलिपि गर्नुहोस् र त्यो इतिहासमा सुरक्षित हुनेछ। Star चिन्हले मनपर्ने शहर थप्नुहोस्।" : "Click Copy to save a time to your history. Use the star icon to add favorites."}</p>
      </ActionModal>

      <ActionModal open={showSettings} onClose={() => setShowSettings(false)} title={isNe ? "समय सेटिङहरू" : "Time Settings"} dark={dark}>
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
          onClick={clearToolData}
          className={`w-full text-left px-3 py-2 rounded-lg border text-sm font-semibold ${dark ? "border-zinc-800 hover:bg-zinc-900" : "border-zinc-200 hover:bg-zinc-50"}`}
        >
          {isNe ? "इतिहास र मनपर्ने हटाउनुहोस्" : "Clear history and favorites"}
        </button>
      </ActionModal>
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