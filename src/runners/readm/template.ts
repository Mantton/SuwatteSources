import {
  Chapter,
  Content,
  DirectoryRequest,
  Highlight,
  NetworkRequest,
  PagedResult,
  PublicationStatus,
} from "@suwatte/daisuke";
import {
  CheerioElement,
  TachiParsedHttpSource,
} from "../../template/tachiyomi";
import { CheerioAPI } from "cheerio";
import moment from "moment";
export class Template extends TachiParsedHttpSource {
  name = "ReadM";
  baseUrl = "https://readm.org";
  lang = "en";
  supportsLatest = true;

  // * Popular
  popularMangaRequest(page: number): NetworkRequest {
    return {
      url: this.baseUrl + "/popular-manga/" + page,
    };
  }

  popularMangaNextPageSelector(): string {
    return "div.pagination a:contains(»)";
  }

  popularMangaSelector(): string {
    return "div#discover-response li";
  }

  popularMangaFromElement(element: CheerioElement): Highlight {
    const cover = this.baseUrl + element.find("img").attr("src");
    const title = element.find("div.subject-title a").first().text().trim();
    const id = element.find("div.subject-title a").attr("href") ?? "";
    return { id, title, cover };
  }

  // * Latest
  latestUpdatesRequest(page: number): NetworkRequest {
    return {
      url: this.baseUrl + "/latest-releases/" + page,
    };
  }
  latestUpdatesNextPageSelector(): string {
    return this.popularMangaNextPageSelector();
  }
  latestUpdatesSelector(): string {
    return "ul.latest-updates > li";
  }
  latestUpdatesFromElement(element: CheerioElement): Highlight {
    const cover = this.baseUrl + element.find("img").attr("data-src");
    const title = element.find("h2 a").first().text().trim();
    const id = element.find("h2 a").first().attr("href") ?? "";
    return { id, title, cover };
  }

  // * Search Manga Request
  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    const body = {
      dataType: "json",
      phrase: request.query,
    };

    const headers = {
      ...this.headers(),
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/x-www-form-urlencoded",
    };

    return {
      url: this.baseUrl + "/service/search",
      headers,
      body,
      method: "POST",
    };
  }

  // * Search
  searchMangaNextPageSelector(): string {
    throw new Error("method not used");
  }

  searchMangaSelector(): string {
    throw new Error("method not used");
  }

  searchMangaFromElement(_: CheerioElement): Highlight {
    throw new Error("method not used");
  }

  parseSearchManga(html: string, _: DirectoryRequest): PagedResult {
    const json: { manga: any[] } = JSON.parse(html);

    const results = json.manga.map((v): Highlight => {
      return {
        title: v.title,
        id: v.url,
        cover: this.baseUrl + v.image,
      };
    });

    return { results, isLastPage: true };
  }

  // * Details
  mangaDetailsParse(document: CheerioAPI): Content {
    const cover =
      this.baseUrl + document("img.series-profile-thumb").attr("src");
    const title = document("h1.page-title").text().trim();
    const author = document("span#first_episode a").text().trim();
    const artist = document("span#last_episode a").text().trim();
    const summary = document("div.series-summary-wrapper p").text().trim();
    const genres = document("div.series-summary-wrapper div.item a")
      .toArray()
      .map((v) => document(v).text().trim());

    const status = this.parseStatus(
      this.ownText(document("div.series-genres .series-status").first()).trim()
    );
    return { title, cover, info: [author, artist, ...genres], summary, status };
  }

  parseStatus(val: string) {
    if (val.includes("ongoing")) return PublicationStatus.ONGOING;
    else if (val.includes("complete")) return PublicationStatus.COMPLETED;
  }

  // * Chapters
  chapterListSelector(): string {
    return "div.season_start";
  }

  chapterFromElement(
    element: CheerioElement
  ): Omit<Chapter, "number" | "index" | "volume" | "language"> {
    const title = element.find("a").text().trim();
    const chapterId = element.find("a").attr("href") ?? "";
    const date = (
      this.parseDate(element.find("td.episode-date").text().trim()) ?? moment()
    ).toDate();

    return {
      chapterId,
      title,
      date,
    };
  }

  parseDate(val: string) {
    const words = val.split(" ");
    if (words.length !== 2) return;
    const [timeS, duration] = words;

    const time = parseInt(timeS);
    if (Number.isNaN(time) || !time) return;

    if (duration.includes("Minute")) return moment().subtract(time, "minutes");
    else if (duration.includes("Hour")) return moment().subtract(time, "hours");
    else if (duration.includes("Day")) return moment().subtract(time, "days");
    else if (duration.includes("Week")) return moment().subtract(time, "weeks");
    else if (duration.includes("Month"))
      return moment().subtract(time, "months");
    else if (duration.includes("Year")) return moment().subtract(time, "years");
  }

  // * Images

  pageListParse(document: CheerioAPI): string[] {
    return document("div.ch-images img")
      .toArray()
      .map((v) => {
        return this.baseUrl + document(v).attr("src");
      });
  }
}
