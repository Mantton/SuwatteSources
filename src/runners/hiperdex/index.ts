import { SourceInfo } from "@suwatte/daisuke";
import { MadaraTemplate } from "../../template/madara";
import { DEFAULT_CONTEXT } from "../../template/madara/constants";

export class Target extends MadaraTemplate {
  info: SourceInfo = {
    id: "com.hiperdex",
    name: "Hiperdex",
    thumbnail: "hiperdex.png",
    version: 0.1,
    website: "https://1sthiperdex.com",
    supportedLanguages: ["EN_US"],
    nsfw: true,
    minSupportedAppVersion: "4.6.0",
  };

  constructor() {
    super({
      ...DEFAULT_CONTEXT,
      baseUrl: "https://1sthiperdex.com",
      contentPath: "manga",
      filterNonMangaItems: false,
      chapterUseAJAX: true,
      useLoadMoreSearch: false,
      dateFormat: "MMMM d, yyyy",
    });
  }
}
