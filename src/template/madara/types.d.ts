export type Context = {
  baseUrl: string;

  chapterUseAJAX: boolean;
  useLoadMoreSearch: boolean;
  filterNonMangaItems: boolean;
  showOnlyManga: boolean;

  // Paths
  contentPath: string;
  searchPath: string;
  // Selectors
  searchSelector: string;
  imageSelector: string;
  genreSelector: string;

  // More Selectors
  titleSelector: string;
  authorSelector: string;
  artistSelector: string;
  statusSelector: string;
  summarySelector: string;
  thumbnailSelector: string;
  genreSelector: string;
  tagSelector: string;
  chapterSelector: string;
  chapterDateSelector: string;

  typeSelector: string;
  alternativeTitlesSelector: string;

  // Helpers
  forceAdult: boolean;
  adultTags: string[];
  dateFormat?: string;

  paginationLimit?: number;
};

export type AnchorTag = {
  link?: string;
  title: string;
};
