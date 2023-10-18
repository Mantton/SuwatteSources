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
import { CheerioAPI, load } from "cheerio";
import { capitalize } from "lodash";
import moment from "moment";
import {
  DAY_DATE_LIST,
  HOUR_DATE_LIST,
  MINUTE_DATE_LIST,
  MONTH_DATE_LIST,
  SECONDS_DATE_LIST,
  WEEK_DATE_LIST,
  YEAR_DATE_LIST,
} from "./constants";

export abstract class TachiDaraTemplate extends TachiParsedHttpSource {
  supportsLatest = true;
  protected dateFormat = "MMMM DD, YYYY";

  headers(): Record<string, string> {
    return {
      Referer: this.baseUrl + "/",
      Origin: this.baseUrl + "/",
    };
  }

  protected filterNonMangaItems = true;

  protected mangaEntrySelector(): string {
    return this.filterNonMangaItems ? ".manga" : "";
  }
  protected fetchGenres = true;
  protected mangaSubString = "manga";
  protected useNewChapterEndpoint = false;
  protected oldChapterEndpointDisabled = false;
  // * Popular
  protected popularMangaUrlSelector = "div.post-title a";
  popularMangaSelector(): string {
    return `div.page-item-detail:not(:has(a[href*='bilibilicomics.com']))${this.mangaEntrySelector()}`;
  }
  popularMangaNextPageSelector = this.searchMangaNextPageSelector;

  popularMangaRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/${this.mangaSubString}/${this.searchPage(
        page
      )}?m_orderby=views`,
      headers: this.headers(),
    };
  }

  popularMangaFromElement(element: CheerioElement): Highlight {
    const child = element.find(this.popularMangaUrlSelector);
    const id = this.getUrlWithoutDomain(child.attr("href") ?? "");
    const title = this.ownText(child);
    const cover = this.imageFromElement(element.find("img").first());
    return { id, title, cover };
  }

  // * Latest
  latestUpdatesSelector = this.popularMangaSelector;
  latestUpdatesFromElement(element: CheerioElement): Highlight {
    return this.popularMangaFromElement(element);
  }

  latestUpdatesRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/${this.mangaSubString}/${this.searchPage(
        page
      )}?m_orderby=latest`,
      headers: this.headers(),
    };
  }

  latestUpdatesNextPageSelector = this.popularMangaNextPageSelector;

  parseLatestManga(html: string): PagedResult {
    const result = super.parseLatestManga(html);

    const distinct: Highlight[] = Object.values(
      result.results.reduce(
        (acc, obj) => ({ ...acc, [obj.id]: obj }),
        Object.create(null)
      )
    );

    result.results = distinct;

    return result;
  }

  // * Search
  searchMangaSelector(): string {
    return "div.c-tabs-item__content";
  }

  searchMangaFromElement(element: CheerioElement): Highlight {
    const child = element.find("div.post-title a").first();
    const id = this.getUrlWithoutDomain(child.attr("href") ?? "");
    const title = this.ownText(child);
    const cover = this.imageFromElement(element.find("img").first());
    return { id, title, cover };
  }

  searchMangaNextPageSelector(): string {
    return "div.nav-previous, nav.navigation-ajax, a.nextpostslink";
  }

  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    const url = `${this.baseUrl}/${this.searchPage(request.page)}`;
    const params = {
      s: request.query,
      post_type: "wp-manga",
    };

    return { url, params };
  }

  // * Profile
  mangaDetailsParse($: CheerioAPI): Content {
    let title = this.ownText($(this.mangaDetailsSelectorTitle));

    if (!title) title = $(this.mangaDetailsSelectorTitle).text().trim();
    const authors = $(this.mangaDetailsSelectorAuthor)
      .toArray()
      .map((v) => $(v).text().trim());
    const artists = $(this.mangaDetailsSelectorArtist)
      .toArray()
      .map((v) => $(v).text().trim());

    const summaryElem = $(this.mangaDetailsSelectorDescription);
    let summary = summaryElem.text();

    if (summaryElem.find("p").text().trim()) {
      summary = summaryElem
        .find("p")
        .toArray()
        .map((v) => $(v).text().trim())
        .join("\n\n")
        .replaceAll("<br>", "\n");
    }

    const cover = this.imageFromElement(
      $(this.mangaDetailsSelectorThumbnail).first()
    );

    const statusStr = $(this.mangaDetailsSelectorStatus).last().text().trim();
    let status: PublicationStatus | undefined;

    if (this.completedStatusList.includes(statusStr))
      status = PublicationStatus.COMPLETED;
    else if (this.ongoingStatusList.includes(statusStr))
      status = PublicationStatus.ONGOING;
    else if (this.hiatusStatusList.includes(statusStr))
      status = PublicationStatus.HIATUS;
    else if (this.canceledStatusList.includes(statusStr))
      status = PublicationStatus.CANCELLED;

    const genres = $(this.mangaDetailsSelectorGenre)
      .toArray()
      .map((v) => capitalize($(v).text().toLowerCase().trim()));

    return {
      title,
      cover,
      status,
      summary,
      info: [...authors, ...artists, ...genres],
    };
  }

  // * Chapters
  chapterListSelector(): string {
    return "li.wp-manga-chapter";
  }

  chapterDateSelector(): string {
    return "span.chapter-release-date";
  }

  protected chapterUrlSelector = "a";

  protected chapterUrlSuffix = "?style=list";

  // * Chapter Utils
  oldXhrChaptersRequest(mangaId: string): NetworkRequest {
    const body = {
      action: "manga_get_chapters",
      manga: mangaId,
    };

    const headers = {
      ...this.headers(),
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded",
    };

    return {
      url: `${this.baseUrl}/wp-admin/admin-ajax.php`,
      method: "POST",
      headers,
      body,
    };
  }

  xhrChaptersRequest(mangaUrl: string): NetworkRequest {
    return {
      url: `${this.baseUrl}${mangaUrl}ajax/chapters`,
      headers: {
        ...this.headers(),
        "X-Requested-With": "XMLHttpRequest",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
    };
  }
  parseDate(str: string) {
    if (
      ["just", "now", "up", "new"].some((v) =>
        str.trim().toLowerCase().includes(v)
      )
    )
      return new Date();
    if (str.trim().toLowerCase() === "yesterday")
      return moment().subtract(1, "day").toDate();
    const date = this.parseRelativeDate(str)?.toDate();

    if (date) return date;
    const formatted = moment(str, this.dateFormat, true);
    if (formatted.isValid()) return formatted.toDate();
    const strDate = moment(str);
    if (strDate.isValid()) return strDate.toDate();
    return new Date();
  }
  parseRelativeDate(str: string) {
    const numStr = str.match(/(\d+)/)?.[1];
    if (!numStr || Number.isNaN(parseInt(numStr))) {
      return null;
    }
    const number = parseInt(numStr);

    const now = moment();
    if (DAY_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
      return now.subtract(number, "days");
    if (HOUR_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
      return now.subtract(number, "hours");
    if (MINUTE_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
      return now.subtract(number, "minutes");
    if (SECONDS_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
      return now.subtract(number, "seconds");
    if (WEEK_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
      return now.subtract(number, "weeks");
    if (MONTH_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
      return now.subtract(number, "months");
    if (YEAR_DATE_LIST.some((v) => str.toLowerCase().includes(v)))
      return now.subtract(number, "years");

    return null;
  }

  async getMangaChapters(id: string): Promise<Chapter[]> {
    const request = this.chapterListRequest(id);

    const { data: html } = await this.client.request(request);

    const $ = load(html);
    const title = this.ownText($(this.mangaDetailsSelectorTitle));
    const wrapper = $("div[id^=manga-chapters-holder]");
    const standardElements = $(this.chapterListSelector()).toArray();
    if (!standardElements.length && wrapper.length) {
      const mangaId = wrapper.attr("data-id");
      const xhrReq =
        this.useNewChapterEndpoint || this.oldChapterEndpointDisabled
          ? this.xhrChaptersRequest(id)
          : this.oldXhrChaptersRequest(mangaId ?? "");

      let response = "";
      try {
        response = (await this.client.request(xhrReq)).data;
      } catch (err) {
        if (
          err instanceof NetworkError &&
          !this.useNewChapterEndpoint &&
          err.res.status == 400
        ) {
          this.oldChapterEndpointDisabled = true;
          response = (await this.client.request(this.xhrChaptersRequest(id)))
            .data;
        } else {
          throw err;
        }
      }

      const $$ = load(response);
      const xhrElements = $$(this.chapterListSelector()).toArray();
      return xhrElements.map((v, i) =>
        this.generateChapter(this.chapterFromElement($$(v)), i, title)
      );
    }

    return standardElements.map((v, i) =>
      this.generateChapter(this.chapterFromElement($(v)), i, title)
    );
  }

  chapterFromElement(
    element: CheerioElement
  ): Omit<Chapter, "number" | "index" | "volume" | "language"> {
    const urlElem = element.find(this.chapterUrlSelector).first();
    const urlHref = urlElem.attr("href") ?? "";
    const url =
      urlHref.split("?style=paged")[0] +
      (!urlHref.endsWith(this.chapterUrlSuffix) ? this.chapterUrlSuffix : "");

    const title = urlElem.text().trim();

    const dateStr =
      element.find("img:not(.thumb)").first().attr("alt") ??
      element.find("span a").first().attr("title") ??
      element.find(this.chapterDateSelector()).first().text().trim();

    const date = this.parseDate(dateStr);

    return { chapterId: url.trim(), title, date };
  }

  parseChapterList(_: string): Chapter[] {
    throw new Error("method not used");
  }

  // * Page List
  pageListRequest(fragment: string): NetworkRequest {
    if (fragment.startsWith("http")) return { url: fragment };
    else return super.pageListRequest(fragment);
  }

  pageListParse($: CheerioAPI): string[] {
    const pages = $(this.pageListParseSelector)
      .toArray()
      .map((v) => this.imageFromElement($("img", v).first()));

    return pages;
  }

  //* Utils

  protected searchPage(page: number) {
    return `page/${page}/`;
  }
  protected imageFromElement(element: CheerioElement) {
    return (
      element.attr("data-src") ??
      element.attr("data-lazy-src") ??
      element.attr("srcset")?.split(" ")?.[0] ??
      element.attr("src") ??
      ""
    )
      .trim()
      .replace("-110x150", "")
      .replace("-175x238", "")
      .replace("-193x278", "")
      .replace("-224x320", "")
      .replace("-350x476", "");
  }

  protected mangaDetailsSelectorTitle = "div.post-title h3, div.post-title h1";
  protected mangaDetailsSelectorAuthor = "div.author-content > a";
  protected mangaDetailsSelectorArtist = "div.artist-content > a";
  protected mangaDetailsSelectorStatus = "div.summary-content";
  protected mangaDetailsSelectorDescription =
    "div.description-summary div.summary__content, div.summary_content div.post-content_item > h5 + div, div.summary_content div.manga-excerpt";
  protected mangaDetailsSelectorThumbnail = "div.summary_image img";
  protected mangaDetailsSelectorGenre = "div.genres-content a";
  protected mangaDetailsSelectorTag = "div.tags-content a";

  protected seriesTypeSelector =
    ".post-content_item:contains(Type) .summary-content";
  protected altNameSelector =
    ".post-content_item:contains(Alt) .summary-content";
  protected altName = "Alternative Names: ";

  protected pageListParseSelector =
    "div.page-break, li.blocks-gallery-item, .reading-content .text-left:not(:has(.blocks-gallery-item)) img";

  protected chapterProtectorSelector = "#chapter-protector-data";

  protected notUpdating(val: string) {
    !/updating|atualizando/i.test(val);
  }

  protected completedStatusList = [
    "Completed",
    "Completo",
    "Completado",
    "Concluído",
    "Concluido",
    "Finalizado",
    "Achevé",
    "Terminé",
    "Hoàn Thành",
    "مكتملة",
    "مكتمل",
    "已完结",
  ];

  protected ongoingStatusList = [
    "OnGoing",
    "Продолжается",
    "Updating",
    "Em Lançamento",
    "Em lançamento",
    "Em andamento",
    "Em Andamento",
    "En cours",
    "En Cours",
    "En cours de publication",
    "Ativo",
    "Lançando",
    "Đang Tiến Hành",
    "Devam Ediyor",
    "Devam ediyor",
    "In Corso",
    "In Arrivo",
    "مستمرة",
    "مستمر",
    "En Curso",
    "En curso",
    "Emision",
    "Curso",
    "En marcha",
    "Publicandose",
    "En emision",
    "连载中",
    "Em Lançamento",
  ];

  protected hiatusStatusList = ["On Hold", "Pausado", "En espera"];
  protected canceledStatusList = ["Canceled", "Cancelado"];
}
