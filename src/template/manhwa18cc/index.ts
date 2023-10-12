import { DirectoryRequest, Highlight, NetworkRequest } from "@suwatte/daisuke";
import { TachiDaraTemplate } from "../tachidara";
import { CheerioElement } from "../tachiyomi";
import { CheerioAPI } from "cheerio";

export abstract class Manhwa18CCTemplate extends TachiDaraTemplate {
  protected fetchGenres = false;
  popularMangaSelector(): string {
    return "div.manga-item";
  }

  protected popularMangaUrlSelector = "div.manga-item div.data a";

  popularMangaNextPageSelector = () => "ul.pagination li.next a";
  popularMangaRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/webtoons/${page}?orderby=trending`,
    };
  }

  latestUpdatesRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/webtoons/${page}?orderby=latest`,
    };
  }

  searchMangaSelector(): string {
    return this.popularMangaSelector();
  }
  searchMangaNextPageSelector(): string {
    return this.popularMangaNextPageSelector();
  }

  searchMangaFromElement(element: CheerioElement): Highlight {
    return this.popularMangaFromElement(element);
  }

  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    if (!request.query) return this.popularMangaRequest(request.page);
    return {
      url: `${this.baseUrl}/search?q=${request.query}&page=${request.page}`,
    };
  }

  protected mangaSubString = "webtoon";

  protected mangaDetailsSelectorDescription =
    "div.panel-story-description div.dsct";

  protected dateFormat = "DD MMM YYYY";

  chapterListSelector(): string {
    return "li.a-h";
  }

  chapterDateSelector(): string {
    return "span.chapter-time";
  }

  protected pageListParseSelector = "div.read-content img";

  pageListParse($: CheerioAPI): string[] {
    const elements = $(this.pageListParseSelector).toArray();

    const urls = elements.map(
      (v) => $(v).attr("data-src") ?? $(v).attr("src") ?? ""
    );
    return urls;
  }
}
