"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  ArrowLeftRight, RefreshCw, Copy, Check, Search, History, Trash2, Download,
  TrendingUp, AlertCircle, Settings, HelpCircle, Sun, Moon, Wallet, Globe,
  ChevronDown, Star
} from "lucide-react";

type RatesResponse = {
  result: "success" | "error";
  provider?: string;
  base_code: string;
  rates: Record<string, number>;
  time_last_update_unix: number;
  time_last_update_utc: string;
  time_next_update_unix: number;
  "error-type"?: string;
};

type HistoryEntry = {
  id: number;
  from: string;
  to: string;
  amount: number;
  result: number;
  rate: number;
  time: string;
};

const API_BASE = "https://open.er-api.com/v6/latest";
const CACHE_KEY_PREFIX = "ncc_rates_v1_";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const HISTORY_KEY = "ncc_history_v1";
const FAVS_KEY = "ncc_favs_v1";
const THEME_KEY = "ncc_theme_v1";
const RECENT_KEY = "ncc_recent_v1";

const POPULAR_PAIRS: Array<[string, string]> = [
  ["USD", "NPR"], ["EUR", "NPR"], ["GBP", "NPR"], ["INR", "NPR"],
  ["AUD", "NPR"], ["JPY", "NPR"], ["AED", "NPR"], ["SAR", "NPR"],
];

// Display names for the most common currencies. Anything missing falls back to its code.
const CURRENCY_NAMES: Record<string, string> = {
  USD: "US Dollar", EUR: "Euro", GBP: "British Pound", JPY: "Japanese Yen",
  CNY: "Chinese Yuan", INR: "Indian Rupee", NPR: "Nepalese Rupee", AUD: "Australian Dollar",
  CAD: "Canadian Dollar", CHF: "Swiss Franc", HKD: "Hong Kong Dollar", SGD: "Singapore Dollar",
  AED: "UAE Dirham", SAR: "Saudi Riyal", QAR: "Qatari Riyal", KWD: "Kuwaiti Dinar",
  KRW: "South Korean Won", THB: "Thai Baht", MYR: "Malaysian Ringgit", IDR: "Indonesian Rupiah",
  BDT: "Bangladeshi Taka", PKR: "Pakistani Rupee", LKR: "Sri Lankan Rupee", BTN: "Bhutanese Ngultrum",
  RUB: "Russian Ruble", TRY: "Turkish Lira", ZAR: "South African Rand", BRL: "Brazilian Real",
  MXN: "Mexican Peso", NZD: "New Zealand Dollar", SEK: "Swedish Krona", NOK: "Norwegian Krone",
  DKK: "Danish Krone", PLN: "Polish Zloty", CZK: "Czech Koruna", HUF: "Hungarian Forint",
  ILS: "Israeli Shekel", EGP: "Egyptian Pound", PHP: "Philippine Peso", VND: "Vietnamese Dong",
  TWD: "Taiwan Dollar", OMR: "Omani Rial", BHD: "Bahraini Dinar", JOD: "Jordanian Dinar",
};

const CURRENCY_FLAGS: Record<string, string> = {
  USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", JPY: "🇯🇵", CNY: "🇨🇳", INR: "🇮🇳", NPR: "🇳🇵",
  AUD: "🇦🇺", CAD: "🇨🇦", CHF: "🇨🇭", HKD: "🇭🇰", SGD: "🇸🇬", AED: "🇦🇪", SAR: "🇸🇦",
  QAR: "🇶🇦", KWD: "🇰🇼", KRW: "🇰🇷", THB: "🇹🇭", MYR: "🇲🇾", IDR: "🇮🇩", BDT: "🇧🇩",
  PKR: "🇵🇰", LKR: "🇱🇰", BTN: "🇧🇹", RUB: "🇷🇺", TRY: "🇹🇷", ZAR: "🇿🇦", BRL: "🇧🇷",
  MXN: "🇲🇽", NZD: "🇳🇿", SEK: "🇸🇪", NOK: "🇳🇴", DKK: "🇩🇰", PLN: "🇵🇱", CZK: "🇨🇿",
  HUF: "🇭🇺", ILS: "🇮🇱", EGP: "🇪🇬", PHP: "🇵🇭", VND: "🇻🇳", TWD: "🇹🇼", OMR: "🇴🇲",
  BHD: "🇧🇭", JOD: "🇯🇴",
};

