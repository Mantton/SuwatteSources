import { ReadingMode, SourceInfo } from "@suwatte/daisuke";
import { MadaraTemplate } from "../../template/madara";
import { DEFAULT_CONTEXT } from "../../template/madara/constants";

export class Target extends MadaraTemplate {
  info: SourceInfo = {
    id: "com.colored_manga",
    name: "ColoredManga",
    thumbnail: "colored_manga.png",
    version: 1.0,
    website: "hhttps://coloredmanga.com",
    supportedLanguages: ["EN_US"],
    nsfw: false,
    minSupportedAppVersion: "5.0",
  };

  constructor() {
    super({
      ...DEFAULT_CONTEXT,
      baseUrl: "https://coloredmanga.com",
      contentPath: "mangas",
      tagSelector: ".wp-manga-tags-list > a",
      filterNonMangaItems: false,
      chapterUseAJAX: false,
      useLoadMoreSearch: false,
      paginationLimit: 12,
      defaultReadingMode: ReadingMode.PAGED_MANGA,
    });
  }
}
