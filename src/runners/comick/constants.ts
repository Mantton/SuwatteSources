import { CollectionExcerpt, CollectionStyle, Property } from "@suwatte/daisuke";

export const SORT_OPTIONS = [
  { label: "Most Followed", id: "user_follow_count" },
  { label: "Most Viewed", id: "view" },
  { label: "Top Rated", id: "rating" },
  { label: "Last Updated", id: "uploaded" },
];

export const TYPE_OPTIONS = [
  { label: "Manga", id: "jp" },
  { label: "Manhwa", id: "kr" },
  { label: "Manhua", id: "cn" },
];

export const DEMOGRAPHIC_OPTIONS = [
  { label: "Shounen", id: "1" },
  { label: "Shoujo", id: "2" },
  { label: "Seinen", id: "3" },
  { label: "Josei", id: "4" },
];

export const GENRE_OPTIONS = [
  { label: "4-Koma", id: "4-koma" },
  { label: "Action", id: "action" },
  { label: "Adaptation", id: "adaptation" },
  { label: "Adult", id: "adult" },
  { label: "Adventure", id: "adventure" },
  { label: "Aliens", id: "aliens" },
  { label: "Animals", id: "animals" },
  { label: "Anthology", id: "anthology" },
  { label: "Award Winning", id: "award-winning" },
  { label: "Comedy", id: "comedy" },
  { label: "Cooking", id: "cooking" },
  { label: "Crime", id: "crime" },
  { label: "Crossdressing", id: "crossdressing" },
  { label: "Delinquents", id: "delinquents" },
  { label: "Demons", id: "demons" },
  { label: "Doujinshi", id: "doujinshi" },
  { label: "Drama", id: "drama" },
  { label: "Ecchi", id: "ecchi" },
  { label: "Fan Colored", id: "fan-colored" },
  { label: "Fantasy", id: "fantasy" },
  { label: "Full Color", id: "full-color" },
  { label: "Gender Bender", id: "gender-bender" },
  { label: "Genderswap", id: "genderswap" },
  { label: "Ghosts", id: "ghosts" },
  { label: "Gore", id: "gore" },
  { label: "Gyaru", id: "gyaru" },
  { label: "Harem", id: "harem" },
  { label: "Historical", id: "historical" },
  { label: "Horror", id: "horror" },
  { label: "Incest", id: "incest" },
  { label: "Isekai", id: "isekai" },
  { label: "Loli", id: "loli" },
  { label: "Long Strip", id: "long-strip" },
  { label: "Mafia", id: "mafia" },
  { label: "Magic", id: "magic" },
  { label: "Magical Girls", id: "magical-girls" },
  { label: "Martial Arts", id: "martial-arts" },
  { label: "Mature", id: "mature" },
  { label: "Mecha", id: "mecha" },
  { label: "Medical", id: "medical" },
  { label: "Military", id: "military" },
  { label: "Monster Girls", id: "monster-girls" },
  { label: "Monsters", id: "monsters" },
  { label: "Music", id: "music" },
  { label: "Mystery", id: "mystery" },
  { label: "Ninja", id: "ninja" },
  { label: "Office Workers", id: "office-workers" },
  { label: "Official Colored", id: "official-colored" },
  { label: "Oneshot", id: "oneshot" },
  { label: "Philosophical", id: "philosophical" },
  { label: "Police", id: "police" },
  { label: "Post-Apocalyptic", id: "post-apocalyptic" },
  { label: "Psychological", id: "psychological" },
  { label: "Reincarnation", id: "reincarnation" },
  { label: "Reverse Harem", id: "reverse-harem" },
  { label: "Romance", id: "romance" },
  { label: "Samurai", id: "samurai" },
  { label: "School Life", id: "school-life" },
  { label: "Sci-Fi", id: "sci-fi" },
  { label: "Sexual Violence", id: "sexual-violence" },
  { label: "Shota", id: "shota" },
  { label: "Shoujo Ai", id: "shoujo-ai" },
  { label: "Shounen Ai", id: "shounen-ai" },
  { label: "Slice of Life", id: "slice-of-life" },
  { label: "Smut", id: "smut" },
  { label: "Sports", id: "sports" },
  { label: "Superhero", id: "superhero" },
  { label: "Supernatural", id: "supernatural" },
  { label: "Survival", id: "survival" },
  { label: "Thriller", id: "thriller" },
  { label: "Time Travel", id: "time-travel" },
  { label: "Traditional Games", id: "traditional-games" },
  { label: "Tragedy", id: "tragedy" },
  { label: "User Created", id: "user-created" },
  { label: "Vampires", id: "vampires" },
  { label: "Video Games", id: "video-games" },
  { label: "Villainess", id: "villainess" },
  { label: "Virtual Reality", id: "virtual-reality" },
  { label: "Web Comic", id: "web-comic" },
  { label: "Wuxia", id: "wuxia" },
  { label: "Yaoi", id: "yaoi" },
  { label: "Yuri", id: "yuri" },
  { label: "Zombies", id: "zombies" },
];

