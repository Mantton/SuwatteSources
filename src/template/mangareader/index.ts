import {
  Chapter,
  ChapterData,
  Content,
  DirectoryFilter,
  DirectoryRequest,
  FilterPrimitives,
  Generate,
  Highlight,
  HighlightCollection,
  NetworkRequest,
  Option,
  Property,
} from "@suwatte/daisuke";
import { CheerioElement, TachiParsedHttpSource } from "../tachiyomi";
import { CheerioAPI, load } from "cheerio";
import { startCase, toLower, trim } from "lodash";
import { FILTERS, GENRES, PopulatedFilterGroup, SORT_OPTIONS } from "./filters";

export class MangaReaderTemplate extends TachiParsedHttpSource {
  lang = "en";
  supportsLatest = true;
  name = "MangaReader";
  baseUrl = "https://mangareader.to";

  // * Search
  searchMangaSelector(): string {
    return ".manga_list-sbs .manga-poster";
  }

  searchMangaNextPageSelector(): string {
    return ".page-link[title=Next]";
  }

  searchMangaFromElement(element: CheerioElement): Highlight {
    const id = element.attr("href") ?? "";
    const title = element.find("img").first().attr("alt") ?? "";
    const cover = element.find("img").first().attr("src") ?? "";
    return { id, title, cover };
  }

  // Latest
  latestUpdatesRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/filter`,
      params: {
        sort: "latest-update",
        language: this.lang,
        page: page,
      },
    };
  }

  latestUpdatesSelector(): string {
    return this.searchMangaSelector();
  }

  latestUpdatesFromElement(element: CheerioElement): Highlight {
    return this.searchMangaFromElement(element);
  }

  latestUpdatesNextPageSelector(): string {
    return this.searchMangaNextPageSelector();
  }
  // Popular
  popularMangaRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/filter`,
      params: {
        sort: "most-viewed",
        language: this.lang,
        page: page,
      },
    };
  }

  popularMangaSelector(): string {
    return this.searchMangaSelector();
  }
  popularMangaFromElement(element: CheerioElement): Highlight {
    return this.searchMangaFromElement(element);
  }

  popularMangaNextPageSelector(): string {
    return this.searchMangaNextPageSelector();
  }

  // Search

  searchMangaRequest(
    request: DirectoryRequest<PopulatedFilterGroup>
  ): NetworkRequest {
    if (request.query) {
      return {
        url: this.baseUrl + "/search",
        params: {
          keyword: request.query,
          page: request.page,
        },
      };
    } else if (request.tag?.tagId) {
      const tagId = request.tag.tagId;
      const genreId = GENRES.find((v) => v.title === tagId)?.id;
      if (genreId)
        return this.searchMangaRequest({
          page: request.page,
          filters: { genres: [genreId] },
        });
      else return this.popularMangaRequest(request.page);
    }

    const url = this.baseUrl + "/filter";
    const params: Record<string, FilterPrimitives> = {
      language: this.lang,
      page: request.page,
      sort: request.sort?.id ?? "most-viewed",
    };

    const filters = request.filters;

    if (filters?.type && filters.type !== "0") params["type"] = filters.type;
    if (filters?.rating && filters.rating !== "0")
      params["rating_type"] = filters.rating;
    if (filters?.score && filters.score !== "0")
      params["score"] = filters.score;
    if (filters?.status && filters.status !== "0")
      params["status"] = filters.status;

    if (filters?.genres && filters.genres.length)
      params["genres"] = filters.genres.join(",");

    return { url, params };
  }

  // * Manga Details
  mangaDetailsParse(document: CheerioAPI): Content {
    const root = document("#ani_detail").first();
    const title = this.ownText(root.find("h2"));
    const summary = root.find(".description").text().trim();
    const cover = root.find("img").first().attr("src") ?? "";
    const genres = root
      .find(".genres a")
      .toArray()
      .map((v) => document(v).text().trim());

    const miscInfo = root
      .find(".anisc-info .item-title")
      .toArray()
      .map((v) => document(v).text().trim().split(":").map(trim).join(": "));
    const properties: Property[] = [
      {
        id: "genres",
        title: "Genres",
        tags: genres.map((v) => ({ id: v, title: v })),
      },
    ];

    const recommended = document(".block_area-realtime .ulclear .manga-poster")
      .toArray()
      .map((v) => {
        const element = document(v);
        const id = element.attr("href") ?? "";
        const title = element.find("img").first().attr("alt") ?? "";
        const cover = element.find("img").first().attr("src") ?? "";
        return Generate<Highlight>({ id, cover, title });
      });

    const collection: HighlightCollection = {
      id: "recommended",
      title: "You May Also Like",
      highlights: recommended,
    };

    return {
      title,
      summary,
      cover,
      info: [...miscInfo, ...genres],
      properties,
      ...(recommended.length && {
        collections: [collection],
      }),
    };
  }

  // * Chapter List
  chapterListRequest(fragment: string): NetworkRequest {
    return {
      url:
        this.baseUrl +
        `/ajax/manga/reading-list/${
          fragment.split("-").pop() ?? ""
        }?readingBy=chap`,
    };
  }
  chapterListSelector(): string {
    return `#${this.lang}-chapters li`;
  }

  parseChapterList(json: string): Chapter[] {
    const html = JSON.parse(json).html;
    const $ = load(html);
    const title = this.mangaDetailsParse($).title;
    return $(this.chapterListSelector())
      .toArray()
      .map((element, idx) => {
        const data = this.chapterFromElement($(element));
        return this.generateChapter(data, idx, title);
      });
  }

  chapterFromElement(
    element: CheerioElement
  ): Omit<Chapter, "index" | "volume" | "language"> {
    const numberStr = element.attr("data-number") ?? "-1";
    const number = parseFloat(numberStr);

    const link = element.find("a").first();
    const title = startCase(
      toLower(link.text().trim().replace(`Chap ${numberStr}: `, "").trim())
    );
    const chapterId =
      link.attr("href") + "#" + "chap" + "/" + element.attr("data-id");

    return { chapterId, title, number, date: new Date() };
  }

  // * PageList
  async getPageList(_: string, chapter: string): Promise<ChapterData> {
    const [url, typeAndID] = chapter.split("#");

    if (!typeAndID) {
      const { data: html } = await this.client.request(
        this.pageListRequest(url)
      );
      const $ = load(html);
      const wrapper = $("#wrapper");
      const fragment =
        wrapper.attr("data-reading-by") + "/" + wrapper.attr("data-reading-id");
      return this.internalFetchPageList(fragment);
    }
    return this.internalFetchPageList(typeAndID);
  }

  protected async internalFetchPageList(
    fragment: string
  ): Promise<ChapterData> {
    const url = `${this.baseUrl}/ajax/image/list/${fragment}?quality=high`;
    const { data } = await this.client.get(url);
    const html = JSON.parse(data).html;
    const pages = this.pageListParse(load(html)).map((url) => ({ url }));
    return { pages };
  }

  pageListParse(document: CheerioAPI): string[] {
    const elements = document(".iv-card").toArray();
    const pages = elements.map((v) => {
      const element = document(v);
      const isScrambled = element.hasClass("shuffled");
      const url = element.attr("data-url") ?? "";

      return isScrambled ? `${url}#scrambled` : url;
    });

    return pages;
  }

  // * Filtering & Sorting
  async getFilterList(): Promise<DirectoryFilter[]> {
    return FILTERS;
  }
  async getSortOptions(): Promise<Option[]> {
    return SORT_OPTIONS;
  }
}
