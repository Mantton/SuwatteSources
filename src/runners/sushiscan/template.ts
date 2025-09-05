import {
  DirectoryRequest,
  NetworkRequest,
  PublicationStatus,
} from "@suwatte/daisuke";
import { MangaThemesiaTemplate } from "../../template/mangathemesia";
import { CheerioAPI } from "cheerio";
import moment from "moment";
import "moment/locale/fr";

export class Template extends MangaThemesiaTemplate {
  baseUrl = "https://sushiscan.net";
  lang = "fr";
  name = "Sushi-Scan";
  supportsLatest = true;

  protected mangaUrlDirectory = "/catalogue";

  headers(): Record<string, string> {
    return {
      Referer: `${this.baseUrl}${this.mangaUrlDirectory}`,
      "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
      Accept:
        "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      "Upgrade-Insecure-Requests": "1",
    };
  }

  // Use French-targeted selectors for author/status blocks
  protected seriesAuthorSelector =
    ".infotable tr:contains(Auteur) td:last-child";
  protected seriesStatusSelector =
    ".infotable tr:contains(Statut) td:last-child";

  // Popular / Latest follow catalogue with order param
  popularMangaRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}${this.mangaUrlDirectory}/`,
      params: { page, order: "popular" },
    };
  }
  latestUpdatesRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}${this.mangaUrlDirectory}/`,
      params: { page, order: "update" },
    };
  }

  // Site search uses WP search path: /page/{page}?s=
  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    const page = request.page ?? 1;
    const url = `${this.baseUrl}/page/${page}`;
    const params: Record<string, any> = {};
    if (request.query) params["s"] = request.query;
    return { url, params };
  }

  // French status map
  parseStatus(val?: string) {
    const v = (val ?? "").toLowerCase();
    if (v.includes("en cours")) return PublicationStatus.ONGOING;
    if (v.includes("terminé")) return PublicationStatus.COMPLETED;
    if (v.includes("abandonné")) return PublicationStatus.CANCELLED;
    if (v.includes("en pause")) return PublicationStatus.HIATUS;
    return undefined;
  }

  // SushiScan uses ts_reader.run({...}) on chapter pages
  pageListParse(document: CheerioAPI): string[] {
    // Direct HTML images first (template behavior)
    const htmlPages = document(this.pageSelector)
      .toArray()
      .map((elem) => this.imageSrc(document(elem)))
      .filter((v) => !!v);
    if (htmlPages.length) return htmlPages;

    const script = document("script")
      .toArray()
      .map((e) => document(e).text())
      .find((t) => t.includes("ts_reader"));
    if (script) {
      try {
        const start = script.indexOf("ts_reader.run(");
        if (start >= 0) {
          const open = start + "ts_reader.run(".length;
          const end = script.indexOf(");", open);
          const jsonStr = script.substring(
            open,
            end >= 0 ? end : script.length,
          );
          const payload = JSON.parse(jsonStr) as {
            sources?: { source?: string; images?: string[] }[];
          };
          const images = payload?.sources?.[0]?.images ?? [];
          const urls = images
            .map((u) =>
              typeof u === "string" ? u.replace("http://", "https://") : "",
            )
            .filter((u) => /^https?:\/\//.test(u));
          if (urls.length) return urls;
        }
      } catch {
        // fall through to template fallback
      }
    }

    // Fallback to MangaThemesiaTemplate generic regex
    return super.pageListParse(document);
  }

  // Override to ensure French locale date parsing to valid Date
  chapterFromElement(element: any) {
    const urlElements = element.find("a").first();
    const url = this.getUrlWithoutDomain(urlElements.attr("href") ?? "");
    let title = element.find(".lch a, .chapternum").text().trim();
    if (!title) title = urlElements.first().text().trim();

    let date = new Date();
    const dateStr = element.find(".chapterdate").first().text().trim();
    if (dateStr) {
      const m = moment(dateStr, this.dateFormat, 'fr', true);
      if (m.isValid()) {
        // Keep as Date (validator expects Date); JSON serialization yields ISO8601
        date = m.toDate();
      }
    }

    return {
      chapterId: url,
      date,
      title,
    };
  }
}
