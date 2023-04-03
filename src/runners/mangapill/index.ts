import {
  Chapter,
  ChapterData,
  Content,
  Filter,
  FilterType,
  PagedResult,
  Property,
  SearchRequest,
  Source,
  SourceInfo,
} from "@suwatte/daisuke";
import { GENRES, STATUS, TYPES } from "./constants";
import {
  parseChapterData,
  parseChapters,
  parseContent,
  parseSearchResults,
} from "./parser";

export class Target extends Source {
  info: SourceInfo = {
    id: "com.mangapill",
    name: "MangaPill",
    version: 0.2,
    supportedLanguages: ["en_US"],
    website: "https://mangapill.com",
    nsfw: false,
    thumbnail: "mangapill.png",
    minSupportedAppVersion: "5.0",
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

    return parseChapters(data, contentId);
  }
  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const { data } = await this.client.get(`https://mangapill.com${chapterId}`);
    return parseChapterData(data, chapterId, contentId);
  }
  async getSearchResults(query: SearchRequest): Promise<PagedResult> {
    let url = "https://mangapill.com/search";
    const params: Record<string, any> = {
      page: query.page ?? 1,
      q: query.query ?? "",
      type: "",
      status: "",
    };

    query.filters?.forEach((filter) => {
      switch (filter.id) {
        case "genre":
          {
            if (!filter.included) break;
            const queryString = filter.included
              .map((v) => `genre=${v}`)
              .join("&");
            url += "?";
            url += queryString;
          }

          break;
        case "type":
          if (!filter.included?.[0] || filter.included?.[0] === "all") break;
          params.type = filter.included[0];
          break;
        case "status":
          if (!filter.included?.[0] || filter.included?.[0] === "all") break;
          params.status = filter.included[0];
          break;
      }
    });

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
      page: query.page ?? 1,
      results,
      isLastPage: results.length < 50,
    };
  }
  async getSourceTags(): Promise<Property[]> {
    return [
      {
        id: "genre",
        label: "Genres",
        tags: GENRES.map((v) => ({ id: v.replaceAll(" ", "+"), label: v })),
      },
    ];
  }

  async getSearchFilters(): Promise<Filter[]> {
    return [
      {
        id: "genre",
        title: "Genres",
        options: GENRES.map((v) => ({ id: v.replaceAll(" ", "+"), label: v })),
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
    ];
  }
}
