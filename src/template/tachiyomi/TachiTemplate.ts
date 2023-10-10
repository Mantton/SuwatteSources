import {
  Chapter,
  ChapterData,
  Content,
  DirectoryRequest,
  Highlight,
  NetworkRequest,
  PagedResult,
} from "@suwatte/daisuke";
import { load, type AnyNode, type Cheerio, type CheerioAPI } from "cheerio";
import { ChapterRecognition } from "./ChapterRecognition";
export type CheerioElement = Cheerio<AnyNode>;
export type CheerioDocument = CheerioAPI;

export abstract class TachiTemplate {
  abstract readonly name: string;
  abstract readonly baseUrl: string;
  abstract readonly lang: string;
  abstract readonly supportsLatest: boolean;

  // Selectors
  abstract popularMangaSelector(): string;
  abstract latestUpdatesSelector(): string;
  abstract searchMangaSelector(): string;
  abstract chapterListSelector(): string;

  // Next Selectors
  popularMangaNextPageSelector?(): string;
  searchMangaNextPageSelector?(): string;
  latestUpdatesNextPageSelector?(): string;

  // Core Parsers
  parsePopularManga(html: string): PagedResult {
    const $ = load(html);
    const results = $(this.popularMangaSelector())
      .toArray()
      .map((element) => this.popularMangaFromElement($(element)));

    let isLastPage = true;
    const selector = this.popularMangaNextPageSelector?.();
    if (selector) {
      isLastPage = $(selector).length === 0;
    }
    return {
      results,
      isLastPage,
    };
  }

  parseSearchManga(html: string, _: DirectoryRequest): PagedResult {
    const $ = load(html);
    const results = $(this.searchMangaSelector())
      .toArray()
      .map((element) => this.searchMangaFromElement($(element)));

    let isLastPage = true;
    const selector = this.searchMangaNextPageSelector?.();
    if (selector) {
      isLastPage = $(selector).length === 0;
    }
    return {
      results,
      isLastPage,
    };
  }

  parseLatestManga(html: string): PagedResult {
    const $ = load(html);
    const results = $(this.latestUpdatesSelector())
      .toArray()
      .map((element) => this.latestUpdatesFromElement($(element)));

    let isLastPage = true;
    const selector = this.latestUpdatesNextPageSelector?.();
    if (selector) {
      isLastPage = $(selector).length === 0;
    }
    return {
      results,
      isLastPage,
    };
  }

  parseMangaDetails(html: string): Content {
    return this.mangaDetailsParse(load(html));
  }

  parseChapterList(html: string): Chapter[] {
    const $ = load(html);
    const title = this.mangaDetailsParse($).title;
    const rec = new ChapterRecognition();
    return $(this.chapterListSelector())
      .toArray()
      .map((element, idx) => {
        const data = this.chapterFromElement($(element));
        return {
          ...data,
          number: rec.parseChapterNumber(title, data.title ?? ""),
          language: this.lang,
          index: idx,
        };
      });
  }

  parsePageList(html: string): ChapterData {
    const pages = this.pageListParse(load(html)).map((url) => ({ url }));
    return { pages };
  }

  // Requests
  abstract popularMangaRequest(page: number): NetworkRequest;
  abstract searchMangaRequest(
    page: number,
    query: string,
    filters: Record<string, any>
  ): NetworkRequest;

  abstract latestUpdatesRequest(page: number): NetworkRequest;
  mangaDetailsRequest(fragment: string): NetworkRequest {
    return { url: this.baseUrl + fragment };
  }
  chapterListRequest(fragment: string): NetworkRequest {
    return { url: this.baseUrl + fragment };
  }
  pageListRequest(fragment: string): NetworkRequest {
    return { url: this.baseUrl + fragment };
  }

  abstract popularMangaFromElement(element: CheerioElement): Highlight;
  abstract searchMangaFromElement(element: CheerioElement): Highlight;
  abstract latestUpdatesFromElement(element: CheerioElement): Highlight;
  abstract chapterFromElement(
    element: CheerioElement
  ): Omit<Chapter, "index" | "number" | "volume" | "language">;
  abstract mangaDetailsParse(document: CheerioDocument): Content;
  abstract pageListParse(document: CheerioDocument): string[];

  headersBuilder: () => Record<string, string> = () => ({});
}
