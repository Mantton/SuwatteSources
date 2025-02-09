import {
  Highlight,
  Chapter,
  Content,
  ChapterData,
  DirectoryRequest,
  PagedResult,
} from "@suwatte/daisuke";
import { Cheerio, CheerioAPI, load } from "cheerio";
import type { AnyNode } from "domhandler";
import { TachiHttpSource } from "./HttpSource";
import { ChapterRecognition } from "../ChapterRecognition";
export type CheerioElement = Cheerio<AnyNode>;
export type CheerioDocument = CheerioAPI;

export abstract class TachiParsedHttpSource extends TachiHttpSource {
  abstract popularMangaSelector(): string;
  abstract latestUpdatesSelector(): string;
  abstract searchMangaSelector(): string;
  abstract chapterListSelector(): string;

  // Next Selectors
  popularMangaNextPageSelector?(): string;
  searchMangaNextPageSelector?(): string;
  latestUpdatesNextPageSelector?(): string;

  abstract popularMangaFromElement(element: CheerioElement): Highlight;
  abstract searchMangaFromElement(element: CheerioElement): Highlight;
  abstract latestUpdatesFromElement(element: CheerioElement): Highlight;
  abstract chapterFromElement(
    element: CheerioElement
  ): Omit<Chapter, "index" | "number" | "volume" | "language">;
  abstract mangaDetailsParse(document: CheerioDocument): Content;
  abstract pageListParse(document: CheerioDocument): string[];

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
    return $(this.chapterListSelector())
      .toArray()
      .map((element, idx) => {
        const data = this.chapterFromElement($(element));
        return this.generateChapter(data, idx, title);
      });
  }

  generateChapter(data: any, index: number, title: string): Chapter {
    return {
      ...data,
      index,
      number:
        !!data.number && data.number !== -1
          ? data.number
          : this.recognizer.parseChapterNumber(title, data.title ?? ""),
      language: this.lang,
    };
  }

  parsePageList(html: string): ChapterData {
    const pages = this.pageListParse(load(html)).map((url) => ({ url }));
    return { pages };
  }

  protected ownText(element: CheerioElement): string {
    return element.contents().not(element.children()).text().trim();
  }
}
