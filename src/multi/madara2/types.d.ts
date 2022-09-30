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

  typeSelector: string;
  alternativeTitlesSelector: string;
};
