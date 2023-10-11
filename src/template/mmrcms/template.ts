import {
  NetworkRequest,
  DirectoryRequest,
  PagedResult,
  Content,
  Chapter,
  ChapterData,
  Highlight,
} from "@suwatte/daisuke";
import { CheerioElement, TachiHttpSource } from "../tachiyomi";
import { load } from "cheerio";
import moment from "moment";

export abstract class MMRCMSTemplate extends TachiHttpSource {
  abstract ITEM_URL: string;
  abstract DATE_FORMAT: string;
  popularMangaRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/filterList?page=${page}&sortBy=views&asc=false`,
    };
  }
  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    const { query, page } = request;

    if (query) {
      return {
        url: `${this.baseUrl}/search`,
        params: { query },
      };
    } else {
      return {
        url: `${this.baseUrl}/filterList?page=${page}`,
      };
    }
  }
  latestUpdatesRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/latest-release?page=${page}`,
    };
  }
  parsePopularManga = this.internalMangaParse;

  internalMangaParse(str: string): PagedResult {
    const $ = load(str);

    const internalMangaSelector = "div[class^=col-sm], div.col-xs-6";

    const results = $(internalMangaSelector)
      .toArray()
      .map((v): Highlight => {
        const element = $(v);
        let url = "";
        let title = "";
        let cover = "";
        const urlElement = element.find(".chart-title");
        if (urlElement.length == 0) {
          url = this.getUrlWithoutDomain(element.find("a").attr("href") ?? "");
          title = element.find("div.caption").text().trim();

          const sel = element.find("div.caption div").text();
          if (sel) {
            title = title.substring(0, title.indexOf(sel));
          }
        } else {
          url = this.getUrlWithoutDomain(urlElement.attr("href") ?? "");
          title = urlElement.text().trim();
        }

        const imgElem = element.find("img");

        const bgImage = element.attr("data-background-image");
        const src = imgElem.attr("data-src") ?? imgElem.attr("src");
        if (bgImage) {
          cover = bgImage;
        } else if (src) {
          cover = this.coverGuess(src, url);
        } else {
          this.coverGuess(imgElem.attr("src") ?? "", url);
        }

        return { id: url, cover, title };
      });

    const isLastPage = $(".pagination a[rel=next]").toArray().length === 0;

    return {
      results,
      isLastPage,
    };
  }

  coverGuess(url: string, mangaUrl: string) {
    if (url?.endsWith("no-image.png")) {
      return `${this.baseUrl}/uploads/manga/${
        /[^/]*$/.exec(mangaUrl)?.[0] ?? ""
      }/cover/cover_250x350.jpg`;
    } else {
      if (url.startsWith("//")) {
        url = "https:" + url;
      }
      return url;
    }
  }

  parseSearchManga(response: string, context: DirectoryRequest): PagedResult {
    if (context.query) {
      const {
        suggestions,
      }: { suggestions: { value: string; data: string }[] } = JSON.parse(
        response.trim()
      );

      const results: Highlight[] = suggestions.map((entry) => {
        const segment = entry.data;
        const url = this.getUrlWithoutDomain(this.ITEM_URL + segment);
        const title = entry.value;
        const cover = `${this.baseUrl}/uploads/manga/${segment}/cover/cover_250x350.jpg`;
        return { id: url, title, cover };
      });

      return { results, isLastPage: true };
    } else {
      return this.internalMangaParse(response);
    }
  }

  parseLatestManga(response: string): PagedResult {
    const selector = "div.mangalist div.manga-item";
    const $ = load(response);
    const results = $(selector)
      .toArray()
      .map((v) => {
        const elem = $(v);
        if (elem.find("a").first().text())
          return this.listLayoutFromElement(elem, "a");
        else return this.gridLayoutFromElement(elem);
      });

    const isLastPage = $("a[rel=next]").first().length === 0;
    return {
      results,
      isLastPage,
    };
  }

  listLayoutFromElement(
    element: CheerioElement,
    urlSelector: string
  ): Highlight {
    const titleElement = element.find(urlSelector);

    const id = titleElement.attr("href")?.split(this.baseUrl).pop() ?? "";
    const title = titleElement.text().trim();
    const n = id.lastIndexOf("/");

    const cover = `${this.baseUrl}/uploads/manga/${id.substring(
      n + 1
    )}/cover/cover_250x350.jpg`;

    return { id, title, cover };
  }

  gridLayoutFromElement(element: CheerioElement): Highlight {
    const titleElem = element.find("a.chart-title");
    const id = this.getUrlWithoutDomain(titleElem.attr("href") ?? "");
    const title = titleElem.text().trim();
    const cover =
      element.find("img").attr("src") ??
      element.find("img").attr("data-src") ??
      "";

    return { id, title, cover };
  }

  parseMangaDetails(response: string): Content {
    const $ = load(response);
    const title = $("h2.listmanga-header, h2.widget-title")
      .first()
      .text()
      .trim();
    const cover = this.coverGuess(
      $(".row [class^=img-responsive]").first().attr("src") ?? "",
      this.ITEM_URL
    );

    const detailAuthor = [
      "author(s)",
      "autor(es)",
      "auteur(s)",
      "著作",
      "yazar(lar)",
      "mangaka(lar)",
      "pengarang/penulis",
      "pengarang",
      "penulis",
      "autor",
      "المؤلف",
      "перевод",
      "autor/autorzy",
    ];
    const detailArtist = [
      "artist(s)",
      "artiste(s)",
      "sanatçi(lar)",
      "artista(s)",
      "artist(s)/ilustrator",
      "الرسام",
      "seniman",
      "rysownik/rysownicy",
    ];
    const detailGenre = [
      "categories",
      "categorías",
      "catégories",
      "ジャンル",
      "kategoriler",
      "categorias",
      "kategorie",
      "التصنيفات",
      "жанр",
      "kategori",
      "tagi",
    ];
    const detailStatus = [
      "status",
      "statut",
      "estado",
      "状態",
      "durum",
      "الحالة",
      "статус",
    ];
    const detailStatusComplete = [
      "complete",
      "مكتملة",
      "complet",
      "completo",
      "zakończone",
      "concluído",
    ];
    const detailStatusOngoing = [
      "ongoing",
      "مستمرة",
      "en cours",
      "em lançamento",
      "prace w toku",
      "ativo",
      "em andamento",
    ];
    const detailDescription = ["description", "resumen"];

    const info = [];
    let summary = "";
    for (const element of $(".row .dl-horizontal dt")
      .toArray()
      .map((v) => $(v))) {
      const data = element.text().toLowerCase().replace(/:$/, "");

      if (detailAuthor.includes(data) || detailArtist.includes(data)) {
        info.push(element.next().text().trim());
      } else if (detailGenre.includes(data)) {
        const genres = element
          .next()
          .find("a")
          .toArray()
          .map((v) => $(v).text().trim());
        info.push(...genres);
      }
    }
    for (const element of $("div.panel span.list-group-item")
      .toArray()
      .map((v) => $(v))) {
      const data = element.text().toLowerCase().replace(/:$/, "");

      if (detailAuthor.includes(data) || detailArtist.includes(data)) {
        info.push(element.find("b + a").text());
      } else if (detailGenre.includes(data)) {
        const genres = element
          .find("a")
          .toArray()
          .map((v) => $(v).text().trim());
        info.push(...genres);
      } else if (detailDescription.includes(data)) {
        summary = element.text().trim();
      }
    }

    return { title, cover, info, ...(summary && { summary }) };
  }
  parseChapterList(response: string): Chapter[] {
    const selector = "ul[class^=chapters] > li:not(.btn), table.table tr";
    const $ = load(response);

    const title = $("h2.listmanga-header, h2.widget-title")
      .first()
      .text()
      .trim();
    const elements = $(selector)
      .toArray()
      .map((elem) => this.chapterFromElement($(elem)));

    return (elements.filter((v) => !!v) as any[]).map((v, i) => ({
      ...v,
      number: this.recognizer.parseChapterNumber(title, v.title),
      index: i,
      language: this.lang,
    }));
  }

  chapterFromElement(element: CheerioElement) {
    const titleWrapper = element.find("[class^=chapter-title-rtl]").first();

    const fUrl = titleWrapper
      .find("a")
      .toArray()
      .find((v) => /[a-zA-z]/.test(element.find(v).attr("href") ?? ""));
    if (!fUrl) return null;
    const url =
      this.getUrlWithoutDomain(element.find(fUrl).attr("href") ?? "") ?? "";

    const title = titleWrapper.text().trim();

    const dateText = element.find(".date-chapter-title-rtl").text().trim();
    const date = moment(dateText).toDate();
    return {
      chapterId: url,
      title,
      date,
    };
  }
  parsePageList(response: string): ChapterData {
    const $ = load(response);
    const images = $("#all > .img-responsive")
      .toArray()
      .map((v) => {
        const elem = $(v);
        const url = elem.attr("data-src") ?? elem.attr("src") ?? "";
        return url.trim();
      });

    return {
      pages: images.map((url) => ({ url })),
    };
  }
}
