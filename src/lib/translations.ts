export type Language = "en" | "ne";

type Translation = {
  [key: string]: string | Translation;
};

const en: Translation = {
  siteName: "Nepal Utility Tool",
  availableTools: "Available Utilities",
  tools: "tools",
  dateConverter: "Date Converter",
  currencyConverter: "Currency Converter",
  languageConverter: "Language Converter",
  bsToAd: "BS ⇄ AD",
  live: "Live Rates",
  translate: "Translate",
  dateDescription:
      "Convert between Bikram Sambat and Gregorian calendars with weekday, relative time, and Devanagari output.",
  currencyDescription:
      "Live exchange rates with NPR-focused popular pairs, favorites, history, and CSV export.",
  languageDescription:
      "Translate between Nepali, English, Hindi and more — with quick swap and one-tap language pairs.",
  openTool: "Open tool",
  whyThisExists: "Why this exists",
  builtForNepal: "Built for Nepal",
  whyThisExistsDesc:
      "A growing collection of practical utilities that handle the small frictions of daily Nepali life — calendar gaps, currency math, and more on the way. Every tool shares the same fast, keyboard-friendly experience with offline-aware caching and dark mode.",
  quickHighlights: "Quick Highlights",
  bsDatesSupport: "BS dates from 1970 to 2099 supported",
  liveFxRates: "Live FX rates cached locally for one hour",
  activityLogExport: "Activity log with CSV export per tool",
  keyboardFirst: "Keyboard-first with dark mode persistence",
  toggleTheme: "Toggle theme",
  resetThemePreference: "Reset theme preference",
  quickHelp: "Quick Help",
  homeSettings: "Home Settings",
  useMainCards:
      "Use the main cards to open each utility. Your selected theme is shared across all tools.",
  toolSpecificHistory:
      "The Date, Currency, and Language pages each keep their own tool-specific history and preferences.",
  craftedWithCare: "Crafted with care · Made in Nepal",

  // Date Converter
  bsToAdFull: "BS TO AD",
  adToBs: "AD TO BS",
  swap: "Swap",
  year: "Year",
  month: "Month",
  day: "Day",
  executeConversion: "Execute Conversion",
  enter: "Enter",
  targetDate: "Target Date",
  copy: "Copy",
  copied: "Copied",
  share: "Share",
  activityLog: "Activity Log",
  export: "Export",
  clear: "Clear",
  noHistoryYet:
      "Your recent conversions will appear here for quick reference.",
  calendarInsight: "Calendar Insight",
  bsCalendarDesc:
      "The Bikram Sambat is a solar calendar based on ancient Hindu tradition. It is officially used in Nepal and is approximately 56 years and 8 months ahead of the AD calendar.",
  dateHelp: "Date Help",
  dateHelpDesc1:
      "Pick a mode, set year/month/day, and execute conversion. Press Enter to convert quickly.",
  dateHelpDesc2:
      "Use Today and Swap buttons to speed up common workflows between BS and AD.",
  dateSettings: "Date Settings",
  clearConversionHistory: "Clear conversion history",
  today: "Today",

  // Currency Converter
  liveExchangeRates: "Live Exchange Rates",
  sourceExchangerate: "Source: exchangerate-api.com",
  amount: "Amount",
  from: "From",
  to: "To",
  equals: "equals",
  loading: "Loading...",
  saved: "Saved",
  favoritesPopular: "Favorites & Popular",
  popularPairs: "Popular Pairs",
  nprFocused: "NPR Focused",
  tapToView: "Tap to view",
  noMatches: "No matches",
  searchCurrency: "Search currency...",
  base: "Base",
  currencies: "currencies",
  currencyHelp: "Currency Help",
  currencyHelpDesc1:
      "Choose currencies, enter amount, and use Copy to save the latest conversion to your activity log.",
  currencyHelpDesc2:
      "Use the star icon in currency search to pin favorite pairs. Refresh fetches fresh rates.",
  currencySettings: "Currency Settings",
  clearHistoryFavorites:
      "Clear history, favorites, and recent amounts",
  forexInsight: "Forex Insight",
  forexInsightDesc:
      "Rates are pulled live from exchangerate-api.com and refreshed every 24 hours. Cached locally for one hour to keep the app responsive.",
  copiedConversionsAppear:
      "Copied conversions will appear here for quick reference.",

  // Language Converter
  liveTranslation: "Live Translation",
  expand: "Expand",
  collapse: "Collapse",
  quickPairs: "Quick Pairs",
  oneTapPresets: "One-tap presets",
  howItWorks: "How it works",
  languageInsight: "Language Insight",
  languageInsightDesc:
      "Translation runs in a sandboxed embed from basiconlinetools.com. Your text stays inside that frame — we never read or store it.",
  languageHelp: "Language Help",
  languageHelpDesc1:
      "Select your source and target language, then type inside the embedded translator panel.",
  languageHelpDesc2:
      "Use quick-pairs for one-tap language combinations and Reload if the embed becomes unresponsive.",
  languageSettings: "Language Settings",
  resetLanguagePreferences: "Reset language preferences",
  embeddedService: "Embedded service · basiconlinetools.com",
  openInNewTab: "Open in new tab",
  reload: "Reload",
  help: "Help",
  settings: "Settings",
};

