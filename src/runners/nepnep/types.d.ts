export type DirectoryEntry = {
  /**
   * id
   */
  i: string; // id
  /**
   * Title
   */
  s: string;
  /**
   * Original Translation
   */
  o: string;
  /**
   * Scan Status
   */
  ss: string; // scan status
  /**
   * Publication Status
   */
  ps: string; /// publish status

  /**
   * Type
   */
  t: string;
  /**
   * Release Year
   */
  y: string; // year released
  /**
   * Authors
   */
  a?: string[]; // Author
  /**
   * Genres
   */
  g?: string[]; //genres
  /**
   * Alternative names
   */
  al?: string[];
  /**
   * Adult Content
   */
  h: boolean; // Adult Content
};

export type HomePageEntry = {
  IndexName: string;
  SeriesName: string;
  Genres: string[];
};

export type ParsedRequest = {
  query: string | undefined;
  includedTags: string[] | undefined;
  excludedTags: string[] | undefined;
  authors: string[] | undefined;
  p_status: string[] | undefined;
  s_status: string[] | undefined;
  includeTypes: string[] | undefined;
  excludeTypes: string[] | undefined;
  originalTranslation: boolean;
  released: string | undefined;
};

export type ChapterDetail = {
  Chapter: string;
  ChapterName?: string;
  Date: string;
  Directory?: string;
  Page?: string;
};
