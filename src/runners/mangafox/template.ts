import {
  Chapter,
  Content,
  DirectoryRequest,
  Highlight,
  NetworkRequest,
  PublicationStatus,
} from "@suwatte/daisuke";
import {
  CheerioElement,
  TachiParsedHttpSource,
} from "../../template/tachiyomi";
import { CheerioAPI } from "cheerio";
import moment from "moment";

export class Template extends TachiParsedHttpSource {
  name = "MangaFox";
  baseUrl = "https://fanfox.net";
  mobileUrl = "https://m.fanfox.net";
  lang = "en";
  supportsLatest = true;

  headers(): Record<string, string> {
    return {
      Referer: this.baseUrl + "/",
      Cookie: "isAdult=1;readway=2;",
    };
  }

  // * Popular
  popularMangaRequest(page: number): NetworkRequest {
    const str = page != 1 ? `${page}.html` : "";
    return {
      url: this.baseUrl + "/directory/" + str,
      headers: this.headers(),
    };
  }

  popularMangaSelector(): string {
    return "ul.manga-list-1-list li";
  }

  popularMangaFromElement(element: CheerioElement): Highlight {
    const link = element.find("a").first();

    const id = this.getUrlWithoutDomain(link.attr("href") ?? "");
    const title = link.attr("title") ?? "";
    const cover = link.find("img").attr("src") ?? "";
    return { id, title, cover };
  }

  popularMangaNextPageSelector(): string {
    return ".pager-list-left a.active + a + a";
  }

  // * Latest
  latestUpdatesRequest(page: number): NetworkRequest {
    const str = page != 1 ? `${page}.html` : "";
    return {
      url: this.baseUrl + "/directory/" + str + "?latest",
      headers: this.headers(),
    };
  }

  latestUpdatesSelector(): string {
    return this.popularMangaSelector();
  }

  latestUpdatesFromElement(element: CheerioElement): Highlight {
    return this.popularMangaFromElement(element);
  }

  latestUpdatesNextPageSelector(): string {
    return this.popularMangaNextPageSelector();
  }

  // * Search
  searchMangaSelector(): string {
    return "ul.manga-list-4-list li";
  }

  searchMangaFromElement(element: CheerioElement): Highlight {
    return this.popularMangaFromElement(element);
  }

  searchMangaNextPageSelector(): string {
    return this.popularMangaNextPageSelector();
  }

  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    const url = this.baseUrl + "/search";
    const params = {
      title: request.query,
      sort: "",
      stype: "1",
    };

    return { url, params };
  }

  // * Content Details
  mangaDetailsParse(document: CheerioAPI): Content {
    const body = document(".detail-info-right").first();
    const title = body
      .find(".detail-info-right-title-font")
      .first()
      .text()
      .trim();
    const authors = body
      .find(".detail-info-right-say a")
      .toArray()
      .map((v) => document(v).text().trim());
    const genres = body
      .find(".detail-info-right-tag-list a")
      .toArray()
      .map((v) => document(v).text().trim());
    const summary = body.find("p.fullcontent").first().text().trim();
    const cover = document(".detail-info-cover-img").first().attr("src") ?? "";
    const status = this.parseStatus(
      body.find(".detail-info-right-title-tip").first().text().trim()
    );

    return { title, cover, status, summary, info: [...authors, ...genres] };
  }

  // * Chapter
  chapterListSelector(): string {
    return "ul.detail-main-list li a";
  }

  chapterFromElement(
    element: CheerioElement
  ): Omit<Chapter, "number" | "index" | "volume" | "language"> {
    const chapterId = this.getUrlWithoutDomain(element.attr("href") ?? "");
    const title = element
      .find(".detail-main-list-main p")
      .first()
      .text()
      .trim();
    const date = this.parseDate(
      element.find(".detail-main-list-main p").last().text().trim()
    );

    return { chapterId, title, date };
  }

  // * Page List
  pageListRequest(fragment: string): NetworkRequest {
    const path = fragment.replace("/manga/", "/roll_manga/");
    const headers = {
      ...this.headers(),
      Referer: this.mobileUrl + "/",
    };

    return {
      url: this.mobileUrl + path,
      headers,
    };
  }

  pageListParse(document: CheerioAPI): string[] {
    return document("#viewer img")
      .toArray()
      .map((v) => {
        const elem = document(v);
        return "https:" + elem.attr("data-original");
      });
  }

  async imageRequest(url: string): Promise<NetworkRequest> {
    return {
      url,
      headers: {
        ...this.headers(),
      },
    };
  }

  // * Utils
  parseStatus(val: string) {
    if (val.includes("ongoing")) return PublicationStatus.ONGOING;
    else if (val.includes("completed")) return PublicationStatus.COMPLETED;
  }

  parseDate(val: string) {
    if (val.includes("Today") || val.includes("ago")) return new Date();
    else if (val.includes("Yesterday"))
      return moment().subtract(1, "days").toDate();

    const mDate = moment(val, "MMM D,YYYY");
    if (mDate.isValid()) return mDate.toDate();
    return moment().toDate();
  }
}
