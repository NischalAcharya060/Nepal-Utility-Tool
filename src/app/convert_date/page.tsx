"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useState, useEffect, useMemo, useCallback } from "react";
import BikramSambat from "bikram-sambat";
import { THEME_KEY } from "@/lib/theme";
import { LANGUAGES, type Language } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n-context";
import ActionModal from "@/components/ui/ActionModal";
import {
  History, RotateCw, Copy, Share2, Calendar, Info, HelpCircle, Settings,
  Clock, ArrowLeftRight, Download, Trash2, ChevronLeft, ChevronRight,
  Check, Sun, Moon, Globe2, ArrowUpRight, ArrowLeft,
} from "lucide-react";

type Mode = "BS to AD" | "AD to BS";

type Conversion = {
  id: number;
  from: string;
  to: string;
  type: Mode;
  time: string;
  iso: string;
};

type ConvertResult = {
  date: string;
  detail: string;
  diff: string;
  weekday: string;
  nepali: string;
  iso: string;
};

const BS_MONTHS = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const BS_MONTHS_NE = [
  "बैशाख", "जेठ", "असार", "साउन", "भदौ", "असोज",
  "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुन", "चैत"
];

const AD_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const WEEKDAYS_NE = ["आइतबार", "सोमबार", "मंगलबार", "बुधबार", "बिहीबार", "शुक्रबार", "शनिबार"];

const HISTORY_KEY = "ndc_history_v1";

const pad = (n: number) => (n > 9 ? String(n) : "0" + n);

const toDevanagariDigits = (input: string | number) =>
  String(input).replace(/[0-9]/g, (d) => "०१२३४५६७८९"[Number(d)]);

const adDaysInMonth = (year: number, month: number) => new Date(year, month, 0).getDate();

const bsToAd = (y: number, m: number, d: number) => {
  const g = BikramSambat.toGreg(y, m, d);
  return new Date(g.year, g.month - 1, g.day);
};

const adToBs = (date: Date) => {
  const iso = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return BikramSambat.toBik(iso);
};

