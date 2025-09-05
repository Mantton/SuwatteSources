import {
  Chapter,
  Content,
  DirectoryFilter,
  DirectoryRequest,
  Highlight,
  NetworkRequest,
  Option,
  PublicationStatus,
  FilterType,
  ReadingMode,
} from "@suwatte/daisuke";
import {
  TachiParsedHttpSource,
  CheerioElement,
} from "../../template/tachiyomi";
import { CheerioAPI, load } from "cheerio";
import moment from "moment";

export class Template extends TachiParsedHttpSource {
  baseUrl = "https://asuracomic.net";
  lang = "en";
  name = "Asura Scans";
  supportsLatest = true;

  headers(): Record<string, string> {
    return { Referer: `${this.baseUrl}/` };
  }

  // Cache for remote filter options
  private cachedFilters?: {
    genres: Option[];
    statuses: Option[];
    types: Option[];
  };

  // Search / Directory
  searchMangaSelector(): string {
    return "div.grid > a[href]";
  }
  searchMangaNextPageSelector(): string {
    return "div.flex > a.flex.bg-themecolor:contains(Next)";
  }
  searchMangaFromElement(element: CheerioElement): Highlight {
    let id = this.getUrlWithoutDomain(element.attr("href") ?? "");
    if (id && !id.startsWith("/")) id = "/" + id;
    const title =
      element.find("div.block > span.block").text().trim() ||
      element.text().trim();
    const cover = element.find("img").attr("src") ?? "";
    return { id, title, cover };
  }
  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    const url = `${this.baseUrl}/series`;
    const params: Record<string, any> = { page: request.page };
    if (request.query) params["name"] = request.query;
    // Order support (rating, update, latest, asc, desc). Default rating per extension
    params["order"] = request.sort?.id ?? "rating";
    // Basic defaults to match extension
    const filters = (request as any).filters ?? {};
    const genres = filters.genres ?? "";
    const status = filters.status ?? "-1";
    const types = filters.types ?? "-1";
    params["genres"] = Array.isArray(genres) ? genres.join(",") : genres;
    params["status"] = status;
    params["types"] = Array.isArray(types) ? types.join(",") : types;
    return { url, params };
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
  popularMangaRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/series`,
      params: { genres: "", status: "-1", types: "-1", order: "rating", page },
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
  latestUpdatesRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/series`,
      params: { genres: "", status: "-1", types: "-1", order: "update", page },
    };
  }

  // Details
  mangaDetailsParse(document: CheerioAPI): Content {
    const title =
      document("span.text-xl.font-bold, h3.truncate").first().text().trim() ||
      "";
    const cover = document("img[alt=poster]").attr("src") ?? "";
    const summary = document("span.font-medium.text-sm").first().text().trim();

    const getInfoVal = (label: string) => {
      const block = document("div.grid > div")
        .toArray()
        .find((el) => {
          const first = document(el).find("h3").toArray()[0];
          const txt = first ? document(first).text().trim().toLowerCase() : "";
          return txt.includes(label.toLowerCase());
        });
      if (!block) return "";
      const h3s = document(block).find("h3").toArray();
      if (h3s.length > 1) return document(h3s[1]).text().trim();
      return "";
    };

    const author = getInfoVal("author");
    const artist = getInfoVal("artist");
    const type = getInfoVal("type");
    const statusText = getInfoVal("status");

    const tags = document("div[class^=space] > div.flex > button.text-white")
      .toArray()
      .map((e) => document(e).text().trim())
      .filter(Boolean);
    const genres = [type, ...tags].filter(Boolean).join(", ");

    const status = this.parseStatus(statusText);
    const info = [author, artist].filter(Boolean);
    return {
      title,
      cover,
      summary,
      status,
      info,
      recommendedPanelMode: ReadingMode.WEBTOON,
    };
  }

  private parseStatus(val?: string) {
    const v = (val || "").toLowerCase();
    if (v === "hiatus") return PublicationStatus.HIATUS;
    if (v === "completed") return PublicationStatus.COMPLETED;
    if (v === "dropped") return PublicationStatus.CANCELLED;
    if (v === "ongoing" || v === "season end") return PublicationStatus.ONGOING;
    return undefined;
  }

  // Chapters
  chapterListSelector(): string {
    return "div.scrollbar-thumb-themecolor > div.group";
  }
  parseChapterList(html: string): Chapter[] {
    const $ = load(html);
    const title = this.mangaDetailsParse($).title;
    return $(this.chapterListSelector())
      .toArray()
      .filter((el) => $(el).find("svg").length === 0) // hide premium
      .map((el, idx) => {
        const data = this.chapterFromElement($(el));
        return this.generateChapter(data, idx, title);
      });
  }
  chapterFromElement(
    element: CheerioElement,
  ): Omit<Chapter, "number" | "index" | "volume" | "language"> {
    const a = element.find("a").first();
    let url = this.getUrlWithoutDomain(a.attr("href") ?? "");
    if (url && !url.startsWith("/")) url = "/" + url;
    if (url.startsWith("/") && !url.startsWith("/series/")) {
      url = "/series" + url;
    }
    const chNumber = element.find("h3").first().text().trim();
    const chTitle = element
      .find("h3 > span")
      .toArray()
      .map((e) => element.find(e).text().trim())
      .join(" ");
    const title = chTitle ? `${chNumber} - ${chTitle}` : chNumber;

    const rawDate = element.find("h3 + h3").first().text().trim();
    const clean = rawDate.replace(/(\d+)(st|nd|rd|th)/gi, "$1");
    const date = moment(clean, "MMMM D YYYY").toDate();

    return { chapterId: url, title, date };
  }

  // Pages
  pageListParse(document: CheerioAPI): string[] {
    // 1) Try __NEXT_DATA__ JSON structure if present
    const nextDataRaw = document("script#__NEXT_DATA__").text();
    if (nextDataRaw) {
      try {
        const json = JSON.parse(nextDataRaw);
        const extractFromObject = (obj: any): string[] | undefined => {
          if (!obj || typeof obj !== "object") return undefined;
          if (Array.isArray((obj as any).pages)) {
            const urls = this.normalizeImageArray((obj as any).pages);
            if (urls.length) return urls;
          }
          if (Array.isArray((obj as any).images)) {
            const urls = this.normalizeImageArray((obj as any).images);
            if (urls.length) return urls;
          }
          for (const key of Object.keys(obj)) {
            const val = (obj as any)[key];
            const res = extractFromObject(val);
            if (res && res.length) return res;
          }
          return undefined;
        };
        const urls = extractFromObject(json) ?? [];
        if (urls.length) return urls;
      } catch {
        // fallthrough
      }
    }

    // 2) NEXT stream payload fallback (escaped strings)
    const scriptsData = document("script")
      .toArray()
      .map((e) => document(e).text())
      .filter((t) => t.includes("self.__next_f.push"))
      .map((t) => {
        const fq = t.indexOf('"');
        const lq = t.lastIndexOf('"');
        if (fq >= 0 && lq > fq) return t.substring(fq + 1, lq);
        return t;
      })
      .join("");
    const match = scriptsData.match(/\"pages\"\s*:\s*(\[.*?])/);
    if (match) {
      const raw = match[1];
      const unescaped = raw.replace(/\\(.)/g, "$1");
      try {
        const pages = JSON.parse(unescaped) as { order: number; url: string }[];
        return pages.sort((a, b) => a.order - b.order).map((p) => p.url);
      } catch {
        // continue
      }
    }

    // 3) Generic HTML regex fallbacks for images/pages arrays
    const html = document.html() || "";
    const tryPatterns = [
      /\"images\"\s*:\s*(\[.*?])/s,
      /\"pages\"\s*:\s*(\[.*?])/s,
    ];
    for (const pattern of tryPatterns) {
      const m = html.match(pattern);
      if (m) {
        const raw = m[1];
        const unescaped = raw.replace(/\\(.)/g, "$1");
        try {
          const arr: any[] = JSON.parse(unescaped);
          const urls = this.normalizeImageArray(arr);
          if (urls.length) return urls;
        } catch {
          try {
            const arr: any[] = JSON.parse(raw);
            const urls = this.normalizeImageArray(arr);
            if (urls.length) return urls;
          } catch {
            // continue
          }
        }
      }
    }

    // 4) Last resort: collect all image tags
    const fallbackImgs = document("img")
      .toArray()
      .map((e) => document(e).attr("src") ?? "");
    return fallbackImgs.filter((u) => /^https?:\/\//.test(u));
  }

  private normalizeImageArray(arr: any[]): string[] {
    if (!Array.isArray(arr)) return [];
    if (arr.every((v) => typeof v === "string")) {
      return (arr as string[]).filter((u) => /^https?:\/\//.test(u));
    }
    const urls = arr
      .map((v) => (v && typeof v === "object" ? (v.url ?? v.src ?? "") : ""))
      .filter((u) => typeof u === "string" && /^https?:\/\//.test(u));
    return urls as string[];
  }

  // Sorting & Filters
  async getSortOptions(): Promise<Option[]> {
    return [
      { id: "rating", title: "Rating" },
      { id: "update", title: "Latest Updates" },
      { id: "latest", title: "Latest Added" },
      { id: "asc", title: "A-Z" },
      { id: "desc", title: "Z-A" },
    ];
  }

  async getFilterList(): Promise<DirectoryFilter[]> {
    const { genres, statuses, types } = await this.fetchFilters();
    return [
      {
        id: "status",
        title: "Status",
        type: FilterType.SELECT,
        options: [{ id: "-1", title: "Any" }, ...statuses],
      },
      {
        id: "types",
        title: "Type",
        type: FilterType.MULTISELECT,
        options: types,
      },
      {
        id: "genres",
        title: "Genres",
        type: FilterType.MULTISELECT,
        options: genres,
      },
    ];
  }

  private async fetchFilters(): Promise<{
    genres: Option[];
    statuses: Option[];
    types: Option[];
  }> {
    if (this.cachedFilters) return this.cachedFilters;
    const url = "https://gg.asuracomic.net/api/series/filters";
    const { data } = await this.client.request({
      url,
      headers: this.headers(),
    });
    try {
      const json = JSON.parse(data);
      const genres: Option[] = (json.genres ?? [])
        .filter((g: any) => typeof g?.id === "number" && g.id > 0)
        .map((g: any) => ({ id: String(g.id), title: String(g.name ?? "") }));
      const statuses: Option[] = (json.statuses ?? []).map((s: any) => ({
        id: String(s.id),
        title: String(s.name ?? ""),
      }));
      const types: Option[] = (json.types ?? []).map((t: any) => ({
        id: String(t.id),
        title: String(t.name ?? ""),
      }));
      this.cachedFilters = { genres, statuses, types };
      return this.cachedFilters;
    } catch {
      // Fallback to minimal defaults if parsing fails
      const fallback = {
        genres: [] as Option[],
        statuses: [
          { id: "1", title: "Ongoing" },
          { id: "2", title: "Completed" },
          { id: "3", title: "Hiatus" },
          { id: "4", title: "Dropped" },
        ],
        types: [
          { id: "1", title: "Manga" },
          { id: "2", title: "Manhwa" },
          { id: "3", title: "Manhua" },
        ],
      };
      this.cachedFilters = fallback;
      return fallback;
    }
  }
}
