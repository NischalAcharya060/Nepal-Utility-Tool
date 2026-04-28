"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import BikramSambat from "bikram-sambat";
import {
  History, RotateCw, Copy, Share2, Calendar, Info, HelpCircle, Settings,
  Clock, Timer, ArrowLeftRight, Download, Trash2, ChevronLeft, ChevronRight,
  Check, Sun, Moon
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
const THEME_KEY = "ndc_theme_v1";

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

  // Compute current max day for the active calendar/month
  const maxDay = useMemo(() => {
    try {
      if (mode === "BS to AD") return BikramSambat.daysInMonth(year, month);
      return adDaysInMonth(year, month);
    } catch {
      return 32;
    }
  }, [mode, year, month]);

  // Today in BS for the header strip
  useEffect(() => {
    try {
      const bs = adToBs(new Date());
      setTodayBS(`${bs.year} ${BS_MONTHS[bs.month - 1]} ${bs.day}`);
    } catch {
      setTodayBS("");
    }
  }, []);

  // Load persisted state
  useEffect(() => {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw));
      const theme = localStorage.getItem(THEME_KEY);
      if (theme === "dark") setDark(true);
    } catch {}
  }, []);

  // Persist
  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 25))); } catch {}
  }, [history]);

  useEffect(() => {
    try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch {}
  }, [dark]);

  // Clamp day when month/mode changes
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
    // Swap so the previous result becomes the new input
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
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    return diffDays > 0 ? `In ${diffDays} days` : `${Math.abs(diffDays)} days ago`;
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
  }, [mode, year, month, day]);

  // Enter to convert
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

  const themeBg = dark ? "bg-slate-950 text-slate-100" : "bg-[#F8FAFC] text-slate-800";
  const cardBg = dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200";
  const subCardBg = dark ? "bg-slate-900/60 border-slate-800" : "bg-white border-slate-200";
  const inputBg = dark
    ? "bg-slate-900 border-slate-700 text-slate-100 focus:border-sky-400 focus:ring-sky-400/20"
    : "bg-white border-slate-200 focus:border-sky-500 focus:ring-sky-500/10";
  const mutedText = dark ? "text-slate-400" : "text-slate-500";
  const subtleSurface = dark ? "bg-slate-900/50 border-slate-800" : "bg-slate-50/50 border-slate-100";
  const headerBg = dark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200";

  return (
    <div className={`min-h-screen ${themeBg} font-sans selection:bg-sky-100 transition-colors`}>
      <header className={`${headerBg} border-b px-6 md:px-8 py-4 flex items-center justify-between sticky top-0 z-50 backdrop-blur`}>
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-bold tracking-tighter uppercase flex items-center gap-2">
            <Calendar className="text-sky-500" size={20} />
            Date Converter
          </h1>
          {todayBS && (
            <div className={`hidden md:flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest ${mutedText}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Today · {todayBS} BS
            </div>
          )}
        </div>
        <div className={`flex items-center gap-3 ${mutedText}`}>
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors"
            aria-label="Toggle theme"
            title="Toggle theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors" aria-label="Help"><HelpCircle size={18} /></button>
          <button className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors" aria-label="Settings"><Settings size={18} /></button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className={`${cardBg} rounded-2xl border shadow-sm overflow-hidden transition-all hover:shadow-md`}>
            {/* Toggle */}
            <div className={`p-6 border-b ${dark ? "border-slate-800" : "border-slate-100"} flex flex-col sm:flex-row justify-between items-center gap-4`}>
              <div className={`flex ${dark ? "bg-slate-800" : "bg-slate-100"} p-1 rounded-xl w-full sm:w-auto`}>
                <button
                  onClick={() => switchMode("BS to AD")}
                  className={`flex-1 sm:flex-none px-8 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === "BS to AD" ? "bg-black text-white shadow-lg" : `${mutedText} hover:bg-slate-500/10`}`}
                >
                  BS TO AD
                </button>
                <button
                  onClick={() => switchMode("AD to BS")}
                  className={`flex-1 sm:flex-none px-8 py-2.5 text-xs font-bold rounded-lg transition-all ${mode === "AD to BS" ? "bg-black text-white shadow-lg" : `${mutedText} hover:bg-slate-500/10`}`}
                >
                  AD TO BS
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSwap}
                  className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase hover:bg-slate-500/10 px-3 py-2 rounded-lg transition-all"
                  title="Swap conversion direction"
                >
                  <ArrowLeftRight size={14} /> Swap
                </button>
                <button
                  onClick={handleSetToday}
                  className="flex items-center gap-2 text-xs font-bold text-sky-600 uppercase hover:bg-sky-500/10 px-3 py-2 rounded-lg transition-all"
                >
                  <Clock size={14} /> Today
                </button>
              </div>
            </div>

            {/* Inputs */}
            <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="group space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${mutedText} group-focus-within:text-sky-500 transition-colors`}>Year</label>
                <input
                  type="number"
                  value={year}
                  min={yearMin}
                  max={yearMax}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className={`w-full border ${inputBg} rounded-xl p-4 text-sm focus:ring-4 outline-none transition-all font-medium`}
                />
                <p className={`text-[10px] ${mutedText}`}>{yearMin} – {yearMax}</p>
              </div>
              <div className="group space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${mutedText} group-focus-within:text-sky-500 transition-colors`}>Month</label>
                <select
                  className={`w-full border ${inputBg} rounded-xl p-4 text-sm outline-none focus:ring-4 transition-all font-medium appearance-none cursor-pointer`}
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                >
                  {months.map((m, i) => (
                    <option key={m} value={i + 1}>{i + 1}. {m}</option>
                  ))}
                </select>
                <p className={`text-[10px] ${mutedText}`}>{maxDay} days</p>
              </div>
              <div className="group space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${mutedText} group-focus-within:text-sky-500 transition-colors`}>Day</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => stepDay(-1)}
                    className={`p-3 border rounded-xl ${dark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"} transition-colors`}
                    aria-label="Previous day"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <input
                    type="number"
                    value={day}
                    min={1}
                    max={maxDay}
                    onChange={(e) => setDay(Number(e.target.value))}
                    className={`w-full border ${inputBg} rounded-xl p-4 text-sm focus:ring-4 outline-none transition-all font-medium text-center`}
                  />
                  <button
                    type="button"
                    onClick={() => stepDay(1)}
                    className={`p-3 border rounded-xl ${dark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-50"} transition-colors`}
                    aria-label="Next day"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
                <p className={`text-[10px] ${mutedText}`}>1 – {maxDay}</p>
              </div>
            </div>

            <div className="px-8 pb-8 space-y-3">
              {error && (
                <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <Info size={14} /> {error}
                </div>
              )}
              <button
                onClick={handleConvert}
                className="w-full bg-black text-white py-5 rounded-xl text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.99]"
              >
                <RotateCw size={18} className="animate-hover-spin" /> Execute Conversion
                <span className="hidden md:inline text-[10px] opacity-50 ml-2">↵ Enter</span>
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className={`${dark ? "bg-slate-900/80 border-slate-800" : "bg-slate-50/80 border-slate-100"} border-t p-8 animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  <div className="space-y-4 flex-1 min-w-0">
                    <div>
                      <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Info size={12} /> Target Date
                      </p>
                      <h2 className={`text-3xl font-bold tracking-tight ${dark ? "text-white" : "text-slate-900"}`}>{result.date}</h2>
                      <p className={`text-base mt-1 ${mutedText}`} lang="ne">{result.nepali}</p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Pill dark={dark} icon={<Timer size={14} className="text-sky-500" />}>{result.diff}</Pill>
                      <Pill dark={dark}>{result.weekday}</Pill>
                      <Pill dark={dark}>{result.detail}</Pill>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCopy}
                      className={`flex-1 sm:flex-none px-6 py-3 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${copied ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-[#4AC4F3] hover:bg-[#3bb1e0] text-white shadow-sky-100"}`}
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Copied" : "Copy"}
                    </button>
                    <button
                      onClick={handleShare}
                      className={`p-3 border rounded-xl transition-all active:scale-95 ${dark ? "border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-slate-200" : "border-slate-200 text-slate-400 hover:bg-white hover:text-slate-600"}`}
                      aria-label="Share"
                    >
                      <Share2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className={`${cardBg} p-6 rounded-2xl border shadow-sm min-h-[400px] flex flex-col transition-all hover:shadow-md`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <History size={18} className={mutedText} />
                <h3 className="font-bold text-sm">Activity Log</h3>
                {history.length > 0 && (
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500"}`}>
                    {history.length}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={exportCSV}
                  disabled={history.length === 0}
                  className={`p-1.5 rounded-md transition-colors ${history.length === 0 ? "opacity-30 cursor-not-allowed" : "text-slate-400 hover:text-sky-500 hover:bg-sky-500/10"}`}
                  title="Export as CSV"
                  aria-label="Export"
                >
                  <Download size={14} />
                </button>
                <button
                  onClick={() => setHistory([])}
                  disabled={history.length === 0}
                  className={`p-1.5 rounded-md transition-colors ${history.length === 0 ? "opacity-30 cursor-not-allowed" : "text-slate-400 hover:text-red-400 hover:bg-red-500/10"}`}
                  title="Clear all"
                  aria-label="Clear"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-auto max-h-[440px] pr-1">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className={`w-12 h-12 ${dark ? "bg-slate-800" : "bg-slate-50"} rounded-full flex items-center justify-center mb-3`}>
                    <Clock className={dark ? "text-slate-600" : "text-slate-200"} size={24} />
                  </div>
                  <p className={`text-xs italic px-4 ${mutedText}`}>Your recent conversions will appear here for quick reference.</p>
                </div>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 rounded-xl border ${subtleSurface} group hover:border-sky-200 transition-all`}
                  >
                    <div className="flex justify-between text-[9px] font-bold text-sky-600 uppercase mb-2">
                      <span>{item.type}</span>
                      <span className={`${dark ? "text-slate-500" : "text-slate-300"} group-hover:text-slate-400 transition-colors`}>{item.time}</span>
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs font-medium ${mutedText}`}>{item.from}</p>
                      <div className={`w-4 h-[1px] ${dark ? "bg-slate-700" : "bg-slate-200"} my-1`}></div>
                      <p className={`text-sm font-bold ${dark ? "text-white" : "text-slate-900"}`}>{item.to}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 aspect-square flex flex-col justify-end group">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600"
              className="absolute inset-0 h-full w-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-[2s]"
              alt="Himalayas"
            />
            <div className="relative z-20 space-y-3">
              <div className="w-8 h-1 bg-sky-500 rounded-full"></div>
              <p className="text-[10px] font-bold uppercase text-sky-400 tracking-[0.2em]">Calendar Insight</p>
              <p className="text-sm leading-relaxed text-slate-200 font-medium">
                The Bikram Sambat is a solar calendar based on ancient Hindu tradition. It is officially used in Nepal and is approximately 56 years and 8 months ahead of the AD calendar.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className={`max-w-6xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold uppercase tracking-[0.15em] border-t mt-8 ${dark ? "border-slate-800 text-slate-500" : "border-slate-100 text-slate-400"}`}>
        <p>© {new Date().getFullYear()} Date Converter</p>
        <p>Press <kbd className={`px-1.5 py-0.5 rounded ${dark ? "bg-slate-800" : "bg-slate-100"}`}>Enter</kbd> to convert</p>
      </footer>

      <style jsx global>{`
        @keyframes hover-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-hover-spin:hover {
          animation: hover-spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

function Pill({ children, icon, dark }: { children: React.ReactNode; icon?: React.ReactNode; dark: boolean }) {
  return (
    <div className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold flex items-center gap-2 ${dark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"}`}>
      {icon}
      {children}
    </div>
  );
}
