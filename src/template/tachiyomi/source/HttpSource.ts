import {
  Chapter,
  ChapterData,
  Content,
  DirectoryFilter,
  DirectoryRequest,
  NetworkClientBuilder,
  NetworkRequest,
  Option,
  PagedResult,
} from "@suwatte/daisuke";
import { TachiCatalogSource } from "./CatalogSource";

export abstract class TachiHttpSource extends TachiCatalogSource {
  abstract baseUrl: string;
  public client: NetworkClient;
  constructor() {
    super();
    this.client = new NetworkClientBuilder()
      .addRequestInterceptor(async (r) => {
        return {
          ...r,
          headers: {
            ...r.headers,
            ...this.headers(),
          },
        };
      })
      .build();
  }
  headers(): Record<string, string> {
    return {};
  }

  // Requests
  abstract popularMangaRequest(page: number): NetworkRequest;
  abstract searchMangaRequest(request: DirectoryRequest): NetworkRequest;
  abstract latestUpdatesRequest(page: number): NetworkRequest;

  // Parsing
  abstract parsePopularManga(response: string): PagedResult;
  abstract parseLatestManga(response: string): PagedResult;
  abstract parseMangaDetails(response: string): Content;
  abstract parseChapterList(response: string): Chapter[];
  abstract parsePageList(response: string): ChapterData;
  abstract parseSearchManga(
    response: string,
    context: DirectoryRequest
  ): PagedResult;

  // Requests
  mangaDetailsRequest(fragment: string): NetworkRequest {
    return {
      url: this.baseUrl + fragment,
      headers: this.headers(),
    };
  }
  chapterListRequest(fragment: string): NetworkRequest {
    return {
      url: this.baseUrl + fragment,
      headers: this.headers(),
    };
  }
  pageListRequest(fragment: string): NetworkRequest {
    return {
      url: this.baseUrl + fragment,
      headers: this.headers(),
    };
  }

  // Core
  async getPopularManga(page: number): Promise<PagedResult> {
    const request = this.popularMangaRequest(page);
    const { data: response } = await this.client.request(request);
    return this.parsePopularManga(response);
  }

  async getLatestManga(page: number): Promise<PagedResult> {
    const request = this.latestUpdatesRequest(page);
    const { data: response } = await this.client.request(request);
    return this.parseLatestManga(response);
  }

  async getSearchManga(searchRequest: DirectoryRequest): Promise<PagedResult> {
    const request = this.searchMangaRequest(searchRequest);
    const { data: response } = await this.client.request(request);
    return this.parseSearchManga(response, searchRequest);
  }

  async getMangaDetails(id: string): Promise<Content> {
    const request = this.mangaDetailsRequest(id);
    const { data: response } = await this.client.request(request);
    return this.parseMangaDetails(response);
  }

  async getMangaChapters(id: string): Promise<Chapter[]> {
    const request = this.chapterListRequest(id);
    const { data: response } = await this.client.request(request);
    return this.parseChapterList(response);
  }

  async getPageList(_: string, chapter: string): Promise<ChapterData> {
    const request = this.pageListRequest(chapter);
    const { data: response } = await this.client.request(request);
    return this.parsePageList(response);
  }

  async imageRequest(url: string): Promise<NetworkRequest> {
    return { url, headers: this.headers() };
  }

  async getFilterList(): Promise<DirectoryFilter[]> {
    return [];
  }

  async getSortOptions(): Promise<Option[]> {
    return [];
  }

  getMangaURL(fragment: string): string {
    return this.mangaDetailsRequest(fragment).url;
  }
}
