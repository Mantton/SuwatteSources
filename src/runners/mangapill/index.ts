import {
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  DirectoryConfig,
  DirectoryRequest,
  FilterType,
  ImageRequestHandler,
  NetworkRequest,
  PagedResult,
  Property,
  RunnerInfo,
} from "@suwatte/daisuke";
import { GENRES, STATUS, TYPES } from "./constants";
import {
  parseChapterData,
  parseChapters,
  parseContent,
  parseSearchResults,
} from "./parser";

export class Target implements ContentSource, ImageRequestHandler {
  info: RunnerInfo = {
    id: "com.mangapill",
    name: "MangaPill",
    version: 0.2,
    supportedLanguages: ["en_US"],
    website: "https://mangapill.com",
    thumbnail: "mangapill.png",
    minSupportedAppVersion: "6.0",
  };

  private client = new NetworkClient();
  async getContent(contentId: string): Promise<Content> {
    const { data } = await this.client.get(
      `https://mangapill.com/manga/${contentId}`
    );

    return parseContent(data, contentId);
  }
  async getChapters(contentId: string): Promise<Chapter[]> {
    const { data } = await this.client.get(
      `https://mangapill.com/manga/${contentId}`
    );

    return parseChapters(data);
  }
  async getChapterData(
    _contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const { data } = await this.client.get(`https://mangapill.com${chapterId}`);
    return parseChapterData(data);
  }

  async getTags?(): Promise<Property[]> {
    return [
      {
        id: "genre",
        title: "Genres",
        tags: GENRES.map((v) => ({ id: v.replaceAll(" ", "+"), title: v })),
      },
    ];
  }
  async getDirectory(
    query: DirectoryRequest<PopulatedFilters>
  ): Promise<PagedResult> {
    let url = "https://mangapill.com/search";
    const params: Record<string, any> = {
      page: query.page ?? 1,
      q: query.query ?? "",
      type: "",
      status: "",
    };

    const filters = query.filters;
    if (filters) {
      if (filters.genre) {
        const queryString = filters.genre.map((v) => `genre=${v}`).join("&");
        url += "?";
        url += queryString;
      }

      if (filters.type) {
        if (filters.type !== "all") params.type = filters.type;
      }

      if (filters.status) {
        if (filters.status !== "all") params.status = filters.status;
      }
    } else if (query.tag?.tagId) {
      url += `?genre=${query.tag.tagId.replaceAll(" ", "+")}`;
    }

    if (!url.includes("?") && !params.type && !params.status) {
      const queryString = GENRES.map(
        (v) => `genre=${v.replaceAll(" ", "+")}`
      ).join("&");
      url += "?";
      url += queryString;
    }

    const { data } = await this.client.get(url, { params });
    const results = parseSearchResults(data);
    return {
      results,
      isLastPage: results.length < 50,
    };
  }

  async getDirectoryConfig(
    _configID?: string | undefined
  ): Promise<DirectoryConfig> {
    return {
      filters: [
        {
          id: "genre",
          title: "Genres",
          options: GENRES.map((v) => ({
            id: v.replaceAll(" ", "+"),
            title: v,
          })),
          type: FilterType.MULTISELECT,
        },
        {
          id: "type",
          title: "Type",
          options: TYPES,
          type: FilterType.SELECT,
        },
        {
          id: "status",
          title: "Status",
          options: STATUS,
          type: FilterType.SELECT,
        },
      ],
    };
  }

  async willRequestImage(url: string): Promise<NetworkRequest> {
    return {
      url,
      headers: {
        Referer: "https://www.mangapill.com/",
      },
    };
  }
}

type PopulatedFilters = {
  genre?: string[];
  type?: string;
  status?: string;
};
