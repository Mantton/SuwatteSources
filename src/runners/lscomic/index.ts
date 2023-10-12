import { Chapter, Highlight, RunnerInfo } from "@suwatte/daisuke";
import { CheerioElement, TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "lscomic",
  name: "Leviatan Scans",
  thumbnail: "lscomic.png",
  version: 0.1,
  website: "https://lscomic.com",
};

class Template extends TachiDaraTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en";
  name = info.name;

  dateFormat = "MMM DD, YYYY";
  useNewChapterEndpoint = true;
  mangaDetailsSelectorDescription = "div.manga-summary";
  mangaDetailsSelectorAuthor = "div.manga-authors";
  chapterListSelector(): string {
    return "li.wp-manga-chapter:not(.premium-block)";
  }

  popularMangaFromElement(element: CheerioElement): Highlight {
    const pre = super.popularMangaFromElement(element);
    return {
      ...pre,
      id: this.replaceRandomUrlPartInManga(pre.id),
    };
  }

  latestUpdatesFromElement(element: CheerioElement): Highlight {
    const pre = super.latestUpdatesFromElement(element);
    return {
      ...pre,
      id: this.replaceRandomUrlPartInManga(pre.id),
    };
  }

  searchMangaFromElement(element: CheerioElement): Highlight {
    const pre = super.searchMangaFromElement(element);
    return {
      ...pre,
      id: this.replaceRandomUrlPartInManga(pre.id),
    };
  }

  chapterFromElement(
    element: CheerioElement
  ): Omit<Chapter, "number" | "index" | "volume" | "language"> {
    const pre = super.chapterFromElement(element);
    const chapterId = this.replaceRandomUrlPartInChapter(pre.chapterId);
    const title = this.ownText(element);

    return {
      ...pre,
      chapterId,
      ...(title && { title }),
    };
  }

  protected replaceRandomUrlPartInManga(url: string) {
    const split = url.split("/");
    url = split.slice(split.indexOf("manga"), split.length).join("/");
    return `/${url}`;
  }

  protected replaceRandomUrlPartInChapter(url: string) {
    const split = url.split("/");
    url =
      this.baseUrl +
      split.slice(split.indexOf("manga"), split.length).join("/");
    return `/${url}`;
  }
}

export const Target = new TachiBuilder(info, Template);