const ne: Translation = {
  siteName: "नेपाल उपयोगिता उपकरण",
  availableTools: "उपलब्ध उपकरणहरू",
  tools: "उपकरणहरू",

  dateConverter: "मिति रूपान्तरण",
  currencyConverter: "मुद्रा रूपान्तरण",
  languageConverter: "भाषा अनुवाद",

  bsToAd: "वि.सं ⇄ ई.सं",
  live: "प्रत्यक्ष दरहरू",
  translate: "अनुवाद",

  dateDescription:
      "विक्रम संवत् र अंग्रेजी मितिबीच वार, सापेक्ष समय तथा देवनागरी परिणामसहित रूपान्तरण गर्नुहोस्।",

  currencyDescription:
      "NPR केन्द्रित लोकप्रिय मुद्रा जोडी, मनपर्ने सूची, इतिहास तथा CSV निर्यातसहित प्रत्यक्ष विनिमय दरहरू।",

  languageDescription:
      "नेपाली, अंग्रेजी, हिन्दी लगायत अन्य भाषाहरूबीच छिटो स्वाप र एक-ट्याप भाषिक जोडीमार्फत अनुवाद गर्नुहोस्।",

  openTool: "उपकरण खोल्नुहोस्",

  whyThisExists: "यो किन बनाइएको हो",
  builtForNepal: "नेपालका लागि निर्माण गरिएको",

  whyThisExistsDesc:
      "दैनिक नेपाली जीवनका साना समस्याहरू समाधान गर्न बनाइएको उपयोगी उपकरणहरूको संग्रह — मिति रूपान्तरण, मुद्रा गणना र अन्य धेरै सुविधाहरू। सबै उपकरणहरू छिटो, सहज, अफलाइन क्यासिङ तथा डार्क मोड समर्थनसहित उपलब्ध छन्।",

  quickHighlights: "मुख्य विशेषताहरू",

  bsDatesSupport:
      "वि.सं १९७० देखि २०९९ सम्मका मितिहरू समर्थित",

  liveFxRates:
      "प्रत्यक्ष विदेशी विनिमय दरहरू १ घण्टासम्म स्थानीय रूपमा सुरक्षित",

  activityLogExport:
      "प्रत्येक उपकरणमा CSV निर्यातसहित गतिविधि इतिहास",

  keyboardFirst:
      "किबोर्डमैत्री अनुभव तथा डार्क मोड समर्थन",

  toggleTheme: "थिम परिवर्तन गर्नुहोस्",
  resetThemePreference: "थिम प्राथमिकता रिसेट गर्नुहोस्",

  quickHelp: "छिटो सहायता",
  homeSettings: "मुख्य सेटिङहरू",

  useMainCards:
      "प्रत्येक उपकरण खोल्न मुख्य कार्डहरू प्रयोग गर्नुहोस्। तपाईंले चयन गरेको थिम सबै उपकरणहरूमा लागू हुनेछ।",

  toolSpecificHistory:
      "मिति, मुद्रा तथा भाषा पृष्ठहरूले आफ्नै इतिहास र प्राथमिकताहरू सुरक्षित राख्छन्।",

  craftedWithCare:
      "मायासाथ निर्माण गरिएको · नेपालमा बनाइएको",

  // Date Converter
  bsToAdFull: "वि.सं → ई.सं",
  adToBs: "ई.सं → वि.सं",

  swap: "साट्नुहोस्",

  year: "वर्ष",
  month: "महिना",
  day: "दिन",

  executeConversion: "रूपान्तरण गर्नुहोस्",

  enter: "इन्टर",

  targetDate: "लक्षित मिति",

  copy: "प्रतिलिपि",
  copied: "प्रतिलिपि भयो",

  share: "साझा गर्नुहोस्",

  activityLog: "गतिविधि इतिहास",

  export: "निर्यात",
  clear: "खाली गर्नुहोस्",

  noHistoryYet:
      "तपाईंका हालैका रूपान्तरणहरू यहाँ देखाइनेछन्।",

  calendarInsight: "क्यालेन्डर जानकारी",

  bsCalendarDesc:
      "विक्रम संवत् प्राचीन हिन्दु परम्परामा आधारित सौर्य पात्रो हो। यो नेपालमा आधिकारिक रूपमा प्रयोग गरिन्छ र अंग्रेजी पात्रोभन्दा करिब ५६ वर्ष ८ महिना अगाडि छ।",

  dateHelp: "मिति सहायता",

  dateHelpDesc1:
      "मोड चयन गर्नुहोस्, वर्ष/महिना/दिन सेट गर्नुहोस् र रूपान्तरण गर्नुहोस्। छिटो रूपान्तरणका लागि Enter थिच्नुहोस्।",

  dateHelpDesc2:
      "वि.सं र ई.सं बीच छिटो परिवर्तन गर्न Today र Swap बटन प्रयोग गर्नुहोस्।",

  dateSettings: "मिति सेटिङहरू",

  clearConversionHistory:
      "रूपान्तरण इतिहास खाली गर्नुहोस्",

  today: "आज",

  // Currency Converter
  liveExchangeRates: "प्रत्यक्ष विनिमय दरहरू",

  sourceExchangerate:
      "स्रोत: exchangerate-api.com",

  amount: "रकम",

  from: "बाट",
  to: "सम्म",

  equals: "बराबर",

  loading: "लोड हुँदैछ...",

  saved: "सुरक्षित भयो",

  favoritesPopular:
      "मनपर्ने तथा लोकप्रिय",

  popularPairs: "लोकप्रिय मुद्रा जोडीहरू",

  nprFocused: "NPR केन्द्रित",

  tapToView: "हेर्न ट्याप गर्नुहोस्",

  noMatches: "कुनै परिणाम भेटिएन",

  searchCurrency: "मुद्रा खोज्नुहोस्...",

  base: "आधार",

  currencies: "मुद्राहरू",

  currencyHelp: "मुद्रा सहायता",

  currencyHelpDesc1:
      "मुद्रा चयन गर्नुहोस्, रकम प्रविष्ट गर्नुहोस् र पछिल्लो रूपान्तरण सुरक्षित गर्न Copy प्रयोग गर्नुहोस्।",

  currencyHelpDesc2:
      "मनपर्ने मुद्रा जोडी सुरक्षित गर्न तारा चिन्ह प्रयोग गर्नुहोस्। Refresh ले नयाँ दरहरू ल्याउँछ।",

  currencySettings: "मुद्रा सेटिङहरू",

  clearHistoryFavorites:
      "इतिहास, मनपर्ने तथा हालका रकमहरू हटाउनुहोस्",

  forexInsight: "विदेशी मुद्रा जानकारी",

  forexInsightDesc:
      "दरहरू exchangerate-api.com बाट प्रत्यक्ष ल्याइन्छन् र प्रत्येक २४ घण्टामा अद्यावधिक गरिन्छन्। एप छिटो बनाउन १ घण्टासम्म स्थानीय रूपमा सुरक्षित गरिन्छ।",

  copiedConversionsAppear:
      "प्रतिलिपि गरिएका रूपान्तरणहरू यहाँ देखाइनेछन्।",

  // Language Converter
  liveTranslation: "प्रत्यक्ष अनुवाद",

  expand: "फैलाउनुहोस्",
  collapse: "संक्षिप्त गर्नुहोस्",

  quickPairs: "छिटो भाषा जोडीहरू",

  oneTapPresets: "एक-ट्याप प्रिसेटहरू",

  howItWorks: "यसले कसरी काम गर्छ",

  languageInsight: "भाषा जानकारी",

  languageInsightDesc:
      "अनुवाद basiconlinetools.com को सुरक्षित एम्बेडमार्फत सञ्चालन हुन्छ। तपाईंको पाठ त्यही फ्रेमभित्र रहन्छ — हामी यसलाई पढ्दैनौं वा सुरक्षित गर्दैनौं।",

  languageHelp: "भाषा सहायता",

  languageHelpDesc1:
      "स्रोत र लक्षित भाषा चयन गर्नुहोस्, त्यसपछि एम्बेड गरिएको अनुवाद प्यानलभित्र टाइप गर्नुहोस्।",

  languageHelpDesc2:
      "एक-ट्याप भाषा संयोजनका लागि Quick Pairs प्रयोग गर्नुहोस् र एम्बेडले काम नगरेमा Reload गर्नुहोस्।",

  languageSettings: "भाषा सेटिङहरू",

  resetLanguagePreferences:
      "भाषा प्राथमिकताहरू रिसेट गर्नुहोस्",

  embeddedService:
      "एम्बेड गरिएको सेवा · basiconlinetools.com",

  openInNewTab: "नयाँ ट्याबमा खोल्नुहोस्",

  reload: "पुनः लोड",

  help: "सहायता",

  settings: "सेटिङहरू",
};

export const translations: Record<Language, Translation> = {
  en,
  ne,
};

export function t(key: string, lang: Language): string {
  const value = translations[lang]?.[key];
  return typeof value === "string" ? value : key;
}