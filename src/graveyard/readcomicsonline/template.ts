import {
  NetworkRequest,
  Highlight,
  Chapter,
  Content,
  PublicationStatus,
} from "@suwatte/daisuke";
import { CheerioAPI } from "cheerio";
import {
  CheerioElement,
  TachiTemplate,
  getUrlWithoutDomain,
} from "../../template/tachiyomi";
import moment from "moment";

export class RCO extends TachiTemplate {
  name = "ReadComicOnline";
  baseUrl = "https://readcomiconline.li";
  lang = "en_US";
  supportsLatest = true;
  headersBuilder = () => ({
    "User-Agent": "Mozilla/5.0 (Windows NT 6.3; WOW64)",
  });
  popularMangaSelector = () => ".list-comic > .item > a:first-child";
  latestUpdatesSelector = this.popularMangaSelector;
  searchMangaSelector = this.popularMangaSelector;

  popularMangaRequest(page: number): NetworkRequest {
    return {
      url: this.baseUrl + `/ComicList/MostPopular?page=${page}`,
    };
  }

  latestUpdatesRequest(page: number): NetworkRequest {
    return {
      url: this.baseUrl + `/ComicList/LatestUpdate?page=${page}`,
      headers: {
        ...this.headersBuilder(),
      },
    };
  }

  popularMangaFromElement(element: CheerioElement): Highlight {
    const id = getUrlWithoutDomain(element.attr("href") ?? "");
    const title = element.text().trim();
    let cover = element.find("img").first().attr("src") ?? "";
    if (cover.startsWith("/")) cover = this.baseUrl + cover;
    return { id, title, cover };
  }
  latestUpdatesFromElement = this.popularMangaFromElement;
  searchMangaFromElement = this.popularMangaFromElement;

  popularMangaNextPageSelector = () => "ul.pager > li > a:contains(Next)";
  latestUpdatesNextPageSelector = this.popularMangaNextPageSelector;
  searchMangaNextPageSelector = this.popularMangaNextPageSelector;

  searchMangaRequest(
    page: number,
    query: string,
    _: Record<string, any>
  ): NetworkRequest {
    return {
      url: `${this.baseUrl}/AdvanceSearch`,
      params: {
        ...(query && { comicName: query.trim() }),
        page,
      },
      headers: {
        ...this.headersBuilder(),
      },
    };
  }

  mangaDetailsParse($: CheerioAPI): Content {
    const body = $("div.barContent").first();
    const title = body.find(".bigChar").text().trim();
    const artist = body
      .find("p:has(span:contains(Artist:)) > a")
      .first()
      ?.text();
    const author = body
      .find("p:has(span:contains(Writer:)) > a")
      .first()
      ?.text();
    const genre = body
      .find("p:has(span:contains(Genres:)) > *:gt(0)")
      .text()
      .split(", ");
    const summary = body.find("p:has(span:contains(Summary:)) ~ p").text();
    const cover =
      this.baseUrl + body.find(".rightBox:eq(0) img").first()?.attr("src");
    const status = this.parseStatus(
      body.find("p:has(span:contains(Status:))").first()?.text()
    );
    return {
      title,
      cover,
      summary,
      info: [artist, author, ...genre],
      status,
    };
  }

  chapterListSelector = () => "table.listing tr:gt(1)";
  chapterFromElement(
    element: CheerioElement
  ): Omit<Chapter, "number" | "index" | "volume" | "language"> {
    const info = element.find("a").first();

    const chapterId = getUrlWithoutDomain(info.attr("href") ?? "");
    const title = info.text().trim();
    const dateStr = element.find("td:eq(1)").first().text();
    const date = moment(dateStr, "MM/dd/yyyy").toDate();
    return {
      chapterId,
      title,
      date,
    };
  }

  pageListParse($: CheerioAPI): string[] {
    const script = $("script:contains(lstImages.push)").first().text();
    const imagesRegex = /lstImages\.push\(["'](.*)["']\)/g;
    const images = [...script.matchAll(imagesRegex)].map((v) => v?.[1]);
    return images;
  }

  parseStatus(val?: string) {
    if (!val) return;
    val = val?.toLowerCase();

    if (val.includes("ongoing")) return PublicationStatus.ONGOING;
    if (val.includes("completed")) return PublicationStatus.COMPLETED;
  }
}