const formatNumber = (n: number, currency: string) => {
  if (!isFinite(n)) return "—";
  const decimals = n >= 1000 ? 2 : n >= 1 ? 4 : 6;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: decimals,
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(decimals)} ${currency}`;
  }
};

const formatPlain = (n: number) => {
  if (!isFinite(n)) return "—";
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(n);
};

async function fetchRates(base: string): Promise<RatesResponse> {
  const cacheKey = CACHE_KEY_PREFIX + base;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as { fetchedAt: number; data: RatesResponse };
      if (Date.now() - parsed.fetchedAt < CACHE_TTL_MS) return parsed.data;
    }
  } catch {}

  const res = await fetch(`${API_BASE}/${base}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Network error (${res.status})`);
  const data: RatesResponse = await res.json();
  if (data.result !== "success") throw new Error(data["error-type"] || "API returned an error");
  try {
    localStorage.setItem(cacheKey, JSON.stringify({ fetchedAt: Date.now(), data }));
  } catch {}
  return data;
}

export default function CurrencyConverter() {
  const [from, setFrom] = useState("USD");
  const [to, setTo] = useState("NPR");
  const [amount, setAmount] = useState<string>("100");
  const [rates, setRates] = useState<RatesResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState("");
  const [recentAmounts, setRecentAmounts] = useState<number[]>([]);
  const [openSelect, setOpenSelect] = useState<"from" | "to" | null>(null);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  // Load persisted state
  useEffect(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
      const f = localStorage.getItem(FAVS_KEY);
      if (f) setFavorites(JSON.parse(f));
      const t = localStorage.getItem(THEME_KEY);
      if (t === "dark") setDark(true);
      const r = localStorage.getItem(RECENT_KEY);
      if (r) setRecentAmounts(JSON.parse(r));
    } catch {}
  }, []);

  useEffect(() => { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 25))); } catch {} }, [history]);
  useEffect(() => { try { localStorage.setItem(FAVS_KEY, JSON.stringify(favorites)); } catch {} }, [favorites]);
  useEffect(() => { try { localStorage.setItem(THEME_KEY, dark ? "dark" : "light"); } catch {} }, [dark]);
  useEffect(() => { try { localStorage.setItem(RECENT_KEY, JSON.stringify(recentAmounts.slice(0, 5))); } catch {} }, [recentAmounts]);

  const loadRates = useCallback(async (base: string, force = false) => {
    setLoading(true);
    setError("");
    try {
      if (force) {
        try { localStorage.removeItem(CACHE_KEY_PREFIX + base); } catch {}
      }
      const data = await fetchRates(base);
      setRates(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load exchange rates");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load rates whenever `from` changes
  useEffect(() => { loadRates(from); }, [from, loadRates]);

  // Close dropdowns on outside click or Escape
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (fromRef.current && !fromRef.current.contains(t) && toRef.current && !toRef.current.contains(t)) {
        setOpenSelect(null);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenSelect(null);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const numericAmount = useMemo(() => {
    const n = parseFloat(amount.replace(/,/g, ""));
    return isFinite(n) ? n : 0;
  }, [amount]);

  const rate = useMemo(() => {
    if (!rates || !rates.rates[to]) return 0;
    return rates.rates[to];
  }, [rates, to]);

  const converted = useMemo(() => numericAmount * rate, [numericAmount, rate]);
  const inverseRate = useMemo(() => (rate ? 1 / rate : 0), [rate]);

  const allCurrencies = useMemo(() => {
    if (!rates) return [];
    return Object.keys(rates.rates).sort();
  }, [rates]);

  const filteredCurrencies = useMemo(() => {
    if (!search.trim()) return allCurrencies;
    const q = search.toLowerCase();
    return allCurrencies.filter(c =>
      c.toLowerCase().includes(q) || (CURRENCY_NAMES[c] || "").toLowerCase().includes(q)
    );
  }, [allCurrencies, search]);

  const handleSwap = () => {
    const newFrom = to;
    const newTo = from;
    if (rates && rates.rates[to]) {
      // Convert displayed amount so swap shows the inverse value
      const swapped = numericAmount * rate;
      setAmount(swapped > 0 ? String(Number(swapped.toFixed(6))) : "0");
    }
    setFrom(newFrom);
    setTo(newTo);
  };

  const handleSelect = (code: string, slot: "from" | "to") => {
    if (slot === "from") setFrom(code);
    else setTo(code);
    setOpenSelect(null);
    setSearch("");
  };

  const saveToHistory = useCallback(() => {
    if (!rate || numericAmount <= 0) return;
    const entry: HistoryEntry = {
      id: Date.now(),
      from, to, amount: numericAmount,
      result: converted,
      rate,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    setHistory(h => [entry, ...h.filter(e => !(e.from === from && e.to === to && e.amount === numericAmount)).slice(0, 24)]);
    if (numericAmount > 0 && !recentAmounts.includes(numericAmount)) {
      setRecentAmounts(r => [numericAmount, ...r].slice(0, 5));
    }
  }, [from, to, numericAmount, rate, converted, recentAmounts]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`${formatPlain(converted)} ${to}`);
      setCopied(true);
      saveToHistory();
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Clipboard not available");
    }
  };

  const toggleFavorite = (pair: string) => {
    setFavorites(f => f.includes(pair) ? f.filter(p => p !== pair) : [pair, ...f].slice(0, 12));
  };

  const exportCSV = () => {
    if (history.length === 0) return;
    const rows = [["From", "To", "Amount", "Rate", "Result", "Time"]];
    history.forEach(h => rows.push([h.from, h.to, String(h.amount), String(h.rate), String(h.result), h.time]));
    const csv = rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `currency-conversions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const updatedLabel = useMemo(() => {
    if (!rates) return "";
    try {
      return new Date(rates.time_last_update_unix * 1000).toLocaleString([], {
        dateStyle: "medium", timeStyle: "short",
      });
    } catch { return rates.time_last_update_utc; }
  }, [rates]);

  // Theme classes (kept consistent with the date converter for visual cohesion)
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
            <Wallet className="text-sky-500" size={20} />
            Currency Converter
          </h1>
          {rates && (
            <div className={`hidden md:flex items-center gap-2 text-[11px] font-semibold uppercase tracking-widest ${mutedText}`} suppressHydrationWarning>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live · Updated {updatedLabel}
            </div>
          )}
        </div>
        <div className={`flex items-center gap-2 ${mutedText}`}>
          <button
            onClick={() => loadRates(from, true)}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors disabled:opacity-40"
            aria-label="Refresh rates"
            title="Refresh rates"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setDark(d => !d)}
            className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors"
            aria-label="Toggle theme"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors" aria-label="Help"><HelpCircle size={18} /></button>
          <button className="p-2 rounded-lg hover:bg-slate-500/10 transition-colors" aria-label="Settings"><Settings size={18} /></button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6 md:p-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Converter card */}
          <div className={`${cardBg} rounded-2xl border shadow-sm transition-all hover:shadow-md`}>
            <div className={`p-6 border-b ${dark ? "border-slate-800" : "border-slate-100"} flex flex-wrap items-center justify-between gap-3`}>
              <div className="flex items-center gap-2">
                <Globe size={16} className="text-sky-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Live Exchange Rates</span>
              </div>
              <div className={`text-[10px] font-semibold ${mutedText}`}>
                Source: exchangerate-api.com
              </div>
            </div>

            {/* Amount */}
            <div className="p-8 space-y-6">
              <div className="space-y-2">
                <label className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>Amount</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value.replace(/[^\d.,-]/g, ""))}
                  className={`w-full border ${inputBg} rounded-xl p-5 text-2xl focus:ring-4 outline-none transition-all font-bold tracking-tight`}
                  placeholder="0.00"
                />
                {recentAmounts.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${mutedText} self-center`}>Recent:</span>
                    {recentAmounts.map(a => (
                      <button
                        key={a}
                        onClick={() => setAmount(String(a))}
                        className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border ${dark ? "border-slate-700 hover:bg-slate-800" : "border-slate-200 hover:bg-slate-100"} transition-colors`}
                      >
                        {formatPlain(a)}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* From / Swap / To */}
              <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start gap-3">
                <CurrencySelector
                  label="From"
                  code={from}
                  open={openSelect === "from"}
                  onOpen={() => { setOpenSelect(openSelect === "from" ? null : "from"); setSearch(""); }}
                  onSelect={(c) => handleSelect(c, "from")}
                  currencies={filteredCurrencies}
                  search={search}
                  setSearch={setSearch}
                  dark={dark}
                  inputBg={inputBg}
                  mutedText={mutedText}
                  panelRef={fromRef}
                  favorites={favorites}
                  toggleFavorite={(c) => toggleFavorite(`${c}-${to}`)}
                  pairKeyFor={(c) => `${c}-${to}`}
                />

                <button
                  onClick={handleSwap}
                  className="p-4 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-200 transition-all active:scale-90 mx-auto rotate-90 md:rotate-0 md:mt-7"
                  aria-label="Swap currencies"
                  title="Swap"
                >
                  <ArrowLeftRight size={18} />
                </button>

                <CurrencySelector
                  label="To"
                  code={to}
                  open={openSelect === "to"}
                  onOpen={() => { setOpenSelect(openSelect === "to" ? null : "to"); setSearch(""); }}
                  onSelect={(c) => handleSelect(c, "to")}
                  currencies={filteredCurrencies}
                  search={search}
                  setSearch={setSearch}
                  dark={dark}
                  inputBg={inputBg}
                  mutedText={mutedText}
                  panelRef={toRef}
                  favorites={favorites}
                  toggleFavorite={(c) => toggleFavorite(`${from}-${c}`)}
                  pairKeyFor={(c) => `${from}-${c}`}
                />
              </div>

              {error && (
                <div className="border border-red-200 bg-red-50 text-red-700 px-4 py-3 rounded-xl text-xs font-medium flex items-center gap-2">
                  <AlertCircle size={14} /> {error}
                </div>
              )}
            </div>

            {/* Result */}
            <div className={`${dark ? "bg-slate-900/80 border-slate-800" : "bg-slate-50/80 border-slate-100"} border-t p-8`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="space-y-3 flex-1 min-w-0">
                  <p className="text-[10px] font-bold text-sky-600 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp size={12} /> {numericAmount > 0 ? formatPlain(numericAmount) : "0"} {from} equals
                  </p>
                  <h2 className={`text-3xl md:text-4xl font-bold tracking-tight break-words ${dark ? "text-white" : "text-slate-900"}`}>
                    {loading && !rates ? "Loading..." : rate ? formatNumber(converted, to) : "—"}
                  </h2>
                  {rate > 0 && (
                    <div className="flex flex-wrap gap-2">
                      <Pill dark={dark}>1 {from} = {formatPlain(rate)} {to}</Pill>
                      <Pill dark={dark}>1 {to} = {formatPlain(inverseRate)} {from}</Pill>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!rate}
                    className={`px-6 py-3 rounded-xl text-xs font-bold uppercase flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${copied ? "bg-emerald-500 text-white shadow-emerald-100" : "bg-[#4AC4F3] hover:bg-[#3bb1e0] text-white shadow-sky-100"}`}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />} {copied ? "Saved" : "Copy"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Popular pairs */}
          <div className={`${cardBg} rounded-2xl border shadow-sm p-6`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Star size={16} className="text-amber-400" />
                {favorites.length > 0 ? "Favorites & Popular" : "Popular Pairs"}
              </h3>
              <span className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>NPR Focused</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[...favorites.map(f => f.split("-") as [string, string]), ...POPULAR_PAIRS]
                .filter((p, i, arr) => arr.findIndex(q => q[0] === p[0] && q[1] === p[1]) === i)
                .slice(0, 8)
                .map(([f, t]) => {
                  const r = rates && f === rates.base_code ? rates.rates[t] : null;
                  const isActive = from === f && to === t;
                  return (
                    <button
                      key={`${f}-${t}`}
                      onClick={() => { setFrom(f); setTo(t); }}
                      className={`p-3 rounded-xl border text-left transition-all ${isActive
                        ? "border-sky-500 bg-sky-500/10"
                        : `${subtleSurface} hover:border-sky-300`}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold">
                          {CURRENCY_FLAGS[f] || ""} {f} → {CURRENCY_FLAGS[t] || ""} {t}
                        </span>
                      </div>
                      <p className={`text-[11px] font-semibold ${mutedText}`}>
                        {r ? `1 = ${formatPlain(r)}` : "Tap to view"}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className={`${cardBg} p-6 rounded-2xl border shadow-sm min-h-[400px] flex flex-col`}>
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
                    <Wallet className={dark ? "text-slate-600" : "text-slate-200"} size={24} />
                  </div>
                  <p className={`text-xs italic px-4 ${mutedText}`}>Copied conversions will appear here for quick reference.</p>
                </div>
              ) : (
                history.map(item => (
                  <button
                    key={item.id}
                    onClick={() => { setFrom(item.from); setTo(item.to); setAmount(String(item.amount)); }}
                    className={`w-full text-left p-4 rounded-xl border ${subtleSurface} group hover:border-sky-200 transition-all`}
                  >
                    <div className="flex justify-between text-[9px] font-bold text-sky-600 uppercase mb-2">
                      <span>{item.from} → {item.to}</span>
                      <span className={`${dark ? "text-slate-500" : "text-slate-300"} group-hover:text-slate-400 transition-colors`}>{item.time}</span>
                    </div>
                    <div className="space-y-1">
                      <p className={`text-xs font-medium ${mutedText}`}>{formatPlain(item.amount)} {item.from}</p>
                      <div className={`w-4 h-[1px] ${dark ? "bg-slate-700" : "bg-slate-200"} my-1`} />
                      <p className={`text-sm font-bold ${dark ? "text-white" : "text-slate-900"}`}>
                        {formatPlain(item.result)} {item.to}
                      </p>
                      <p className={`text-[10px] ${mutedText}`}>@ {formatPlain(item.rate)}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-8 aspect-square flex flex-col justify-end group">
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&q=80&w=600"
              className="absolute inset-0 h-full w-full object-cover opacity-50 group-hover:scale-110 transition-transform duration-[2s]"
              alt="Currency"
            />
            <div className="relative z-20 space-y-3">
              <div className="w-8 h-1 bg-sky-500 rounded-full" />
              <p className="text-[10px] font-bold uppercase text-sky-400 tracking-[0.2em]">Forex Insight</p>
              <p className="text-sm leading-relaxed text-slate-200 font-medium">
                Rates are pulled live from exchangerate-api.com and refreshed every 24 hours. Cached locally for one hour to keep the app responsive.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className={`max-w-6xl mx-auto px-8 py-12 flex flex-col md:flex-row justify-between items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] border-t mt-8 ${dark ? "border-slate-800 text-slate-500" : "border-slate-100 text-slate-400"}`}>
        <p suppressHydrationWarning>© {new Date().getFullYear()} Currency Converter</p>
        {rates && <p>Base · {rates.base_code} · {Object.keys(rates.rates).length} currencies</p>}
      </footer>
    </div>
  );
}

function CurrencySelector(props: {
  label: string;
  code: string;
  open: boolean;
  onOpen: () => void;
  onSelect: (c: string) => void;
  currencies: string[];
  search: string;
  setSearch: (s: string) => void;
  dark: boolean;
  inputBg: string;
  mutedText: string;
  panelRef: React.RefObject<HTMLDivElement | null>;
  favorites: string[];
  toggleFavorite: (c: string) => void;
  pairKeyFor: (c: string) => string;
}) {
  const { label, code, open, onOpen, onSelect, currencies, search, setSearch, dark, inputBg, mutedText, panelRef, favorites, toggleFavorite, pairKeyFor } = props;
  return (
    <div className={`relative space-y-2 ${open ? "z-[60]" : ""}`} ref={panelRef}>
      <label className={`text-[10px] font-bold uppercase tracking-widest ${mutedText}`}>{label}</label>
      <button
        type="button"
        onClick={onOpen}
        className={`w-full border ${inputBg} rounded-xl p-4 text-sm flex items-center justify-between transition-all font-medium`}
      >
        <span className="flex items-center gap-2.5 min-w-0">
          <span className="text-xl shrink-0">{CURRENCY_FLAGS[code] || "🏳️"}</span>
          <span className="flex flex-col items-start min-w-0">
            <span className="font-bold">{code}</span>
            <span className={`text-[10px] truncate ${mutedText}`}>{CURRENCY_NAMES[code] || code}</span>
          </span>
        </span>
        <ChevronDown size={16} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`mt-2 rounded-xl border shadow-2xl overflow-hidden ${dark ? "bg-slate-900 border-slate-700" : "bg-white border-slate-200"}`}>
          <div className={`p-3 border-b ${dark ? "border-slate-800" : "border-slate-100"}`}>
            <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${dark ? "bg-slate-800" : "bg-slate-100"}`}>
              <Search size={14} className={mutedText} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search currency..."
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-auto">
            {currencies.length === 0 ? (
              <p className={`p-4 text-xs text-center ${mutedText}`}>No matches</p>
            ) : currencies.map(c => {
              const isFav = favorites.includes(pairKeyFor(c));
              return (
                <div
                  key={c}
                  className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors ${dark ? "hover:bg-slate-800" : "hover:bg-slate-50"} ${c === code ? (dark ? "bg-slate-800" : "bg-sky-50") : ""}`}
                  onClick={() => onSelect(c)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg">{CURRENCY_FLAGS[c] || "🏳️"}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold">{c}</p>
                      <p className={`text-[10px] truncate ${mutedText}`}>{CURRENCY_NAMES[c] || c}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(c); }}
                    className="p-1 rounded hover:bg-slate-500/10"
                    aria-label="Toggle favorite"
                  >
                    <Star size={14} className={isFav ? "fill-amber-400 text-amber-400" : mutedText} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function Pill({ children, dark }: { children: React.ReactNode; dark: boolean }) {
  return (
    <div className={`px-3 py-1.5 rounded-lg border text-[11px] font-bold ${dark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"}`}>
      {children}
    </div>
  );
}
