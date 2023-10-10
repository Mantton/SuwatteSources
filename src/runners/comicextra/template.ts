import {
  Content,
  NetworkRequest,
  Highlight,
  PublicationStatus,
} from "@suwatte/daisuke";
import { CheerioAPI } from "cheerio";
import {
  CheerioElement,
  TachiTemplate,
  getUrlWithoutDomain,
} from "../../template/tachiyomi";
import moment from "moment";

export class ComicExtra extends TachiTemplate {
  name = "ComicExtra";
  baseUrl = "https://comicextra.net";
  lang = "en-US";
  supportsLatest = true;

  popularMangaSelector = () => "div.cartoon-box:has(> div.mb-right)";
  latestUpdatesSelector = () => "div.hl-box";
  searchMangaSelector = this.popularMangaSelector;
  chapterListSelector = () => "table.table > tbody#list > tr:has(td)";

  popularMangaNextPageSelector = () => "div.general-nav > a:contains(Next)";
  searchMangaNextPageSelector = this.popularMangaNextPageSelector;
  latestUpdatesNextPageSelector = this.popularMangaNextPageSelector;

  popularMangaRequest = (page: number) => ({
    url: `${this.baseUrl}/popular-comic/${page !== 1 ? page + "/" : ""}`,
    method: "GET",
  });
  latestUpdatesRequest = (page: number) => ({
    url: `${this.baseUrl}/comic-updates/${page !== 1 ? page + "/" : ""}`,
    method: "GET",
  });

  searchMangaRequest: (
    page: number,
    query: string,
    filters: any
  ) => NetworkRequest = (page, query, _) => {
    if (query) {
      return { url: `${this.baseUrl}/comic-search?key=${query}` };
    } else {
      return { url: this.baseUrl + `/f/${page}/` };
    }
  };

  pageListRequest(fragment: string): NetworkRequest {
    return {
      url: this.baseUrl + fragment + "/full",
    };
  }
  // Elements

  popularMangaFromElement(element: CheerioElement) {
    const url = getUrlWithoutDomain(
      element.find("div.mb-right > h3 > a").attr("href") ?? ""
    );
    if (!url) throw new Error("Failed to parse");
    const title = element.find("div.mb-right > h3 > a").text().trim();
    const cover = element.find("img").attr("src") ?? "";
    return {
      id: url,
      title,
      cover,
    };
  }
  latestUpdatesFromElement(element: CheerioElement): Highlight {
    const url = getUrlWithoutDomain(
      element.find("div.hlb-t > a").attr("href") ?? ""
    );
    if (!url) throw new Error("Failed to parse");

    const title = element.find("div.hlb-t > a").text();
    const cover = element.find("div.hlb-t > a").attr("href") ?? "";

    return {
      id: url,
      title,
      cover,
    };
  }

  searchMangaFromElement = this.popularMangaFromElement;

  chapterFromElement(element: CheerioElement) {
    const urlEl = element.find("td:nth-of-type(1) > a").first();
    const dateEl = element.find("td:nth-of-type(2)");

    const chapterUrl = getUrlWithoutDomain(
      urlEl.attr("href")?.replace(" ", "%20") ?? ""
    );
    const title = urlEl.text();
    const date = moment(dateEl.text(), "MM/dd/yy").toDate();

    return {
      chapterId: chapterUrl,
      title,
      date,
    };
  }
  mangaDetailsParse($: CheerioAPI): Content {
    const title = $("div.movie-detail span.title-1").text().trim();
    const cover = $("div.movie-l-img > img").attr("src") ?? "";
    const summary = $("div#film-content").text().trim();
    const author = $("dt:contains(Author:) + dd").text().trim();
    const genres = $("dt.movie-dt:contains(Genres:) + dd a")
      .toArray()
      .map((elem) => $(elem).text().trim());
    const status = this.parseStatus(
      $("dt:contains(Status:) + dd").text().trim()
    );
    return {
      title,
      cover,
      summary,
      status,
      info: [author, ...genres],
    };
  }

  pageListParse($: CheerioAPI): string[] {
    return $("img.chapter_img")
      .toArray()
      .map((elem) => $(elem).attr("src") ?? "");
  }

  parseStatus(val: string) {
    if (val.toLowerCase() === "completed") return PublicationStatus.COMPLETED;
    if (val.toLowerCase() === "ongoing") return PublicationStatus.ONGOING;
  }
}
