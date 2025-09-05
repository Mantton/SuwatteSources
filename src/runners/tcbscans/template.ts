import {
  NetworkRequest,
  Highlight,
  Chapter,
  Content,
  DirectoryRequest,
  PagedResult,
} from "@suwatte/daisuke";
import { CheerioAPI } from "cheerio";
import {
  CheerioElement,
  TachiParsedHttpSource,
} from "../../template/tachiyomi";

export class TCBScans extends TachiParsedHttpSource {
  name = "TCB Scans";
  baseUrl = "https://tcbonepiecechapters.com";
  lang = "en";
  supportsLatest = false;

  // Popular
  popularMangaSelector = () => ".bg-card.border.border-border.rounded.p-3.mb-3";
  popularMangaRequest = (_: number) => ({ url: this.baseUrl + "/projects" });
  popularMangaFromElement(element: CheerioElement): Highlight {
    const id = this.getUrlWithoutDomain(
      element.find("a.mb-3.text-white.text-lg.font-bold").attr("href") ?? ""
    );
    const cover =
      element.find(".w-24.h-24.object-cover.rounded-lg").attr("src") ?? "";
    const title = element
      .find("a.mb-3.text-white.text-lg.font-bold")
      .text()
      .trim();

    return {
      id,
      cover,
      title,
    };
  }

  // * Latest
  latestUpdatesSelector(): string {
    throw new Error("Not Used");
  }
  latestUpdatesRequest(_: number): NetworkRequest {
    throw new Error("Method not implemented.");
  }
  latestUpdatesFromElement(_: CheerioElement): Highlight {
    throw new Error("Method not implemented.");
  }

  // * Search
  searchMangaFromElement = this.popularMangaFromElement;
  searchMangaSelector = this.popularMangaSelector;
  searchMangaRequest(_: DirectoryRequest): NetworkRequest {
    return {
      url: this.baseUrl + "/projects",
    };
  }
  parseSearchManga(html: string, ctx: DirectoryRequest): PagedResult {
    const data = super.parseSearchManga(html, ctx);
    const { query } = ctx;
    if (query) {
      const results = data.results.filter((v) =>
        v.title.toLowerCase().includes(query.toLowerCase())
      );
      return {
        results,
        isLastPage: true,
        totalResultCount: results.length,
      };
    } else
      return {
        ...data,
        isLastPage: true,
        totalResultCount: data.results.length,
      };
  }

  // * Manga Details
  mangaDetailsParse($: CheerioAPI): Content {
    const body = $(".order-1.bg-card.border.border-border.rounded.py-3");

    const cover =
      body.find(".flex.items-center.justify-center img").attr("src") ?? "";
    const title = body.find(".my-3.font-bold.text-3xl").text().trim();
    const summary = body.find(".leading-6.my-3").text();

    return {
      title,
      cover,
      summary,
    };
  }

  // * Chapters
  chapterListSelector = () =>
    ".block.border.border-border.bg-card.mb-3.p-3.rounded";

  chapterFromElement(
    element: CheerioElement
  ): Omit<Chapter, "number" | "index" | "volume" | "language"> {
    const titleRegex = /[0-9]+$/;
    const chapterId = this.getUrlWithoutDomain(element.attr("href") ?? "");
    let title = element.find(".text-lg.font-bold:not(.flex)").text();
    const description = element.find(".text-gray-500").text().trim();
    const result = title.match(titleRegex)?.[1];
    if (result) {
      title = `Chapter ${result}`;
    }
    title = description ? `${title}: ${description}` : title;

    return {
      chapterId,
      title,
      date: new Date(),
    };
  }

  // * Page List
  pageListParse($: CheerioAPI): string[] {
    return $(".flex.flex-col.items-center.justify-center picture img")
      .toArray()
      .map((v) => $(v).attr("src") ?? "");
  }
}
