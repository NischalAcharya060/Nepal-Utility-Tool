"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import Link from "next/link";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { THEME_KEY } from "@/lib/theme";
import { LANGUAGES, type Language } from "@/lib/i18n";
import { useI18n } from "@/lib/i18n-context";
import ActionModal from "@/components/ui/ActionModal";
import {
  ArrowLeftRight, RefreshCw, Copy, Check, Search, History, Trash2, Download,
  AlertCircle, Settings, HelpCircle, Sun, Moon, Wallet,
  ChevronDown, Star, Globe2, ArrowUpRight, ArrowLeft,
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
const CACHE_TTL_MS = 60 * 60 * 1000;
const HISTORY_KEY = "ncc_history_v1";
const FAVS_KEY = "ncc_favs_v1";
const RECENT_KEY = "ncc_recent_v1";

const POPULAR_PAIRS: Array<[string, string]> = [
  ["USD", "NPR"], ["EUR", "NPR"], ["GBP", "NPR"], ["INR", "NPR"],
  ["AUD", "NPR"], ["JPY", "NPR"], ["AED", "NPR"], ["SAR", "NPR"],
];

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
  const { lang, setLang, t } = useI18n();
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
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const fromRef = useRef<HTMLDivElement>(null);
  const toRef = useRef<HTMLDivElement>(null);

  const isNe = lang === "ne";

  useEffect(() => {
    try {
      const h = localStorage.getItem(HISTORY_KEY);
      if (h) setHistory(JSON.parse(h));
      const f = localStorage.getItem(FAVS_KEY);
      if (f) setFavorites(JSON.parse(f));
      const th = localStorage.getItem(THEME_KEY);
      if (th === "dark") setDark(true);
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

  useEffect(() => { loadRates(from); }, [from, loadRates]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const tgt = e.target as Node;
      if (fromRef.current && !fromRef.current.contains(tgt) && toRef.current && !toRef.current.contains(tgt)) {
        setOpenSelect(null);
      }
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenSelect(null); };
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

  const clearToolData = () => {
    setHistory([]);
    setFavorites([]);
    setRecentAmounts([]);
    try {
      localStorage.removeItem(HISTORY_KEY);
      localStorage.removeItem(FAVS_KEY);
      localStorage.removeItem(RECENT_KEY);
      localStorage.removeItem(CACHE_KEY_PREFIX + from);
    } catch {}
    setShowSettings(false);
  };

  const updatedLabel = useMemo(() => {
    if (!rates) return "";
    try {
      return new Date(rates.time_last_update_unix * 1000).toLocaleString([], {
        dateStyle: "medium", timeStyle: "short",
      });
    } catch { return rates.time_last_update_utc; }
  }, [rates]);

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
                  <Wallet size={15} />
                </div>
                <div className="leading-tight min-w-0">
                  <div className="text-[13px] font-semibold tracking-tight truncate">{t("currencyConverter")}</div>
                  <div className={`text-[10px] tracking-[0.16em] uppercase ${muted}`}>
                    {isNe ? "प्रत्यक्ष विदेशी विनिमय" : "Live foreign exchange"}
                  </div>
                </div>
              </div>
              {rates && (
                <div className={`hidden xl:flex items-center gap-2 ml-2 pl-4 border-l ${hairline} text-[11px] ${muted}`} suppressHydrationWarning>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="tracking-wide">{isNe ? "अद्यावधिक" : "Updated"} {updatedLabel}</span>
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
              <button
                onClick={() => loadRates(from, true)}
                disabled={loading}
                className={`inline-flex h-9 w-9 items-center justify-center rounded-md border ${iconBtn} disabled:opacity-40`}
                aria-label="Refresh"
                title="Refresh rates"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
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
                {isNe ? "उपकरण · ०२" : "Utility · 02"}
              </div>
              <h1 className="mt-2 text-[28px] md:text-[32px] font-semibold tracking-tight leading-tight">
                {isNe ? "मुद्रा रूपान्तरण" : "Currency Exchange"}
              </h1>
            </div>
            <span className={`hidden md:block text-[11px] uppercase tracking-[0.16em] ${muted}`}>
              {isNe ? "exchangerate-api.com बाट" : "Source · exchangerate-api.com"}
            </span>
          </div>

          {/* Converter */}
          <div className={`overflow-hidden rounded-xl border ${hairline} ${surface}`}>
            {/* Amount */}
            <div className={`p-6 md:p-7 border-b ${hairline}`}>
              <label className={`text-[10px] font-medium uppercase tracking-[0.16em] ${muted}`}>{t("amount")}</label>
              <input
                type="text"
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d.,-]/g, ""))}
                placeholder="0.00"
                className={`mt-2 w-full bg-transparent border-0 outline-none text-[34px] md:text-[44px] font-semibold tracking-tight tabular-nums ${dark ? "placeholder:text-zinc-700" : "placeholder:text-zinc-300"}`}
              />
              {recentAmounts.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] uppercase tracking-[0.16em] ${muted}`}>
                    {isNe ? "हालका" : "Recent"}
                  </span>
                  {recentAmounts.map(a => (
                    <button
                      key={a}
                      onClick={() => setAmount(String(a))}
                      className={`rounded-full border ${hairline} px-2.5 py-1 text-[11px] font-medium tabular-nums transition ${dark ? "hover:bg-zinc-900" : "hover:bg-zinc-50"}`}
                    >
                      {formatPlain(a)}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* From / Swap / To */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-start">
              <CurrencySelector
                label={t("from")}
                code={from}
                open={openSelect === "from"}
                onOpen={() => { setOpenSelect(openSelect === "from" ? null : "from"); setSearch(""); }}
                onSelect={(c) => handleSelect(c, "from")}
                currencies={filteredCurrencies}
                search={search}
                setSearch={setSearch}
                dark={dark}
                hairline={hairline}
                inputCls={inputCls}
                muted={muted}
                panelRef={fromRef}
                favorites={favorites}
                toggleFavorite={(c) => toggleFavorite(`${c}-${to}`)}
                pairKeyFor={(c) => `${c}-${to}`}
                placeholderEn="Search currency..."
                placeholderNe="मुद्रा खोज्नुहोस्..."
                isNe={isNe}
              />

              <div className={`flex items-center justify-center px-4 py-2 md:py-7 border-y md:border-y-0 md:border-x ${hairline}`}>
                <button
                  onClick={handleSwap}
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full border ${iconBtn} rotate-90 md:rotate-0 transition hover:border-emerald-500/50`}
                  aria-label="Swap"
                  title="Swap"
                >
                  <ArrowLeftRight size={15} />
                </button>
              </div>

              <CurrencySelector
                label={t("to")}
                code={to}
                open={openSelect === "to"}
                onOpen={() => { setOpenSelect(openSelect === "to" ? null : "to"); setSearch(""); }}
                onSelect={(c) => handleSelect(c, "to")}
                currencies={filteredCurrencies}
                search={search}
                setSearch={setSearch}
                dark={dark}
                hairline={hairline}
                inputCls={inputCls}
                muted={muted}
                panelRef={toRef}
                favorites={favorites}
                toggleFavorite={(c) => toggleFavorite(`${from}-${c}`)}
                pairKeyFor={(c) => `${from}-${c}`}
                placeholderEn="Search currency..."
                placeholderNe="मुद्रा खोज्नुहोस्..."
                isNe={isNe}
              />
            </div>

            {error && (
              <div className={`mx-6 mb-6 flex items-center gap-2 rounded-md border px-3 py-2.5 text-[12px] ${dark ? "border-rose-900/60 bg-rose-950/40 text-rose-300" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                <AlertCircle size={13} /> {error}
              </div>
            )}

            {/* Result */}
            <div className={`border-t ${hairline} ${dark ? "bg-zinc-950/60" : "bg-zinc-50/60"} p-6 md:p-8`}>
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div className="flex-1 min-w-0 space-y-3">
                  <div className={`text-[11px] uppercase tracking-[0.18em] ${muted} flex items-center gap-2`}>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {numericAmount > 0 ? formatPlain(numericAmount) : "0"} {from} {t("equals")}
                  </div>
                  <h2 className="text-[28px] md:text-[40px] font-semibold tracking-tight leading-tight tabular-nums break-words">
                    {loading && !rates ? t("loading") : rate ? formatNumber(converted, to) : "—"}
                  </h2>
                  {rate > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Tag dark={dark} hairline={hairline}>1 {from} = <span className="tabular-nums">{formatPlain(rate)}</span> {to}</Tag>
                      <Tag dark={dark} hairline={hairline}>1 {to} = <span className="tabular-nums">{formatPlain(inverseRate)}</span> {from}</Tag>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleCopy}
                    disabled={!rate}
                    className={`inline-flex items-center gap-2 rounded-md px-4 py-2.5 text-[12px] font-medium transition disabled:opacity-40 disabled:cursor-not-allowed ${
                      copied
                        ? "bg-emerald-500 text-white"
                        : dark ? "bg-zinc-100 text-zinc-900 hover:bg-white" : "bg-zinc-900 text-white hover:bg-zinc-800"
                    }`}
                  >
                    {copied ? <Check size={14} /> : <Copy size={14} />}
                    {copied ? t("saved") : t("copy")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Popular pairs */}
          <div className={`rounded-xl border ${hairline} ${surface}`}>
            <div className={`flex items-center justify-between px-5 py-4 border-b ${hairline}`}>
              <div className="flex items-center gap-2">
                <Star size={14} className="text-amber-500" />
                <h3 className="text-[12px] font-semibold tracking-wide uppercase">
                  {favorites.length > 0 ? t("favoritesPopular") : t("popularPairs")}
                </h3>
              </div>
              <span className={`text-[10px] uppercase tracking-[0.16em] ${muted}`}>{t("nprFocused")}</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-transparent">
              {[...favorites.map(f => f.split("-") as [string, string]), ...POPULAR_PAIRS]
                .filter((p, i, arr) => arr.findIndex(q => q[0] === p[0] && q[1] === p[1]) === i)
                .slice(0, 8)
                .map(([f, toCode]) => {
                  const r = rates && f === rates.base_code ? rates.rates[toCode] : null;
                  const isActive = from === f && to === toCode;
                  return (
                    <button
                      key={`${f}-${toCode}`}
                      onClick={() => { setFrom(f); setTo(toCode); }}
                      className={`group relative flex flex-col items-start gap-1 p-4 text-left transition ${
                        isActive
                          ? (dark ? "bg-emerald-500/10" : "bg-emerald-50")
                          : `${dark ? "hover:bg-zinc-900/60" : "hover:bg-zinc-50"}`
                      }`}
                    >
                      {isActive && <span className="absolute left-0 top-3 bottom-3 w-0.5 rounded-r bg-emerald-500" />}
                      <div className="flex items-center gap-1.5 text-[12px] font-medium">
                        <span className="text-base leading-none">{CURRENCY_FLAGS[f] || ""}</span>
                        <span>{f}</span>
                        <span className={muted}>→</span>
                        <span className="text-base leading-none">{CURRENCY_FLAGS[toCode] || ""}</span>
                        <span>{toCode}</span>
                      </div>
                      <p className={`text-[11px] tabular-nums ${muted}`}>
                        {r ? `1 = ${formatPlain(r)}` : t("tapToView")}
                      </p>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Insight */}
          <div className={`grid md:grid-cols-[auto_1fr] gap-6 rounded-xl border ${hairline} ${surface} p-6`}>
            <div className={`flex h-10 w-10 items-center justify-center rounded-md border ${hairline}`}>
              <Wallet size={16} />
            </div>
            <div>
              <div className={`text-[11px] uppercase tracking-[0.16em] ${muted}`}>{t("forexInsight")}</div>
              <p className={`mt-2 text-[14px] leading-relaxed ${subtle}`}>{t("forexInsightDesc")}</p>
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
                    <Wallet size={16} className={muted} />
                  </div>
                  <p className={`mt-3 text-[12px] px-4 ${muted}`}>{t("copiedConversionsAppear")}</p>
                </div>
              ) : (
                <ul>
                  {history.map((item, idx) => (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => { setFrom(item.from); setTo(item.to); setAmount(String(item.amount)); }}
                        className={`w-full text-left rounded-lg px-3 py-3 transition ${dark ? "hover:bg-zinc-900/60" : "hover:bg-zinc-50"}`}
                      >
                        <div className={`flex items-center justify-between text-[10px] uppercase tracking-[0.14em] ${muted} mb-1.5`}>
                          <span className="tabular-nums">{String(idx + 1).padStart(2, "0")} · {item.from} → {item.to}</span>
                          <span suppressHydrationWarning>{item.time}</span>
                        </div>
                        <div className={`text-[12px] tabular-nums ${subtle}`}>{formatPlain(item.amount)} {item.from}</div>
                        <div className={`mt-0.5 text-[13px] font-medium tabular-nums ${dark ? "text-zinc-100" : "text-zinc-900"}`}>
                          {formatPlain(item.result)} {item.to}
                        </div>
                        <div className={`text-[10px] tabular-nums ${muted}`}>@ {formatPlain(item.rate)}</div>
                      </button>
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
          {rates && (
            <p className={`text-[11px] ${muted}`}>
              {t("base")} · {rates.base_code} · {Object.keys(rates.rates).length} {t("currencies")}
            </p>
          )}
        </div>
      </footer>

      <ActionModal open={showHelp} onClose={() => setShowHelp(false)} title={t("currencyHelp")} dark={dark}>
        <p>{t("currencyHelpDesc1")}</p>
        <p>{t("currencyHelpDesc2")}</p>
      </ActionModal>

      <ActionModal open={showSettings} onClose={() => setShowSettings(false)} title={t("currencySettings")} dark={dark}>
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
          {t("clearHistoryFavorites")}
        </button>
      </ActionModal>
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
  hairline: string;
  inputCls: string;
  muted: string;
  panelRef: React.RefObject<HTMLDivElement | null>;
  favorites: string[];
  toggleFavorite: (c: string) => void;
  pairKeyFor: (c: string) => string;
  placeholderEn: string;
  placeholderNe: string;
  isNe: boolean;
}) {
  const {
    label, code, open, onOpen, onSelect, currencies, search, setSearch,
    dark, hairline, muted, panelRef, favorites, toggleFavorite, pairKeyFor,
    placeholderEn, placeholderNe, isNe,
  } = props;
  return (
    <div className={`relative p-5 ${open ? "z-[60]" : ""}`} ref={panelRef}>
      <label className={`text-[10px] font-medium uppercase tracking-[0.16em] ${muted}`}>{label}</label>
      <button
        type="button"
        onClick={onOpen}
        className={`mt-2 w-full flex items-center justify-between gap-3 rounded-md border px-3 py-2.5 text-left transition ${
          dark ? "bg-zinc-950 border-zinc-800 hover:border-zinc-700" : "bg-white border-zinc-200 hover:border-zinc-300"
        }`}
      >
        <span className="flex items-center gap-3 min-w-0">
          <span className="text-2xl leading-none shrink-0">{CURRENCY_FLAGS[code] || "🏳️"}</span>
          <span className="flex flex-col items-start min-w-0">
            <span className="text-[15px] font-semibold tracking-tight">{code}</span>
            <span className={`text-[11px] truncate ${muted}`}>{CURRENCY_NAMES[code] || code}</span>
          </span>
        </span>
        <ChevronDown size={15} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className={`absolute left-5 right-5 mt-2 rounded-md border shadow-2xl overflow-hidden ${dark ? "bg-zinc-950 border-zinc-800" : "bg-white border-zinc-200"}`}>
          <div className={`p-2 border-b ${hairline}`}>
            <div className={`flex items-center gap-2 rounded px-2.5 py-2 ${dark ? "bg-zinc-900" : "bg-zinc-50"}`}>
              <Search size={13} className={muted} />
              <input
                autoFocus
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isNe ? placeholderNe : placeholderEn}
                className="bg-transparent outline-none text-[13px] w-full"
              />
            </div>
          </div>
          <div className="max-h-72 overflow-auto">
            {currencies.length === 0 ? (
              <p className={`p-4 text-[12px] text-center ${muted}`}>{isNe ? "कुनै परिणाम भेटिएन" : "No matches"}</p>
            ) : currencies.map(c => {
              const isFav = favorites.includes(pairKeyFor(c));
              return (
                <div
                  key={c}
                  className={`flex items-center justify-between px-3 py-2 cursor-pointer transition ${dark ? "hover:bg-zinc-900" : "hover:bg-zinc-50"} ${c === code ? (dark ? "bg-zinc-900" : "bg-emerald-50") : ""}`}
                  onClick={() => onSelect(c)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base leading-none">{CURRENCY_FLAGS[c] || "🏳️"}</span>
                    <div className="min-w-0">
                      <p className="text-[13px] font-semibold tracking-tight">{c}</p>
                      <p className={`text-[10px] truncate ${muted}`}>{CURRENCY_NAMES[c] || c}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(c); }}
                    className="p-1 rounded hover:bg-zinc-500/10"
                    aria-label="Toggle favorite"
                  >
                    <Star size={13} className={isFav ? "fill-amber-400 text-amber-400" : muted} />
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

function Tag({ children, dark, hairline }: { children: React.ReactNode; dark: boolean; hairline: string }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border ${hairline} px-2.5 py-1 text-[11px] font-medium ${dark ? "bg-zinc-950 text-zinc-300" : "bg-white text-zinc-700"}`}>
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
