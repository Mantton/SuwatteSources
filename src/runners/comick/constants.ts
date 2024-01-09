import { Option, PageSection, Property, SectionStyle } from "@suwatte/daisuke";

export const SORT_OPTIONS: Option[] = [
  { title: "Most Followed", id: "user_follow_count" },
  { title: "Most Viewed", id: "view" },
  { title: "Top Rated", id: "rating" },
  { title: "Last Updated", id: "uploaded" },
];

export const TYPE_OPTIONS = [
  { title: "Manga", id: "jp" },
  { title: "Manhwa", id: "kr" },
  { title: "Manhua", id: "cn" },
  { title: "Others", id: "others" },
];

export const DEMOGRAPHIC_OPTIONS = [
  { title: "Shounen", id: "1" },
  { title: "Shoujo", id: "2" },
  { title: "Seinen", id: "3" },
  { title: "Josei", id: "4" },
];

export const GENRE_OPTIONS = [
  { title: "4-Koma", id: "4-koma" },
  { title: "Action", id: "action" },
  { title: "Adaptation", id: "adaptation" },
  { title: "Adult", id: "adult" },
  { title: "Adventure", id: "adventure" },
  { title: "Aliens", id: "aliens" },
  { title: "Animals", id: "animals" },
  { title: "Anthology", id: "anthology" },
  { title: "Award Winning", id: "award-winning" },
  { title: "Comedy", id: "comedy" },
  { title: "Cooking", id: "cooking" },
  { title: "Crime", id: "crime" },
  { title: "Crossdressing", id: "crossdressing" },
  { title: "Delinquents", id: "delinquents" },
  { title: "Demons", id: "demons" },
  { title: "Doujinshi", id: "doujinshi" },
  { title: "Drama", id: "drama" },
  { title: "Ecchi", id: "ecchi" },
  { title: "Fan Colored", id: "fan-colored" },
  { title: "Fantasy", id: "fantasy" },
  { title: "Full Color", id: "full-color" },
  { title: "Gender Bender", id: "gender-bender" },
  { title: "Genderswap", id: "genderswap" },
  { title: "Ghosts", id: "ghosts" },
  { title: "Gore", id: "gore" },
  { title: "Gyaru", id: "gyaru" },
  { title: "Harem", id: "harem" },
  { title: "Historical", id: "historical" },
  { title: "Horror", id: "horror" },
  { title: "Incest", id: "incest" },
  { title: "Isekai", id: "isekai" },
  { title: "Loli", id: "loli" },
  { title: "Long Strip", id: "long-strip" },
  { title: "Mafia", id: "mafia" },
  { title: "Magic", id: "magic" },
  { title: "Magical Girls", id: "magical-girls" },
  { title: "Martial Arts", id: "martial-arts" },
  { title: "Mature", id: "mature" },
  { title: "Mecha", id: "mecha" },
  { title: "Medical", id: "medical" },
  { title: "Military", id: "military" },
  { title: "Monster Girls", id: "monster-girls" },
  { title: "Monsters", id: "monsters" },
  { title: "Music", id: "music" },
  { title: "Mystery", id: "mystery" },
  { title: "Ninja", id: "ninja" },
  { title: "Office Workers", id: "office-workers" },
  { title: "Official Colored", id: "official-colored" },
  { title: "Oneshot", id: "oneshot" },
  { title: "Philosophical", id: "philosophical" },
  { title: "Police", id: "police" },
  { title: "Post-Apocalyptic", id: "post-apocalyptic" },
  { title: "Psychological", id: "psychological" },
  { title: "Reincarnation", id: "reincarnation" },
  { title: "Reverse Harem", id: "reverse-harem" },
  { title: "Romance", id: "romance" },
  { title: "Samurai", id: "samurai" },
  { title: "School Life", id: "school-life" },
  { title: "Sci-Fi", id: "sci-fi" },
  { title: "Sexual Violence", id: "sexual-violence" },
  { title: "Shota", id: "shota" },
  { title: "Shoujo Ai", id: "shoujo-ai" },
  { title: "Shounen Ai", id: "shounen-ai" },
  { title: "Slice of Life", id: "slice-of-life" },
  { title: "Smut", id: "smut" },
  { title: "Sports", id: "sports" },
  { title: "Superhero", id: "superhero" },
  { title: "Supernatural", id: "supernatural" },
  { title: "Survival", id: "survival" },
  { title: "Thriller", id: "thriller" },
  { title: "Time Travel", id: "time-travel" },
  { title: "Traditional Games", id: "traditional-games" },
  { title: "Tragedy", id: "tragedy" },
  { title: "User Created", id: "user-created" },
  { title: "Vampires", id: "vampires" },
  { title: "Video Games", id: "video-games" },
  { title: "Villainess", id: "villainess" },
  { title: "Virtual Reality", id: "virtual-reality" },
  { title: "Web Comic", id: "web-comic" },
  { title: "Wuxia", id: "wuxia" },
  { title: "Yaoi", id: "yaoi" },
  { title: "Yuri", id: "yuri" },
  { title: "Zombies", id: "zombies" },
];

