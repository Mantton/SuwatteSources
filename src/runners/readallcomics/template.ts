import {
  DirectoryRequest,
  Highlight,
  NetworkRequest,
  Content,
  Chapter,
} from "@suwatte/daisuke";
import { TachiParsedHttpSource, CheerioElement } from "../../template/tachiyomi";
import { CheerioAPI, load } from "cheerio";

export class Template extends TachiParsedHttpSource {
  baseUrl = "https://readallcomics.com";
  lang = "en";
  name = "ReadAllComics";
  supportsLatest = false;

  headers(): Record<string, string> {
    return { Referer: `${this.baseUrl}/` };
  }

  // Popular
  popularMangaRequest(page: number): NetworkRequest {
    return { url: `${this.baseUrl}/page/${page}` };
  }
  popularMangaSelector(): string {
    return "#post-area > div";
  }
  popularMangaNextPageSelector(): string {
    return "a.page-numbers.next";
  }
  popularMangaFromElement(element: CheerioElement): Highlight {
    // Find class like category-<slug>
    const classList = (element.attr("class") ?? "").split(/\s+/);
    const categoryClass = classList.find((c) => c.startsWith("category-")) ?? "";
    const slug = categoryClass.replace("category-", "");
    const id = `/category/${slug}`;
    const title = slug
      .split("-")
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(" ");
    const cover = element.find("img").attr("src") ?? "";
    return { id, title, cover };
  }

  // Latest not supported
  latestUpdatesRequest(_: number): NetworkRequest {
    return { url: `${this.baseUrl}/` };
  }
  latestUpdatesSelector(): string {
    return this.popularMangaSelector();
  }
  latestUpdatesFromElement(element: CheerioElement): Highlight {
    return this.popularMangaFromElement(element);
  }

  // Search
  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    const url = `${this.baseUrl}/`;
    const params: Record<string, any> = {
      story: request.query ?? "",
      s: "",
      type: "comic",
    };
    return { url, params };
  }
  searchMangaSelector(): string {
    return ".categories a";
  }
  searchMangaFromElement(element: CheerioElement): Highlight {
    const id = this.getUrlWithoutDomain(element.attr("href") ?? "");
    const title = element.text().trim();
    const cover = `${this.baseUrl}/wp-content/uploads/cropped-logo-readallcomic-seo-2-192x192.jpg`;
    return { id, title, cover };
  }

  // Details
  mangaDetailsParse(document: CheerioAPI): Content {
    const title = document("h1").first().text().trim();
    const cover = document("p img").attr("src") ?? "";
    const author = document("p > strong").last().text().trim();
    const genres = document("p strong")
      .toArray()
      .map((e) => document(e).text().trim())
      .filter(Boolean)
      .join(", ");

    // Build description from .b > strong with preceding span
    const parts: string[] = [];
    document(".b > strong").each((_, el) => {
      const strong = document(el);
      const prev = strong.prev();
      if (prev && prev.prop("tagName")?.toLowerCase() === "span") {
        const label = document(prev).text().trim();
        if (label) parts.push(label);
      }
      const body = strong.text().trim();
      if (body) parts.push(body);
    });
    const summary = parts.join("\n\n");

    const info = [author].filter(Boolean);
    return { title, cover, summary, info };
  }

  // Chapters
  chapterListSelector(): string {
    return ".list-story a";
  }
  chapterFromElement(element: CheerioElement): Omit<
    Chapter,
    "number" | "index" | "volume" | "language"
  > {
    const url = this.getUrlWithoutDomain(element.attr("href") ?? "");
    const title = element.attr("title") ?? element.text().trim();
    const date = new Date();
    return { chapterId: url, title, date };
  }

  // Pages
  pageListParse(document: CheerioAPI): string[] {
    const urls = document('body img:not(body div[id="logo"] img)')
      .toArray()
      .map((e) => document(e).attr("src") ?? "")
      .filter((u) => /^https?:\/\//.test(u));
    return urls;
  }
}
