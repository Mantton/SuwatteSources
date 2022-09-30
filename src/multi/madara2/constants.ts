import { CollectionExcerpt, CollectionStyle } from "@suwatte/daisuke";
import { Context } from "./types";

export enum AJAX_DIRECTORY {
  LATEST = "latest",
  NAME = "alphabet",
  TRENDING_WEEKLY = "trending_weekly",
  TRENDING_DAILY = "trending_daily",
  TRENDING_MONTHLY = "trending_monthly",
  POPULAR_AT = "popular_allTime",
  COMPLETED = "completed",
  TOP_RATED = "rating",
  NEW = "new",
}

export const EXPLORE_SECTIONS: CollectionExcerpt[] = [
  {
    id: AJAX_DIRECTORY.POPULAR_AT,
    title: "Popular Titles",
    subtitle: `The "Must Reads"`,
    style: CollectionStyle.INFO,
  },
  {
    id: AJAX_DIRECTORY.TRENDING_DAILY,
    title: "Trending Daily",
    subtitle: `What we're "reading"`,
    style: CollectionStyle.NORMAL,
  },
  {
    id: AJAX_DIRECTORY.NEW,
    title: "Recently Added Series",
    subtitle: `Fresh from the bakery, discover new stories`,
    style: CollectionStyle.NORMAL,
  },
  {
    id: AJAX_DIRECTORY.TRENDING_WEEKLY,
    title: "Trending Weekly",
    subtitle: `Top Reads from this past week.`,
    style: CollectionStyle.NORMAL,
  },
  {
    id: AJAX_DIRECTORY.TOP_RATED,
    title: "Top Rated Titles",
    subtitle: `Guaranteed Bangers 🔥`,
    style: CollectionStyle.NORMAL,
  },
  {
    id: AJAX_DIRECTORY.TRENDING_MONTHLY,
    title: "Trending Monthly",
    subtitle: `Top Reads from this past month.`,
    style: CollectionStyle.NORMAL,
  },

  {
    id: AJAX_DIRECTORY.COMPLETED,
    title: "Completed Titles",
    subtitle: `Perfect for binging.`,
    style: CollectionStyle.NORMAL,
  },
  {
    id: AJAX_DIRECTORY.LATEST,
    title: "Latest Updates",
    style: CollectionStyle.UPDATE_LIST,
  },
];

export const DEFAULT_CONTEXT: Context = {
  baseUrl: "",
  contentPath: "manga",
  searchPath: "page",
  searchSelector: "div.c-tabs-item__content",
  imageSelector: "div.page-break > img",
  chapterUseAJAX: false,
  useLoadMoreSearch: true,
  filterNonMangaItems: true,
  showOnlyManga: true,
  titleSelector: "div.post-title h3, div.post-title h1",
  authorSelector: "div.author-content > a",
  artistSelector: "div.artist-content > a",
  statusSelector: "div.summary-content",
  summarySelector:
    "div.description-summary div.summary__content, div.summary_content div.post-content_item > h5 + div, div.summary_content div.manga-excerpt",
  thumbnailSelector: "div.summary_image img",
  genreSelector: "div.genres-content > a",
  tagSelector: "div.tags-content a",
  typeSelector: ".post-content_item:contains(Type) .summary-content",
  alternativeTitlesSelector:
    ".post-content_item:contains(Alt) .summary-content",

  forceAdult: false,
  adultTags: ["mature"],
};

export const TAG_PREFIX = {
  author: "author",
  artist: "artist",
  hashtag: "hashtag",
};

export const COMPLETED_STATUS_LIST = [
  "Completed",
  "Completo",
  "Concluído",
  "Concluido",
  "Terminé",
  "Hoàn Thành",
  "مكتملة",
  "مكتمل",
];

export const ONGOING_STATUS_LIST = [
  "OnGoing",
  "Продолжается",
  "Updating",
  "Em Lançamento",
  "Em lançamento",
  "Em andamento",
  "Em Andamento",
  "En cours",
  "Ativo",
  "Lançando",
  "Đang Tiến Hành",
  "Devam Ediyor",
  "Devam ediyor",
  "In Corso",
  "In Arrivo",
  "مستمرة",
  "مستمر",
  "En Curso",
];

export const HIATUS_STATUS_LIST = ["On Hold"];

export const CANCELLED_STATUS_LIST = ["Canceled"];