export default function TemporalPrecisionConverter() {
  const { lang, setLang, t } = useI18n();
  const [mode, setMode] = useState<Mode>("BS to AD");
  const [year, setYear] = useState(2083);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(15);
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [history, setHistory] = useState<Conversion[]>([]);
  const [error, setError] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [dark, setDark] = useState(false);
  const [todayBS, setTodayBS] = useState<string>("");
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const isNe = lang === "ne";

  const maxDay = useMemo(() => {
    try {
      if (mode === "BS to AD") return BikramSambat.daysInMonth(year, month);
      return adDaysInMonth(year, month);
    } catch {
      return 32;
    }
  }, [mode, year, month]);

  useEffect(() => {
    try {
      const bs = adToBs(new Date());
      setTodayBS(`${bs.year} ${BS_MONTHS[bs.month - 1]} ${bs.day}`);
    } catch {
      setTodayBS("");
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
      const theme = localStorage.getItem(THEME_KEY);
      if (theme === "dark") setDark(true);
    } catch {}
  }, []);

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 25))); } catch {}
  }, [history]);

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch {}
  }, [dark]);

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
    if (day < 1) setDay(1);
  }, [maxDay]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSetToday = () => {
    const now = new Date();
    setError("");
    if (mode === "AD to BS") {
      setYear(now.getFullYear());
      setMonth(now.getMonth() + 1);
      setDay(now.getDate());
    } else {
      try {
        const bs = adToBs(now);
        setYear(bs.year);
        setMonth(bs.month);
        setDay(bs.day);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Unable to load today's date");
      }
    }
  };

  const handleSwap = () => {
    if (!result) {
      setMode((m) => (m === "BS to AD" ? "AD to BS" : "BS to AD"));
      setResult(null);
      setError("");
      return;
    }
    try {
      if (mode === "BS to AD") {
        const ad = bsToAd(year, month, day);
        setMode("AD to BS");
        setYear(ad.getFullYear());
        setMonth(ad.getMonth() + 1);
        setDay(ad.getDate());
      } else {
        const bs = adToBs(new Date(year, month - 1, day));
        setMode("BS to AD");
        setYear(bs.year);
        setMonth(bs.month);
        setDay(bs.day);
      }
      setResult(null);
      setError("");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Cannot swap this date");
    }
  };

  const stepDay = (delta: number) => {
    setError("");
    let nd = day + delta;
    let nm = month;
    let ny = year;
    const limit = mode === "BS to AD"
      ? (() => { try { return BikramSambat.daysInMonth(ny, nm); } catch { return 30; } })()
      : adDaysInMonth(ny, nm);
    if (nd > limit) {
      nd = 1;
      nm += 1;
      if (nm > 12) { nm = 1; ny += 1; }
    } else if (nd < 1) {
      nm -= 1;
      if (nm < 1) { nm = 12; ny -= 1; }
      const newLimit = mode === "BS to AD"
        ? (() => { try { return BikramSambat.daysInMonth(ny, nm); } catch { return 30; } })()
        : adDaysInMonth(ny, nm);
      nd = newLimit;
    }
    setYear(ny); setMonth(nm); setDay(nd);
  };

  const getRelativeTime = (targetAdDate: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = targetAdDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return isNe ? "आज" : "Today";
    if (diffDays === 1) return isNe ? "भोलि" : "Tomorrow";
    if (diffDays === -1) return isNe ? "हिजो" : "Yesterday";
    return diffDays > 0
      ? (isNe ? `${diffDays} दिनमा` : `In ${diffDays} days`)
      : (isNe ? `${Math.abs(diffDays)} दिनअघि` : `${Math.abs(diffDays)} days ago`);
  };

  const handleConvert = useCallback(() => {
    setError("");
    setCopied(false);
    try {
      let convertedDate = "";
      let nepali = "";
      let targetDateObj: Date;
      let isoOut = "";

      if (mode === "BS to AD") {
        if (day < 1 || day > BikramSambat.daysInMonth(year, month)) {
          throw new Error(`Day must be between 1 and ${BikramSambat.daysInMonth(year, month)} for ${BS_MONTHS[month - 1]} ${year}`);
        }
        targetDateObj = bsToAd(year, month, day);
        convertedDate = `${targetDateObj.getFullYear()}-${pad(targetDateObj.getMonth() + 1)}-${pad(targetDateObj.getDate())} AD`;
        nepali = `${toDevanagariDigits(year)} ${BS_MONTHS_NE[month - 1]} ${toDevanagariDigits(day)}`;
        isoOut = `${targetDateObj.getFullYear()}-${pad(targetDateObj.getMonth() + 1)}-${pad(targetDateObj.getDate())}`;
      } else {
        const limit = adDaysInMonth(year, month);
        if (day < 1 || day > limit) {
          throw new Error(`Day must be between 1 and ${limit} for ${AD_MONTHS[month - 1]} ${year}`);
        }
        targetDateObj = new Date(year, month - 1, day);
        const bs = adToBs(targetDateObj);
        convertedDate = `${bs.year} ${BS_MONTHS[bs.month - 1]} ${bs.day} BS`;
        nepali = `${toDevanagariDigits(bs.year)} ${BS_MONTHS_NE[bs.month - 1]} ${toDevanagariDigits(bs.day)}`;
        isoOut = `${bs.year}-${pad(bs.month)}-${pad(bs.day)}`;
      }

      const weekdayEn = targetDateObj.toLocaleDateString("en-US", { weekday: "long" });
      const weekdayNe = WEEKDAYS_NE[targetDateObj.getDay()];

      setResult({
        date: convertedDate,
        detail: targetDateObj.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
        diff: getRelativeTime(targetDateObj),
        weekday: `${weekdayEn} · ${weekdayNe}`,
        nepali,
        iso: isoOut,
      });

      const fromLabel = `${year} ${mode === "BS to AD" ? BS_MONTHS[month - 1] : AD_MONTHS[month - 1]} ${day}`;
      const newEntry: Conversion = {
        id: Date.now(),
        from: fromLabel,
        to: convertedDate,
        type: mode,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        iso: isoOut,
      };
      setHistory((h) => [newEntry, ...h.filter(e => !(e.from === fromLabel && e.type === mode)).slice(0, 24)]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Invalid date for the chosen calendar.";
      setError(msg);
      setResult(null);
    }
  }, [mode, year, month, day, isNe]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" && (e.target as HTMLElement)?.tagName !== "TEXTAREA") {
        handleConvert();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleConvert]);

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.date);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Clipboard not available");
    }
  };

  const handleShare = async () => {
    if (!result) return;
    const text = `${result.date}  (${result.weekday})`;
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (d: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (d: ShareData) => Promise<void> }).share({ title: "Date Conversion", text });
        return;
      } catch { /* fall through */ }
    }
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Sharing not available");
    }
  };

  const exportCSV = () => {
    if (history.length === 0) return;
    const rows = [["Type", "From", "To", "ISO", "Time"]];
    history.forEach(h => rows.push([h.type, h.from, h.to, h.iso, h.time]));
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `date-conversions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearToolData = () => {
    setHistory([]);
    setResult(null);
    setError("");
    try {
      localStorage.removeItem(HISTORY_KEY);
    } catch {}
    setShowSettings(false);
  };

  const switchMode = (next: Mode) => {
    if (next === mode) return;
    setMode(next);
    setResult(null);
    setError("");
    if (next === "BS to AD") setYear(2083);
    else setYear(2026);
    setMonth(1);
    setDay(15);
  };

  const months = mode === "BS to AD" ? BS_MONTHS : AD_MONTHS;
  const yearMin = mode === "BS to AD" ? 1970 : 1913;
  const yearMax = mode === "BS to AD" ? 2099 : 2043;

  // Editorial palette: paper-white / near-black + emerald accent
  const page = dark ? "bg-[#0a0a0a] text-zinc-100" : "bg-[#fafaf7] text-zinc-900";
  const surface = dark ? "bg-zinc-950 border-zinc-800/80" : "bg-white border-zinc-200/80";
  const subtle = dark ? "text-zinc-400" : "text-zinc-600";
  const muted = dark ? "text-zinc-500" : "text-zinc-500";
  const hairline = dark ? "border-zinc-800/80" : "border-zinc-200/80";
  const inputCls = dark
    ? "bg-zinc-950 border-zinc-800 text-zinc-100 focus:border-emerald-500/60 focus:ring-emerald-500/15"
    : "bg-white border-zinc-200 text-zinc-900 focus:border-emerald-500/60 focus:ring-emerald-500/15";
  const iconBtn = dark
    ? "border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900 text-zinc-300"
    : "border-zinc-200 hover:border-zinc-300 hover:bg-white text-zinc-700";

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
                  <Calendar size={15} />
                </div>
                <div className="leading-tight min-w-0">
                  <div className="text-[13px] font-semibold tracking-tight truncate">{t("dateConverter")}</div>
                  <div className={`text-[10px] tracking-[0.16em] uppercase ${muted}`}>
                    {isNe ? "वि.सं ⇄ ई.सं" : "BS ⇄ AD"}
                  </div>
                </div>
              </div>
              {todayBS && (
                <div className={`hidden lg:flex items-center gap-2 ml-2 pl-4 border-l ${hairline} text-[11px] ${muted}`} suppressHydrationWarning>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="tracking-wide">{t("today")} · {todayBS} BS</span>
                </div>
              )}
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
          {/* Section heading */}
          <div className="flex items-end justify-between">
            <div>
              <div className={`text-[11px] uppercase tracking-[0.18em] ${muted}`}>
                {isNe ? "उपकरण · ०१" : "Utility · 01"}
              </div>
              <h1 className="mt-2 text-[28px] md:text-[32px] font-semibold tracking-tight leading-tight">
                {isNe ? "मिति रूपान्तरण" : "Date Conversion"}
              </h1>
            </div>
            <span className={`hidden md:block text-[11px] uppercase tracking-[0.16em] ${muted}`}>
              {isNe ? "१९७० — २०९९ वि.सं" : "1970 — 2099 BS"}
            </span>
          </div>

          {/* Converter card */}
          <div className={`overflow-hidden rounded-xl border ${hairline} ${surface}`}>
            {/* Mode toggle row */}
            <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 px-5 py-4 border-b ${hairline}`}>
              <div className={`inline-flex rounded-md border ${hairline} ${dark ? "bg-zinc-950" : "bg-white"} p-0.5`}>
                <button
                  onClick={() => switchMode("BS to AD")}
                  className={`px-4 py-1.5 text-[12px] font-medium rounded-[5px] transition ${
                    mode === "BS to AD"
                      ? (dark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white")
                      : `${subtle} hover:${dark ? "bg-zinc-900" : "bg-zinc-50"}`
                  }`}
                >
                  {t("bsToAdFull")}
                </button>
                <button
                  onClick={() => switchMode("AD to BS")}
                  className={`px-4 py-1.5 text-[12px] font-medium rounded-[5px] transition ${
                    mode === "AD to BS"
                      ? (dark ? "bg-zinc-100 text-zinc-900" : "bg-zinc-900 text-white")
                      : `${subtle} hover:${dark ? "bg-zinc-900" : "bg-zinc-50"}`
                  }`}
                >
                  {t("adToBs")}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSwap}
                  className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] font-medium ${iconBtn}`}
                >
                  <ArrowLeftRight size={13} /> {t("swap")}
                </button>
                <button
                  onClick={handleSetToday}
                  className={`inline-flex h-9 items-center gap-2 rounded-md border px-3 text-[12px] font-medium ${iconBtn}`}
                >
                  <Clock size={13} /> {t("today")}
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-transparent">
              <Field label={t("year")} hint={`${yearMin} – ${yearMax}`} muted={muted} hairline={hairline} dark={dark}>
                <input
                  type="number"
                  value={year}
                  min={yearMin}
                  max={yearMax}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={`w-full rounded-md border ${inputCls} px-3 py-2.5 text-[15px] font-medium tabular-nums outline-none focus:ring-4 transition`}
                />
              </Field>

              <Field label={t("month")} hint={`${maxDay} ${isNe ? "दिन" : "days"}`} muted={muted} hairline={hairline} dark={dark}>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className={`w-full rounded-md border ${inputCls} px-3 py-2.5 text-[14px] font-medium outline-none focus:ring-4 transition appearance-none cursor-pointer`}
                >
                  {months.map((m, i) => (
                    <option key={m} value={i + 1}>{i + 1}. {m}</option>
                  ))}
                </select>
              </Field>

              <Field label={t("day")} hint={`1 – ${maxDay}`} muted={muted} hairline={hairline} dark={dark}>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepDay(-1)}
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${iconBtn}`}
                    aria-label="Previous day"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  <input
                    type="number"
                    value={day}
                    min={1}
                    max={maxDay}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className={`w-full rounded-md border ${inputCls} px-3 py-2.5 text-[15px] font-medium tabular-nums text-center outline-none focus:ring-4 transition`}
                  />
                  <button
                    type="button"
                    onClick={() => stepDay(1)}
                    className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border ${iconBtn}`}
                    aria-label="Next day"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </Field>
            </div>

            <div className={`px-5 pb-5 pt-2 space-y-3 border-t ${hairline}`}>
              {error && (
                <div className={`flex items-center gap-2 rounded-md border px-3 py-2.5 text-[12px] ${dark ? "border-rose-900/60 bg-rose-950/40 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                  <Info size={13} /> {error}
                </div>
              )}
              <button
                onClick={handleConvert}
                className={`group w-full inline-flex items-center justify-center gap-2 rounded-md py-3 text-[13px] font-medium transition ${
                  dark ? "bg-zinc-100 text-zinc-900 hover:bg-white" : "bg-zinc-900 text-white hover:bg-zinc-800"
                }`}
              >
                <RotateCw size={14} className="transition group-hover:rotate-180 duration-500" />
                {t("executeConversion")}
                <kbd className={`ml-2 hidden sm:inline-flex items-center rounded border px-1.5 py-0.5 text-[10px] tracking-wide ${
                  dark ? "border-zinc-700 bg-zinc-800/60 text-zinc-300" : "border-zinc-300 bg-zinc-100 text-zinc-600"
                }`}>↵</kbd>
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className={`border-t ${hairline} ${dark ? "bg-zinc-950/60" : "bg-zinc-50/60"} p-6 md:p-8`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="flex-1 min-w-0 space-y-4">
                    <div className={`text-[11px] uppercase tracking-[0.18em] ${muted} flex items-center gap-2`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      {t("targetDate")}
                    </div>
                    <h2 className="text-[28px] md:text-[36px] font-semibold tracking-tight leading-tight">
                      {result.date}
                    </h2>
                    <p className={`text-[14px] ${subtle}`} lang="ne">{result.nepali}</p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Tag dark={dark} hairline={hairline} accent>{result.diff}</Tag>
                      <Tag dark={dark} hairline={hairline}>{result.weekday}</Tag>
                      <Tag dark={dark} hairline={hairline}>{result.detail}</Tag>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[12px] font-medium transition ${
                        copied
                          ? "bg-emerald-500 text-white"
                          : dark ? "bg-zinc-100 text-zinc-900 hover:bg-white" : "bg-zinc-900 text-white hover:bg-zinc-800"
                      }`}
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                      {copied ? t("copied") : t("copy")}
                    </button>
                    <button
                      onClick={handleShare}
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-md border ${iconBtn}`}
                      aria-label="Share"
                    >
                      <Share2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Insight strip */}
          <div className={`grid md:grid-cols-[auto_1fr] gap-6 rounded-xl border ${hairline} ${surface} p-6`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-md border ${hairline}`}>
              <Calendar size={16} />
            </div>
            <div>
              <div className={`text-[11px] uppercase tracking-[0.16em] ${muted}`}>{t("calendarInsight")}</div>
              <p className={`mt-2 text-[14px] leading-relaxed ${subtle}`}>{t("bsCalendarDesc")}</p>
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
                  <p className={`mt-3 text-[12px] px-4 ${muted}`}>{t("noHistoryYet")}</p>
                </div>
              ) : (
                <ul className="divide-y divide-transparent">
                  {history.map((item, idx) => (
                    <li key={item.id}>
                      <div className={`group rounded-lg px-3 py-3 transition ${dark ? "hover:bg-zinc-900/60" : "hover:bg-zinc-50"}`}>
                        <div className={`flex items-center justify-between text-[10px] uppercase tracking-[0.14em] ${muted} mb-1.5`}>
                          <span className="tabular-nums">{String(idx + 1).padStart(2, "0")} · {item.type}</span>
                          <span suppressHydrationWarning>{item.time}</span>
                        </div>
                        <div className={`text-[12px] ${subtle}`}>{item.from}</div>
                        <div className={`mt-0.5 text-[13px] font-medium ${dark ? "text-zinc-100" : "text-zinc-900"}`}>
                          {item.to}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Cross-link card */}
          <div className={`rounded-xl border ${hairline} ${surface} p-5`}>
            <div className={`text-[11px] uppercase tracking-[0.16em] ${muted}`}>
              {isNe ? "अन्य उपकरण" : "More utilities"}
            </div>
            <div className="mt-3 space-y-2">
              <CrossLink href="/convert_currency" label={isNe ? "मुद्रा रूपान्तरण" : "Currency Converter"} sub="02" hairline={hairline} dark={dark} />
              <CrossLink href="/convert_language" label={isNe ? "भाषा अनुवाद" : "Language Converter"} sub="03" hairline={hairline} dark={dark} />
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
            {isNe ? "थिच्नुहोस्" : "Press"}{" "}
            <kbd className={`mx-0.5 rounded border px-1.5 py-0.5 text-[10px] ${dark ? "border-zinc-700 bg-zinc-900" : "border-zinc-200 bg-white"}`}>↵</kbd>{" "}
            {isNe ? "रूपान्तरण गर्न" : "to convert"}
          </p>
        </div>
      </footer>

      <ActionModal open={showHelp} onClose={() => setShowHelp(false)} title={t("dateHelp")} dark={dark}>
        <p>{t("dateHelpDesc1")}</p>
        <p>{t("dateHelpDesc2")}</p>
      </ActionModal>

      <ActionModal open={showSettings} onClose={() => setShowSettings(false)} title={t("dateSettings")} dark={dark}>
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
          {t("clearConversionHistory")}
        </button>
      </ActionModal>
    </div>
  );
}

function Field({
  label, hint, children, muted, hairline, dark,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  muted: string;
  hairline: string;
  dark: boolean;
}) {
  return (
    <div className={`p-5 ${dark ? "bg-zinc-950" : "bg-white"} border-b md:border-b-0 md:border-r ${hairline} last:border-0`}>
      <label className={`text-[10px] font-medium uppercase tracking-[0.16em] ${muted}`}>{label}</label>
      <div className="mt-2">{children}</div>
      {hint && <p className={`mt-2 text-[10px] tracking-wide ${muted}`}>{hint}</p>}
    </div>
  );
}

function Tag({ children, dark, hairline, accent }: { children: React.ReactNode; dark: boolean; hairline: string; accent?: boolean }) {
  if (accent) {
    return (
      <span className="inline-flex items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
        {children}
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center rounded-full border ${hairline} px-2.5 py-1 text-[11px] font-medium ${dark ? "bg-zinc-950 text-zinc-300" : "bg-white text-zinc-700"}`}>
      {children}
    </span>
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
