import {
  BasicURL,
  ChapterData,
  Content,
  DirectoryConfig,
  DirectoryFilter,
  Highlight,
  NetworkRequest,
  PagedResult,
} from "@suwatte/daisuke";
import { getHost } from "../utils/store";
import {
  ChapterDataDto,
  ChapterDto,
  FilterObjectDto,
  MangaDto,
  PagedMangaListDto,
  SourceDto,
} from "../types";
import {
  Generate,
  toChapter,
  toContent,
  toHighlight,
  toIdentifiers,
} from "../utils/parser";
import { ParseSortComponent, parseFilter } from "../utils/filter";

const client = new NetworkClient();

export async function get<T extends unknown>(req: BasicURL) {
  const { data } = await client.request(req);
  const object = JSON.parse(data);
  return object as T;
}

/**
 * Get Available Sources
 */
export const getEnabledSources = async () => {
  const host = await getHost();
  const data = await get<SourceDto[]>({ url: `${host}/api/v1/lite/list` });
  return data;
};

// Content
export const getContent = async (id: string): Promise<Content> => {
  const host = await getHost();
  const { sourceId, contentId } = toIdentifiers(id);
  const path = `/manga/${sourceId}/${contentId}`;
  const url = `${host}/api/v1/lite${path}`;
  const data = await get<MangaDto>({ url });
  return toContent(data, host);
};

// Chapter
export const getChapters = async (id: string) => {
  const host = await getHost();
  const { sourceId, contentId } = toIdentifiers(id);

  // chapters
  const path = `/manga/${sourceId}/${contentId}/chapters`;
  const url = `${host}/api/v1/lite${path}`;
  const data = await get<ChapterDto[]>({ url });
  return data.map(toChapter);
};

// ChapterData
export const getChapterData = async (id: string, chapterId: string) => {
  const host = await getHost();
  const { sourceId, contentId } = toIdentifiers(id);

  const path = `/manga/${sourceId}/${contentId}/chapters/${chapterId}/pages`;
  const url = `${host}/api/v1/lite${path}`;
  const { pages } = await get<ChapterDataDto>({ url });
  const urls = pages.map((fragment) => ({ url: `${host}${fragment}` }));
  return urls;
};

// Filters
export const getSourceConfig = async (
  sourceId: string
): Promise<DirectoryConfig> => {
  const host = await getHost();
  const path = `/api/v1/lite/${sourceId}/filters`;

  const url = `${host}${path}`;

  const data = await get<FilterObjectDto[]>({ url });

  const filters = data.filter((v) => v.type !== "Sort").flatMap(parseFilter);

  const sort = data.find(
    (v) =>
      v.type === "Sort" ||
      ["order", "sort"].some((s) => v.filter.name.toLowerCase().includes(s))
  );

  const sortOptions = sort ? ParseSortComponent(sort) : [];

  return {
    filters,
    sort: {
      options: [
        { id: "tachi_popular", title: "Popular (Tachi)" },
        ...sortOptions,
      ],
      default: {
        id: "tachi_popular",
        ascending: false,
      },
      canChangeOrder: sort?.type === "Sort" && sortOptions.length != 0,
    },
  };
};

// Popular
export const getSourcePopularPage = async (sourceId: string, page: number) => {
  const host = await getHost();
  const path = `/api/v1/lite/${sourceId}/popular/${page}`;

  const url = `${host}${path}`;

  const { mangaList, hasNextPage } = await get<PagedMangaListDto>({ url });

  const highlights = mangaList.map((v) => toHighlight(v, host));
  return Generate<PagedResult>({
    isLastPage: !hasNextPage,
    results: highlights,
  });
};
