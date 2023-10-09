export type SourceDto = {
  id: string;
  name: string;
  lang: string;
  iconUrl: string;
  isNsfw: boolean;
};

export type MangaDto = {
  url: string;
  sourceId: string;
  title: string;
  thumbnail: string;

  artist?: string;
  author?: string;
  description?: string;
  genres?: string[];
  status?: number;
  webUrl?: string;
};

export type ChapterDto = {
  index: number;
  url: string;
  title: string;
  dateUploaded: number;
  chapterNumber: number;
  lang: string;
  scanlator?: string;
};

export type ChapterDataDto = {
  pages: string[];
};

export type PagedMangaListDto = {
  hasNextPage: boolean;
  mangaList: MangaDto[];
};

export type FilterObjectDto = {
  type: string;
  filter: {
    name: string;
    state: any;
    values: string[];
    displayValues: string[];
    param: string;
    [key: string]: any;
  };
};
