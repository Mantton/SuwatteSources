import {
  CollectionExcerpt,
  CollectionStyle,
  Filter,
  FilterType,
  SearchSort,
  Status,
} from "@suwatte/daisuke";
import { capitalize } from "lodash";

export const NEPNEP_DOMAINS = [
  {
    name: "MangaSee",
    url: "https://mangasee123.com",
    id: "see",
  },
  {
    name: "MangaLife",
    url: "https://manga4life.com",
    id: "life",
  },
];

const STATUSES = ["ongoing", "complete", "hiatus", "discontinued", "cancelled"];

export const STATUS_KEYS: Record<string, Status> = {
  ongoing: Status.ONGOING,
  complete: Status.COMPLETED,
  hiatus: Status.HIATUS,
  cancelled: Status.CANCELLED,
  discontinued: Status.CANCELLED,
};
export const ADULT_TAGS = ["mature", "adult", "hentai", "smut"];
export const VERTICAL_TYPES = ["OEL", "Manhwa", "Manhua"];

export const BASE_EXPLORE_COLLECTIONS: CollectionExcerpt[] = [
  {
    id: "trending",
    title: "Trending Titles ",
    subtitle: "Hottest updates being read right now!",
    style: CollectionStyle.INFO,
  },
  {
    id: "admin_recommendations",
    title: "Admin Recommendations",
    subtitle: "Titles worth your time",
    style: CollectionStyle.GALLERY,
  },
  {
    id: "hot_monthly",
    title: "Top Titles This Month ",
    subtitle: "Certified Bangers",
    style: CollectionStyle.NORMAL,
  },
  {
    id: "new",
    title: "New Titles",
    subtitle: "Just added to the site.",
    style: CollectionStyle.NORMAL,
  },
  {
    id: "latest",
    title: "Latest Updates ",
    subtitle: "Top of the morning.",
    style: CollectionStyle.UPDATE_LIST,
  },
];

export const HIGHLIGHT_LIMIT = 30;

export const PATHS: Record<string, RegExp> = {
  trending: /vm.HotUpdateJSON = (.*);/,
  latest: /vm.LatestJSON = (.*);/,
  admin_recommendations: /vm.RecommendationJSON = (.*);/,
  new: /vm.NewSeriesJSON = (.*);/,
  chapters: /vm.Chapters = (.*);/,
  full_directory: /vm.FullDirectory = (.*);/,
  directory: /vm.Directory = (.*);/,
  related: /vm.RelatedSeriesJSON = (.*);/,
  hot_monthly: /vm.TopTenJSON = (.*);/,
  genre_tag: /"Genre"\s*: (.*)/,
  format_tag: /"Type"\s*: (.*),/g,
  chapter_data_domain: /vm.CurPathName = (.*);/,
  chapter_data_path: /vm.IndexName = (.*);/,
  chapter_data_chapter: /vm.CurChapter = (.*);/,
};

export const SORT_KEYS: Record<string, string> = {
  views_all: "v",
  views_monthly: "vm",
  recent: "lt",
  alphabetically: "s",
};

export const TAG_PREFIX = {
  publication: "p_status",
  scanlation: "s_status",
  type: "type",
  year: "released",
  lang: "o_translation",
  author: "author",
  translation: "translation",
  genres: "genres",
};

export const SEARCH_SORTERS: SearchSort[] = [
  {
    id: "views_all",
    label: "Most Popular (All Time)",
  },
  {
    id: "views_monthly",
    label: "Most Popular (Monthly)",
  },
  {
    id: "recent",
    label: "Recently Released Chapter",
  },
  {
    id: "alphabetically",
    label: "Alphabetically",
  },
];

export const DEFAULT_FILTERS: Filter[] = [
  {
    id: TAG_PREFIX.publication,
    title: "Publication Status",
    type: FilterType.MULTISELECT,
    options: STATUSES.map((v) => ({ id: v, label: capitalize(v) })),
  },
  {
    id: TAG_PREFIX.scanlation,
    title: "Scan Status",
    options: STATUSES.map((v) => ({ id: v, label: capitalize(v) })),
    type: FilterType.MULTISELECT,
  },
  {
    id: TAG_PREFIX.translation,
    title: "Translation Status",
    label: "Official Translation Only",
    type: FilterType.TOGGLE,
  },
];

export const IMAGE_HOST = "https://cover.mangabeast01.com/cover";
