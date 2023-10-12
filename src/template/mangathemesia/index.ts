import {
  Chapter,
  Content,
  DirectoryRequest,
  Highlight,
  NetworkRequest,
  PagedResult,
  PublicationStatus,
} from "@suwatte/daisuke";
import { CheerioElement, TachiParsedHttpSource } from "../tachiyomi";
import { CheerioAPI } from "cheerio";
import moment from "moment";

export abstract class MangaThemesiaTemplate extends TachiParsedHttpSource {
  protected mangaUrlDirectory = "/manga";
  protected projectPageString = "/project";
  protected searchQueryKey = "title";
  protected dateFormat = "MMMM dd, yyyy";
  supportsLatest = true;

  imageSrc(element: CheerioElement) {
    return (
      element.attr("data-lazy-src") ??
      element.attr("data-src") ??
      element.attr("src") ??
      ""
    );
  }

  // * Search
  searchMangaSelector(): string {
    return ".utao .uta .imgu, .listupd .bs .bsx, .listo .bs .bsx";
  }

  searchMangaNextPageSelector(): string {
    return "div.pagination .next, div.hpage .r";
  }

  searchMangaFromElement(element: CheerioElement): Highlight {
    const cover = this.imageSrc(element.find("img"));
    const title = element.find("a").attr("title") ?? element.text().trim();
    const id = this.getUrlWithoutDomain(element.find("a").attr("href") ?? "");

    return { id, cover, title };
  }

  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    const url = `${this.baseUrl}/${this.mangaUrlDirectory.substring(1)}`;
    const params: Record<string, any> = {
      title: request.query,
      page: request.page,
    };
    params.order = request.sort?.id ?? "popular";

    const res = { url, params };
    return res;
  }

  // * Popular
  popularMangaRequest(page: number): NetworkRequest {
    return this.searchMangaRequest({ page, sort: { id: "popular" } });
  }

  parsePopularManga(html: string): PagedResult {
    return this.parseSearchManga(html, { page: 0 });
  }

  popularMangaSelector(): string {
    throw new Error("Method not used.");
  }
  popularMangaFromElement(_: CheerioElement): Highlight {
    throw new Error("Method not used.");
  }

  // * Latest

  latestUpdatesRequest(page: number): NetworkRequest {
    return this.searchMangaRequest({ page, sort: { id: "popular" } });
  }

  parseLatestManga(html: string): PagedResult {
    return this.parseSearchManga(html, { page: 0 });
  }

  latestUpdatesSelector(): string {
    throw new Error("Method not used.");
  }
  latestUpdatesFromElement(_: CheerioElement): Highlight {
    throw new Error("Method not used.");
  }

  // * Content
  protected seriesDetailsSelector =
    "div.bigcontent, div.animefull, div.main-info, div.postbody";
  protected seriesTitleSelector = "h1.entry-title";
  protected seriesArtistSelector =
    ".infotable tr:contains(artist) td:last-child, .tsinfo .imptdt:contains(artist) i, .fmed b:contains(artist)+span, span:contains(artist)";
  protected seriesAuthorSelector =
    ".infotable tr:contains(author) td:last-child, .tsinfo .imptdt:contains(author) i, .fmed b:contains(author)+span, span:contains(author)";
  protected seriesDescriptionSelector =
    ".desc, .entry-content[itemprop=description]";
  protected seriesAltNameSelector =
    ".alternative, .wd-full:contains(alt) span, .alter, .seriestualt";
  protected seriesGenreSelector =
    "div.gnr a, .mgen a, .seriestugenre a, span:contains(genre)";
  protected seriesTypeSelector =
    ".infotable tr:contains(type) td:last-child, .tsinfo .imptdt:contains(type) i, .tsinfo .imptdt:contains(type) a, .fmed b:contains(type)+span, span:contains(type) a, a[href*=type\\=]";
  protected seriesStatusSelector =
    ".infotable tr:contains(status) td:last-child, .tsinfo .imptdt:contains(status) i, .fmed b:contains(status)+span span:contains(status)";
  protected seriesThumbnailSelector =
    ".infomanga > div[itemprop=image] img, .thumb img";

  mangaDetailsParse(document: CheerioAPI): Content {
    const body = document(this.seriesDetailsSelector);

    const title =
      body.find(this.seriesTitleSelector).first().text().trim() ?? "";
    const artist = body.find(this.seriesArtistSelector).text().trim();
    const author = body.find(this.seriesAuthorSelector).text().trim();
    const summary =
      body.find(this.seriesDescriptionSelector).text().trim() + "\n";
    const cover = this.imageSrc(body.find(this.seriesThumbnailSelector));
    const info = [author, artist].filter((v) => !!v);

    const status = this.parseStatus(
      body.find(this.seriesStatusSelector).text().trim().toLowerCase()
    );
    return { title, summary, cover, info, status };
  }

  // * Chapter

  chapterListSelector(): string {
    return "div.bxcl li, div.cl li, #chapterlist li, ul li:has(div.chbox):has(div.eph-num)";
  }

  chapterFromElement(
    element: CheerioElement
  ): Omit<Chapter, "number" | "index" | "volume" | "language"> {
    const urlElements = element.find("a").first();
    const url = this.getUrlWithoutDomain(urlElements.attr("href") ?? "");
    let title = element.find(".lch a, .chapternum").text().trim();
    if (!title) title = urlElements.first().text().trim();
    let date = new Date();

    const dateStr = element.find(".chapterdate").first().text().trim();

    if (dateStr) {
      date = moment(dateStr, this.dateFormat).toDate();
    }

    return {
      chapterId: url,
      date,
      title,
    };
  }

  // * Page List
  protected pageSelector = "div#readerarea img";
  pageListParse(document: CheerioAPI): string[] {
    const htmlPages = document(this.pageSelector)
      .toArray()
      .map((elem) => this.imageSrc(document(elem)))
      .filter((v) => !!v);

    if (htmlPages.length) return htmlPages;

    const html = document.html();
    const regex = /"images"\s*:\s*(\[.*?])/;
    const imageListJSON = html.match(regex)?.[1] ?? "";
    if (!imageListJSON) {
      console.warn("Empty List");
      return [];
    }
    const pages = JSON.parse(imageListJSON) as string[];
    return pages;
  }

  // * Helpers

  parseStatus(val: string) {
    if (["ongoing", "publishing"].includes(val))
      return PublicationStatus.ONGOING;
    if (val === "hiatus") return PublicationStatus.HIATUS;
    if (val === "completed") return PublicationStatus.COMPLETED;
    if (["dropped", "cancelled"].includes(val))
      return PublicationStatus.CANCELLED;
  }
}
