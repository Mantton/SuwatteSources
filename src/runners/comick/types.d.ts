export type MangaExcerpt = {
  id: number;
  hid: string;
  slug: string;
  title: string;
  rating: string;
  bayesian_rating: string;
  rating_count: number;
  follow_count: number;
  desc: string;
  last_chapter: number;
  translation_completed: boolean;
  view_count: number;
  content_rating: string;
  demographic: number;
  genres: number[];
  user_follow_count: number;
  year: number;
  md_titles: { title: string }[];
  md_cover: { w: number; h: number; b2key: string }[];
  mu_comics: { year: number };
  cover_url: string;
};

export type HPTimeGroup = {
  "7": MangaExcerpt[];
  "30": MangaExcerpt[];
  "90": MangaExcerpt[];
};
export type HomePageProps = {
  rank: MangaExcerpt[];
  recentRank: MangaExcerpt[];
  trending: HPTimeGroup;
  follows: {
    identities: {
      traits: {
        username: string;
      };
    };
    md_comics: MangaExcerpt;
  }[];
  news: MangaExcerpt[];
  extendedNews: MangaExcerpt[];
  completions: MangaExcerpt[];
  topFollowNewComics: HPTimeGroup;
  topFollowComics: HPTimeGroup;
};
