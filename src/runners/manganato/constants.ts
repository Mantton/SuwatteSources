import {
  CollectionExcerpt,
  CollectionStyle,
  FilterType,
  Property,
} from "@suwatte/daisuke";

export const ADULT_IDS = ["3", "9", "36"];
export const GENRE_OPTIONS = [
  { id: "all", label: "ALL" },
  { id: "2", label: "Action" },
  { id: "3", label: "Adult" },
  { id: "4", label: "Adventure" },
  { id: "6", label: "Comedy" },
  { id: "7", label: "Cooking" },
  { id: "9", label: "Doujinshi" },
  { id: "10", label: "Drama" },
  { id: "11", label: "Ecchi" },
  { id: "12", label: "Fantasy" },
  { id: "13", label: "Gender bender" },
  { id: "14", label: "Harem" },
  { id: "15", label: "Historical" },
  { id: "16", label: "Horror" },
  { id: "45", label: "Isekai" },
  { id: "17", label: "Josei" },
  { id: "44", label: "Manhua" },
  { id: "43", label: "Manhwa" },
  { id: "19", label: "Martial arts" },
  { id: "20", label: "Mature" },
  { id: "21", label: "Mecha" },
  { id: "22", label: "Medical" },
  { id: "24", label: "Mystery" },
  { id: "25", label: "One shot" },
  { id: "26", label: "Psychological" },
  { id: "27", label: "Romance" },
  { id: "28", label: "School life" },
  { id: "29", label: "Sci fi" },
  { id: "30", label: "Seinen" },
  { id: "31", label: "Shoujo" },
  { id: "32", label: "Shoujo ai" },
  { id: "33", label: "Shounen" },
  { id: "34", label: "Shounen ai" },
  { id: "35", label: "Slice of life" },
  { id: "36", label: "Smut" },
  { id: "37", label: "Sports" },
  { id: "38", label: "Supernatural" },
  { id: "39", label: "Tragedy" },
  { id: "40", label: "Webtoons" },
  { id: "41", label: "Yaoi" },
  { id: "42", label: "Yuri" },
];

export const SORT_OPTONS = [
  { id: "latest", label: "Latest" },
  { id: "newest", label: "Newest" },
  { id: "topview", label: "Top Read" },
];

export const STATUS_OPTIONS = [
  { id: "all", label: "All" },
  { id: "completed", label: "Completed" },
  { id: "ongoing", label: "Ongoing" },
  { id: "drop", label: "Dropped" },
];

export const EXPLORE_COLLECTIONS: CollectionExcerpt[] = [
  {
    id: "top",
    title: "Top This Week",
    style: CollectionStyle.NORMAL,
  },
  {
    id: "new",
    title: "New Titles",
    style: CollectionStyle.NORMAL,
  },
  {
    id: "latest",
    title: "Latest Updates",
    style: CollectionStyle.UPDATE_LIST,
  },
];

export const FILTERS = [
  {
    id: "genre",
    title: "Genres",
    type: FilterType.EXCLUDABLE_MULTISELECT,
    options: GENRE_OPTIONS,
  },
  {
    id: "status",
    title: "Status",
    type: FilterType.SELECT,
    options: STATUS_OPTIONS,
  },
];

export const PROPERTIES: Property[] = [
  {
    id: "genre",
    label: "Genres",
    tags: GENRE_OPTIONS.map((v) => ({
      ...v,
      ...(ADULT_IDS.includes(v.id) && { adultContent: true }),
    })),
  },
];
