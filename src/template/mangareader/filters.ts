import { FilterType, Option } from "@suwatte/daisuke";

const types = [
  "All",
  "Manga",
  "One-Shot",
  "Doujinshi",
  "Light Novel",
  "Manhwa",
  "Manhua",
  "Comic",
];

const status = [
  "All",
  "Finished",
  "Publishing",
  "On Hiatus",
  "Discontinued",
  "Not yet published",
];

const rating = [
  "All",
  "G - All Ages",
  "PG - Children",
  "PG-13 - Teens 13 or older",
  "R - 17+ (violence & profanity)",
  "R+ - Mild Nudity",
];

const score = [
  "All",
  "(1) Appalling",
  "(2) Horrible",
  "(3) Very Bad",
  "(4) Bad",
  "(5) Average",
  "(6) Fine",
  "(7) Good",
  "(8) Very Good",
  "(9) Great",
  "(10) Masterpiece",
];

export const GENRES: Option[] = [
  { title: "Action", id: "1" },
  { title: "Adventure", id: "2" },
  { title: "Cars", id: "3" },
  { title: "Comedy", id: "4" },
  { title: "Dementia", id: "5" },
  { title: "Demons", id: "6" },
  { title: "Doujinshi", id: "7" },
  { title: "Drama", id: "8" },
  { title: "Ecchi", id: "9" },
  { title: "Fantasy", id: "10" },
  { title: "Game", id: "11" },
  { title: "Gender Bender", id: "12" },
  { title: "Harem", id: "13" },
  { title: "Hentai", id: "14" },
  { title: "Historical", id: "15" },
  { title: "Horror", id: "16" },
  { title: "Josei", id: "17" },
  { title: "Kids", id: "18" },
  { title: "Magic", id: "19" },
  { title: "Martial Arts", id: "20" },
  { title: "Mecha", id: "21" },
  { title: "Military", id: "22" },
  { title: "Music", id: "23" },
  { title: "Mystery", id: "24" },
  { title: "Parody", id: "25" },
  { title: "Police", id: "26" },
  { title: "Psychological", id: "27" },
  { title: "Romance", id: "28" },
  { title: "Samurai", id: "29" },
  { title: "School", id: "30" },
  { title: "Sci-Fi", id: "31" },
  { title: "Seinen", id: "32" },
  { title: "Shoujo", id: "33" },
  { title: "Shoujo Ai", id: "34" },
  { title: "Shounen", id: "35" },
  { title: "Shounen Ai", id: "36" },
  { title: "School Life", id: "37" },
  { title: "Space", id: "38" },
  { title: "Sports", id: "39" },
  { title: "Super Power", id: "40" },
  { title: "Supernatural", id: "41" },
  { title: "Thriller", id: "42" },
  { title: "Vampire", id: "43" },
  { title: "Yaoi", id: "44" },
  { title: "Yuri", id: "45" },
];
export const FILTERS = [
  {
    id: "type",
    title: "Type",
    options: types.map((v, i) => ({ id: i.toString(), title: v })),
    type: FilterType.SELECT,
  },
  {
    id: "status",
    title: "Status",
    options: status.map((v, i) => ({ id: i.toString(), title: v })),
    type: FilterType.SELECT,
  },
  {
    id: "rating",
    title: "Rating",
    options: rating.map((v, i) => ({ id: i.toString(), title: v })),
    type: FilterType.SELECT,
  },
  {
    id: "score",
    title: "Score",
    options: score.map((v, i) => ({ id: i.toString(), title: v })),
    type: FilterType.SELECT,
  },
  {
    id: "genres",
    title: "Genres",
    options: GENRES,
    type: FilterType.MULTISELECT,
  },
];

export const SORT_OPTIONS: Option[] = [
  { title: "Most Viewed", id: "most-viewed" },
  { title: "Score", id: "score" },
  { title: "Default", id: "default" },
  { title: "Latest Updated", id: "latest-updated" },
  { title: "Name A-Z", id: "name-az" },
  { title: "Release Date", id: "release-date" },
];

export type PopulatedFilterGroup = {
  type?: string;
  status?: string;
  rating?: string;
  score?: string;
  genres?: string[];
};
