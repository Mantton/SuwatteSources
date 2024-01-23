import { DirectoryRequest, NetworkRequest } from "@suwatte/daisuke";
import { MangaThemesiaTemplate } from "../../template/mangathemesia";
import { CheerioAPI } from "cheerio";

export class Template extends MangaThemesiaTemplate {
  baseUrl = "https://asuratoon.com";

  lang = "en";
  name = "Asura Scans";

  dateFormat = "MMMM DD, yyyy";

  seriesDescriptionSelector =
    "div.desc p, div.entry-content p, div[itemprop=description]:not(:has(p))";
  seriesArtistSelector =
    ".fmed b:contains(artist)+span, .infox span:contains(artist)";
  seriesAuthorSelector =
    ".fmed b:contains(author)+span, .infox span:contains(author)";

  pageSelector =
    "div.rdminimal > img, div.rdminimal > p > img, div.rdminimal > a > img, div.rdminimal > p > a > img, " +
    "div.rdminimal > noscript > img, div.rdminimal > p > noscript > img, div.rdminimal > a > noscript > img, div.rdminimal > p > a > noscript > img";

  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    const req = super.searchMangaRequest(request);

    if (!request.query) return req;

    const url = `${this.baseUrl}/page/${request.page}/`;
    const params = req.params ?? {};
    delete params.page;
    delete params.title;

    params["s"] = request.query;

    return { url, params };
  }

  pageListParse(document: CheerioAPI): string[] {
    const elements = document(this.pageSelector)
      .toArray()
      .map((v) => document(v))
      .map((v) => v.attr("src") ?? "");

    return elements;
  }
}
