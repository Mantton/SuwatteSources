type Language = {
  id: string;
  label: string;
  iso: string;
};

export const getURLSuffixFor = (id: string) => {
  switch (id) {
    case "medium":
      return ".512.jpg";
    case "low":
      return ".256.jpg";
    default:
      return "";
  }
};

export const languages: Language[] = [
  {
    // Arabic
    label: "اَلْعَرَبِيَّةُ",
    id: "ar",
    iso: "sa",
  },
  {
    // Bulgarian
    label: "български",
    id: "bg",
    iso: "bg",
  },
  {
    // Bengali
    label: "বাংলা",
    id: "bn",
    iso: "bd",
  },
  {
    // Catalan
    label: "Català",
    id: "ca",
    iso: "es",
  },
  {
    // Czech
    label: "Čeština",
    id: "cs",
    iso: "cz",
  },
  {
    // Danish
    label: "Dansk",
    id: "da",
    iso: "dk",
  },
  {
    // German
    label: "Deutsch",
    id: "de",
    iso: "de",
  },
  {
    // English
    label: "English",
    id: "en",
    iso: "gb",
  },
  {
    // Spanish
    label: "Español",
    id: "es",
    iso: "es",
  },
  {
    // Spanish (Latin American)
    label: "Español (Latinoamérica)",
    id: "es-la",
    iso: "es",
  },
  {
    // Farsi
    label: "فارسی",
    id: "fa",
    iso: "ir",
  },
  {
    // Finnish
    label: "Suomi",
    id: "fi",
    iso: "fi",
  },
  {
    // French
    label: "Français",
    id: "fr",
    iso: "fr",
  },
  {
    // Hebrew
    label: "עִבְרִית",
    id: "he",
    iso: "il",
  },
  {
    // Hindi
    label: "हिन्दी",
    id: "hi",
    iso: "in",
  },
  {
    // Hungarian
    label: "Magyar",
    id: "hu",
    iso: "hu",
  },
  {
    // Indonesian
    label: "Indonesia",
    id: "id",
    iso: "id",
  },
  {
    // Italian
    label: "Italiano",
    id: "it",
    iso: "it",
  },
  {
    // Japanese
    label: "日本語",
    id: "ja",
    iso: "jp",
  },
  {
    // Korean
    label: "한국어",
    id: "ko",
    iso: "kr",
  },
  {
    // Lithuanian
    label: "Lietuvių",
    id: "lt",
    iso: "lt",
  },
  {
    // Mongolian
    label: "монгол",
    id: "mn",
    iso: "mn",
  },
  {
    // Malay
    label: "Melayu",
    id: "ms",
    iso: "my",
  },
  {
    // Burmese
    label: "မြန်မာဘာသာ",
    id: "my",
    iso: "mm",
  },
  {
    // Dutch
    label: "Nederlands",
    id: "nl",
    iso: "nl",
  },
  {
    // Norwegian
    label: "Norsk",
    id: "no",
    iso: "no",
  },
  {
    // Polish
    label: "Polski",
    id: "pl",
    iso: "pl",
  },
  {
    // Portuguese
    label: "Português",
    id: "pt",
    iso: "pt",
  },
  {
    // Portuguese (Brazilian)
    label: "Português (Brasil)",
    id: "pt-br",
    iso: "pt",
  },
  {
    // Romanian
    label: "Română",
    id: "ro",
    iso: "ro",
  },
  {
    // Russian
    label: "Pусский",
    id: "ru",
    iso: "ru",
  },
  {
    // Serbian
    label: "Cрпски",
    id: "sr",
    iso: "rs",
  },
  {
    // Swedish
    label: "Svenska",
    id: "sv",
    iso: "se",
  },
  {
    // Thai
    label: "ไทย",
    id: "th",
    iso: "th",
  },
  {
    // Tagalog
    label: "Filipino",
    id: "tl",
    iso: "ph",
  },
  {
    // Turkish
    label: "Türkçe",
    id: "tr",
    iso: "tr",
  },
  {
    // Ukrainian
    label: "Yкраї́нська",
    id: "uk",
    iso: "ua",
  },
  {
    // Vietnamese
    label: "Tiếng Việt",
    id: "vi",
    iso: "vn",
  },
  {
    // Chinese (Simplified)
    label: "中文 (简化字)",
    id: "zh",
    iso: "cn",
  },
  {
    // Chinese (Traditional)
    label: "中文 (繁體字)",
    id: "zh-hk",
    iso: "hk",
  },
];

export const languageLabel = (lang: string) => {
  return languages.find((v) => v.id === lang)?.label ?? lang.toUpperCase();
};

export const languageISO = (lang: string) => {
  return languages.find((v) => v.id === lang)?.iso ?? "UNKNOWN";
};

export type MimasRecommendation = {
  sourceId: string;
  contentId: string;
  title: string;
  coverImage: string;
};
