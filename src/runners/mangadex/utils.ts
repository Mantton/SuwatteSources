import { Option } from "@suwatte/daisuke";

type Language = {
  label: string;
  languageCode: string;
  regionCode: string;
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
    languageCode: "ar",
    regionCode: "sa",
  },
  {
    // Bulgarian
    label: "български",
    languageCode: "bg",
    regionCode: "bg",
  },
  {
    // Bengali
    label: "বাংলা",
    languageCode: "bn",
    regionCode: "bd",
  },
  {
    // Catalan
    label: "Català",
    languageCode: "ca",
    regionCode: "es",
  },
  {
    // Czech
    label: "Čeština",
    languageCode: "cs",
    regionCode: "cz",
  },
  {
    // Danish
    label: "Dansk",
    languageCode: "da",
    regionCode: "dk",
  },
  {
    // German
    label: "Deutsch",
    languageCode: "de",
    regionCode: "de",
  },
  {
    // English
    label: "English",
    languageCode: "en",
    regionCode: "gb",
  },
  {
    // Spanish
    label: "Español",
    languageCode: "es",
    regionCode: "es",
  },
  {
    // Spanish (Latin American)
    label: "Español (Latinoamérica)",
    languageCode: "es-la",
    regionCode: "es",
  },
  {
    // Farsi
    label: "فارسی",
    languageCode: "fa",
    regionCode: "ir",
  },
  {
    // Finnish
    label: "Suomi",
    languageCode: "fi",
    regionCode: "fi",
  },
  {
    // French
    label: "Français",
    languageCode: "fr",
    regionCode: "fr",
  },
  {
    // Hebrew
    label: "עִבְרִית",
    languageCode: "he",
    regionCode: "il",
  },
  {
    // Hindi
    label: "हिन्दी",
    languageCode: "hi",
    regionCode: "in",
  },
  {
    // Hungarian
    label: "Magyar",
    languageCode: "hu",
    regionCode: "hu",
  },
  {
    // Indonesian
    label: "Indonesia",
    languageCode: "id",
    regionCode: "id",
  },
  {
    // Italian
    label: "Italiano",
    languageCode: "it",
    regionCode: "it",
  },
  {
    // Japanese
    label: "日本語",
    languageCode: "ja",
    regionCode: "jp",
  },
  {
    // Korean
    label: "한국어",
    languageCode: "ko",
    regionCode: "kr",
  },
  {
    // Lithuanian
    label: "Lietuvių",
    languageCode: "lt",
    regionCode: "lt",
  },
  {
    // Mongolian
    label: "монгол",
    languageCode: "mn",
    regionCode: "mn",
  },
  {
    // Malay
    label: "Melayu",
    languageCode: "ms",
    regionCode: "my",
  },
  {
    // Burmese
    label: "မြန်မာဘာသာ",
    languageCode: "my",
    regionCode: "mm",
  },
  {
    // Dutch
    label: "Nederlands",
    languageCode: "nl",
    regionCode: "nl",
  },
  {
    // Norwegian
    label: "Norsk",
    languageCode: "no",
    regionCode: "no",
  },
  {
    // Polish
    label: "Polski",
    languageCode: "pl",
    regionCode: "pl",
  },
  {
    // Portuguese
    label: "Português",
    languageCode: "pt",
    regionCode: "pt",
  },
  {
    // Portuguese (Brazilian)
    label: "Português (Brasil)",
    languageCode: "pt-br",
    regionCode: "pt",
  },
  {
    // Romanian
    label: "Română",
    languageCode: "ro",
    regionCode: "ro",
  },
  {
    // Russian
    label: "Pусский",
    languageCode: "ru",
    regionCode: "ru",
  },
  {
    // Serbian
    label: "Cрпски",
    languageCode: "sr",
    regionCode: "rs",
  },
  {
    // Swedish
    label: "Svenska",
    languageCode: "sv",
    regionCode: "se",
  },
  {
    // Thai
    label: "ไทย",
    languageCode: "th",
    regionCode: "th",
  },
  {
    // Tagalog
    label: "Filipino",
    languageCode: "tl",
    regionCode: "ph",
  },
  {
    // Turkish
    label: "Türkçe",
    languageCode: "tr",
    regionCode: "tr",
  },
  {
    // Ukrainian
    label: "Yкраї́нська",
    languageCode: "uk",
    regionCode: "ua",
  },
  {
    // Vietnamese
    label: "Tiếng Việt",
    languageCode: "vi",
    regionCode: "vn",
  },
  {
    // Chinese (Simplified)
    label: "中文 (简化字)",
    languageCode: "zh",
    regionCode: "cn",
  },
  {
    // Chinese (Traditional)
    label: "中文 (繁體字)",
    languageCode: "zh-hk",
    regionCode: "hk",
  },
];

export const languageLabel = (lang: string) => {
  return (
    languages.find((v) => v.languageCode === lang)?.label ?? lang.toUpperCase()
  );
};

export const languageCode = (lang: string) => {
  const t = languages.find((v) => v.languageCode == lang);
  if (!t) return "";

  return t.languageCode.includes("-")
    ? t.languageCode
    : t.languageCode + "-" + t.regionCode;
};

export type MimasRecommendation = {
  sourceId: string;
  contentId: string;
  title: string;
  coverImage: string;
};

export const CoverQualityOptions: Option[] = [
  {
    title: "Original",
    id: "original",
  },
  {
    title: "Medium",
    id: "medium",
  },
  {
    title: "Low",
    id: "low",
  },
];
