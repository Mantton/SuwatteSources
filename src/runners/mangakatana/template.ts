import {
  Chapter,
  ChapterData,
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
import { CheerioAPI, load } from "cheerio";
import moment from "moment";

export class Template extends TachiParsedHttpSource {
  name = "MangaKatana";
  baseUrl = "https://mangakatana.com";
  lang = "en";
  supportsLatest = true;

  // * Latest
  latestUpdatesRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/page/${page}`,
    };
  }

  latestUpdatesSelector(): string {
    return "div#book_list > div.item";
  }

  latestUpdatesFromElement(element: CheerioElement): Highlight {
    const id = this.getUrlWithoutDomain(
      element.find("div.text > h3 > a").first().attr("href") ?? ""
    );
    const title = this.ownText(element.find("div.text > h3 > a"));
    const cover = element.find("img").first().attr("src") ?? "";
    return { id, title, cover };
  }

  latestUpdatesNextPageSelector(): string {
    return "a.next.page-numbers";
  }

  // * Popular
  popularMangaRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/manga/page/${page}?filter=1&include_mode=and&bookmark_opts=off&chapters=1&order=numc`,
    };
  }

  popularMangaSelector(): string {
    return this.latestUpdatesSelector();
  }

  popularMangaFromElement(element: CheerioElement): Highlight {
    return this.latestUpdatesFromElement(element);
  }

  popularMangaNextPageSelector(): string {
    return this.latestUpdatesNextPageSelector();
  }

  // * Search
  searchMangaSelector(): string {
    return this.latestUpdatesSelector();
  }

  searchMangaFromElement(element: CheerioElement): Highlight {
    return this.latestUpdatesFromElement(element);
  }

  searchMangaNextPageSelector(): string {
    return this.latestUpdatesNextPageSelector();
  }
  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    if (request.query) {
      return {
        url: this.baseUrl + `/page/${request.page}`,
        params: {
          search: request.query,
          search_by: "book_name",
        },
        headers: this.headers(),
      };
    }

    throw new Error("Method not implemented.");
  }
  // * Details
  mangaDetailsParse(document: CheerioAPI): Content {
    const author = document(".author")
      .toArray()
      .map((v) => document(v).text().trim());
    const summary = document(".summary > p").text();
    const genres = document(".genres > a")
      .toArray()
      .map((v) => document(v).text().trim());
    const cover = document("div.media div.cover img").attr("src") ?? "";
    let status: PublicationStatus | undefined;

    const statusStr = document(".value.status").text().trim();
    if (statusStr.toLowerCase().includes("going"))
      status = PublicationStatus.ONGOING;
    else if (statusStr.toLowerCase().includes("completed"))
      status = PublicationStatus.COMPLETED;

    const title = document("h1.heading").text().trim();
    return { title, cover, summary, info: [...author, ...genres], status };
  }

  // * Chapters
  chapterListSelector(): string {
    return "tr:has(.chapter)";
  }

  chapterFromElement(
    element: CheerioElement
  ): Omit<Chapter, "number" | "index" | "volume" | "language"> {
    const chapterId = this.getUrlWithoutDomain(
      element.find("a").attr("href") ?? ""
    );
    const title = element.find("a").text().trim();
    const dateM = moment(
      element.find(".update_time").text().trim(),
      "MMM-DD-YYYY"
    );
    const date = dateM.isValid() ? dateM.toDate() : new Date();

    return {
      chapterId,
      title,
      date,
    };
  }

  // * Page List
  async getPageList(_: string, chapter: string): Promise<ChapterData> {
    const server = (await ObjectStore.string("server")) ?? "";
    let suffix = "";

    if (server) suffix = `?sv=${server}`;
    const request = {
      url: this.baseUrl + chapter + suffix,
      headers: this.headers(),
    };
    const response = (await this.client.request(request)).data;
    const urls = this.pageListParse(load(response));
    return { pages: urls.map((url) => ({ url })) };
  }

  pageListParse($: CheerioAPI): string[] {
    const imageArrayNameRegex = /data-src['"],\s*(\w+)/;
    const imageUrlRegex = /'([^']*)'/;
    const imageScript = $('script:contains("data-src")').first().html();
    if (!imageScript) return [];
    const imageArrayNameMatch = imageScript.match(imageArrayNameRegex);
    if (!imageArrayNameMatch) return [];
    const imageArrayName = imageArrayNameMatch[1];
    const imageArrayRegex = new RegExp(`var ${imageArrayName}=\\[([^\\[]*)]`);

    const imageArrayMatch = imageScript.match(imageArrayRegex);
    if (!imageArrayMatch) return [];

    const imageArray = imageArrayMatch[1];

    // Extracting image URLs and creating Page objects
    const images: string[] = [];
    let imageUrlMatch;
    const imageUrlRegexG = new RegExp(imageUrlRegex, "g");
    while ((imageUrlMatch = imageUrlRegexG.exec(imageArray)) !== null) {
      images.push(imageUrlMatch?.[1] ?? "");
    }

    return images;
  }
}