export const getProperties = () => {
  const properties: Property[] = [];

  // Type
  properties.push({
    id: "type",
    title: "Content Type",
    tags: TYPE_OPTIONS,
  });
  // Demographic
  properties.push({
    id: "demographic",
    title: "Content Demographics",
    tags: DEMOGRAPHIC_OPTIONS,
  });
  // Genre
  properties.push({
    id: "genres",
    title: "Genres",
    tags: GENRE_OPTIONS,
  });

  return properties;
};

export const LANGUAGE_OPTIONS = [
  { id: "all", title: "All Languages" },
  { id: "en", title: "English" },
  { id: "pt-br", title: "Portuguese (Brazil)" },
  { id: "ru", title: "Russian" },
  { id: "fr", title: "French" },
  { id: "es-419", title: "Spanish (Latin America)" },
  { id: "pl", title: "Polish" },
  { id: "tr", title: "Turkish" },
  { id: "it", title: "Italian" },
  { id: "es", title: "Spanish" },
  { id: "id", title: "Indonesian" },
  { id: "hu", title: "Hungarian" },
  { id: "vi", title: "Vietnamese" },
  { id: "zh-hk", title: "Chinese (Hong Kong)" },
  { id: "ar", title: "Arabic" },
  { id: "de", title: "German" },
  { id: "zh", title: "Chinese" },
  { id: "ca", title: "Catalan" },
  { id: "bg", title: "Bulgarian" },
  { id: "th", title: "Thai" },
  { id: "fa", title: "Persian" },
  { id: "uk", title: "Ukrainian" },
  { id: "mn", title: "Mongolian" },
  { id: "ro", title: "Romanian" },
  { id: "he", title: "Hebrew" },
  { id: "ms", title: "Malay" },
  { id: "tl", title: "Tagalog" },
  { id: "ja", title: "Japanese" },
  { id: "hi", title: "Hindi" },
  { id: "my", title: "Burmese" },
  { id: "ko", title: "Korean" },
  { id: "cs", title: "Czech" },
  { id: "pt", title: "Portuguese" },
  { id: "nl", title: "Dutch" },
  { id: "sv", title: "Swedish" },
  { id: "bn", title: "Bengali" },
  { id: "no", title: "Norwegian" },
  { id: "lt", title: "Lithuanian" },
  { id: "el", title: "Greek" },
  { id: "sr", title: "Serbian" },
  { id: "da", title: "Danish" },
];

export const EXPLORE_COLLECTIONS: PageSection[] = [
  {
    id: "hot_updates",
    title: "Hot Updates",
    style: SectionStyle.INFO,
  },
  {
    id: "recently_added",
    title: "Recently Added Titles",
    style: SectionStyle.DEFAULT,
  },
  {
    id: "most_viewed_30",
    title: "Most Viewed Titles This Month",
    style: SectionStyle.GALLERY,
  },
  {
    id: "popular_new_7",
    title: "Popular Titles This Week",
    style: SectionStyle.INFO,
  },
  {
    id: "popular_new_30",
    title: "Most Viewed Titles This Month",
    style: SectionStyle.DEFAULT,
  },

  {
    id: "completed",
    title: "Completed Titles",
    subtitle: "Binge-Worthy Completed Titles.",
    style: SectionStyle.INFO,
  },
  {
    id: "recently_followed",
    title: "Recent Follows",
    subtitle: "What others are reading.",
    style: SectionStyle.DEFAULT,
  },
  {
    id: "popular_ongoing",
    title: "Popular Ongoing Titles",
    style: SectionStyle.INFO,
  },
  {
    id: "upcoming",
    title: "Up n' Coming",
    style: SectionStyle.DEFAULT,
  },
  {
    id: "top_followed_7",
    title: "Top Followed Titles This Week",
    style: SectionStyle.INFO,
  },
  {
    id: "top_followed_30",
    title: "Top Followed Titles This Month",
    style: SectionStyle.DEFAULT,
  },
  {
    id: "latest",
    title: "Latest Updates",
    style: SectionStyle.PADDED_LIST,
  },
];
