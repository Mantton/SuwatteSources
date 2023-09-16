import {
  DirectoryFilter,
  ExcludableMultiSelectProp,
  FilterType,
  Option,
  PageSection,
  Property,
  SectionStyle,
} from "@suwatte/daisuke";

export const ADULT_IDS = ["3", "9", "36"];
export const GENRE_OPTIONS: Option[] = [
  { id: "all", title: "ALL" },
  { id: "2", title: "Action" },
  { id: "3", title: "Adult" },
  { id: "4", title: "Adventure" },
  { id: "6", title: "Comedy" },
  { id: "7", title: "Cooking" },
  { id: "9", title: "Doujinshi" },
  { id: "10", title: "Drama" },
  { id: "11", title: "Ecchi" },
  { id: "12", title: "Fantasy" },
  { id: "13", title: "Gender bender" },
  { id: "14", title: "Harem" },
  { id: "15", title: "Historical" },
  { id: "16", title: "Horror" },
  { id: "45", title: "Isekai" },
  { id: "17", title: "Josei" },
  { id: "44", title: "Manhua" },
  { id: "43", title: "Manhwa" },
  { id: "19", title: "Martial arts" },
  { id: "20", title: "Mature" },
  { id: "21", title: "Mecha" },
  { id: "22", title: "Medical" },
  { id: "24", title: "Mystery" },
  { id: "25", title: "One shot" },
  { id: "26", title: "Psychological" },
  { id: "27", title: "Romance" },
  { id: "28", title: "School life" },
  { id: "29", title: "Sci fi" },
  { id: "30", title: "Seinen" },
  { id: "31", title: "Shoujo" },
  { id: "32", title: "Shoujo ai" },
  { id: "33", title: "Shounen" },
  { id: "34", title: "Shounen ai" },
  { id: "35", title: "Slice of life" },
  { id: "36", title: "Smut" },
  { id: "37", title: "Sports" },
  { id: "38", title: "Supernatural" },
  { id: "39", title: "Tragedy" },
  { id: "40", title: "Webtoons" },
  { id: "41", title: "Yaoi" },
  { id: "42", title: "Yuri" },
];

export const SORT_OPTONS: Option[] = [
  { id: "latest", title: "Latest" },
  { id: "newest", title: "Newest" },
  { id: "topview", title: "Top Read" },
];

export const STATUS_OPTIONS: Option[] = [
  { id: "all", title: "All" },
  { id: "completed", title: "Completed" },
  { id: "ongoing", title: "Ongoing" },
  { id: "drop", title: "Dropped" },
];

export const HOMEPAGE_SECTIONS: PageSection[] = [
  {
    id: "top",
    title: "Top This Week",
    style: SectionStyle.DEFAULT,
  },
  {
    id: "new",
    title: "New Titles",
    style: SectionStyle.DEFAULT,
  },
  {
    id: "latest",
    title: "Latest Updates",
    style: SectionStyle.PADDED_LIST,
  },
];

export const FILTERS: DirectoryFilter[] = [
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

export type FilterResult = {
  genre?: ExcludableMultiSelectProp;
  status?: string;
};

export const PROPERTIES: Property[] = [
  {
    id: "genre",
    title: "Genres",
    tags: GENRE_OPTIONS.map((v) => ({
      ...v,
      id: v.id,
      ...(ADULT_IDS.includes(v.id) && { nsfw: true }),
    })),
  },
];
