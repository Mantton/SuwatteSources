import { ExcludableMultiSelectProp } from "@suwatte/daisuke";

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
  query?: string;
  includedTags?: string[];
  excludedTags?: string[];
  authors?: string[];
  p_status?: string[];
  s_status?: string[];
  includeTypes?: string[];
  excludeTypes?: string[];
  originalTranslation?: boolean;
  released?: string;
};

export type ChapterDetail = {
  Chapter: string;
  ChapterName?: string;
  Date: string;
  Directory?: string;
  Page?: string;
};

export type FilterProps = {
  p_status?: string[]; // multiselect
  s_status?: string[]; // multiselect
  type?: ExcludableMultiSelectProp;
  genres?: ExcludableMultiSelectProp;
  translation?: boolean; // Toggle
};