export const getProperties = () => {
  const properties: Property[] = [];

  // Type
  properties.push({
    id: "type",
    label: "Content Type",
    tags: TYPE_OPTIONS.map((v) => ({
      ...v,
      id: `type:${v.id}`,
      adultContent: false,
    })),
  });
  // Demographic
  properties.push({
    id: "demographic",
    label: "Content Demographics",
    tags: DEMOGRAPHIC_OPTIONS.map((v) => ({
      ...v,
      id: `demographic:${v.id}`,
      adultContent: false,
    })),
  });
  // Genre
  properties.push({
    id: "Genre",
    label: "Genres",
    tags: GENRE_OPTIONS.map((v) => ({
      ...v,
      id: `genre:${v.id}`,
      adultContent: false,
    })),
  });

  return properties;
};

export const LANGUAGE_OPTIONS = [
  { value: "all", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "pt-br", label: "Portuguese (Brazil)" },
  { value: "ru", label: "Russian" },
  { value: "fr", label: "French" },
  { value: "es-419", label: "Spanish (Latin America)" },
  { value: "pl", label: "Polish" },
  { value: "tr", label: "Turkish" },
  { value: "it", label: "Italian" },
  { value: "es", label: "Spanish" },
  { value: "id", label: "Indonesian" },
  { value: "hu", label: "Hungarian" },
  { value: "vi", label: "Vietnamese" },
  { value: "zh-hk", label: "Chinese (Hong Kong)" },
  { value: "ar", label: "Arabic" },
  { value: "de", label: "German" },
  { value: "zh", label: "Chinese" },
  { value: "ca", label: "Catalan" },
  { value: "bg", label: "Bulgarian" },
  { value: "th", label: "Thai" },
  { value: "fa", label: "Persian" },
  { value: "uk", label: "Ukrainian" },
  { value: "mn", label: "Mongolian" },
  { value: "ro", label: "Romanian" },
  { value: "he", label: "Hebrew" },
  { value: "ms", label: "Malay" },
  { value: "tl", label: "Tagalog" },
  { value: "ja", label: "Japanese" },
  { value: "hi", label: "Hindi" },
  { value: "my", label: "Burmese" },
  { value: "ko", label: "Korean" },
  { value: "cs", label: "Czech" },
  { value: "pt", label: "Portuguese" },
  { value: "nl", label: "Dutch" },
  { value: "sv", label: "Swedish" },
  { value: "bn", label: "Bengali" },
  { value: "no", label: "Norwegian" },
  { value: "lt", label: "Lithuanian" },
  { value: "el", label: "Greek" },
  { value: "sr", label: "Serbian" },
  { value: "da", label: "Danish" },
];

export const EXPLORE_COLLECTIONS: CollectionExcerpt[] = [
  {
    id: "hot_updates",
    title: "Hot Updates",
    style: CollectionStyle.INFO,
  },
  {
    id: "recently_added",
    title: "Recently Added Titles",
    style: CollectionStyle.NORMAL,
  },
  {
    id: "most_viewed_7",
    title: "Most Viewed Titles This Week",
    style: CollectionStyle.NORMAL,
  },
  {
    id: "most_viewed_30",
    title: "Most Viewed Titles This Month",
    style: CollectionStyle.GALLERY,
  },
  {
    id: "popular_new_7",
    title: "Popular Titles This Week",
    style: CollectionStyle.INFO,
  },
  {
    id: "popular_new_30",
    title: "Most Viewed Titles This Month",
    style: CollectionStyle.NORMAL,
  },

  {
    id: "completed",
    title: "Completed Titles",
    subtitle: "Binge-Worthy Completed Titles.",
    style: CollectionStyle.INFO,
  },
  {
    id: "recently_followed",
    title: "Recent Follows",
    subtitle: "What others are reading.",
    style: CollectionStyle.NORMAL,
  },
  {
    id: "popular_ongoing",
    title: "Popular Ongoing Titles",
    style: CollectionStyle.INFO,
  },
  {
    id: "upcoming",
    title: "Up n' Coming",
    style: CollectionStyle.NORMAL,
  },
  {
    id: "top_followed_7",
    title: "Top Followed Titles This Week",
    style: CollectionStyle.INFO,
  },
  {
    id: "top_followed_30",
    title: "Top Followed Titles This Month",
    style: CollectionStyle.NORMAL,
  },
  {
    id: "latest",
    title: "Latest Updates",
    style: CollectionStyle.UPDATE_LIST,
  },
];
