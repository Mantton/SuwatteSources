import {
  ContentSource,
  DeepLinkContext,
  RunnerInfo,
  SourceConfig,
} from "@suwatte/daisuke";
import { MadaraTemplate } from "../../template/madara";
import { DEFAULT_CONTEXT } from "../../template/madara/constants";

export class Target extends MadaraTemplate implements ContentSource {
  info: RunnerInfo = {
    id: "com.toonily",
    name: "Toonily",
    thumbnail: "toonily.png",
    version: 1.51,
    website: "https://toonily.com",
    supportedLanguages: ["EN_US"],
    minSupportedAppVersion: "6.0",
  };

  config?: SourceConfig | undefined = {
    owningLinks: ["https://www.toonily.com", "https://toonily.com"],
  };

  constructor() {
    super({
      ...DEFAULT_CONTEXT,
      baseUrl: "https://toonily.com",
      contentPath: "serie",
      tagSelector: ".wp-manga-tags-list > a",
      filterNonMangaItems: false,
      chapterUseAJAX: true,
      searchSelector: "div.page-item-detail.manga",
      useLoadMoreSearch: false,
      dateFormat: "MMM D, YYYY",
      paginationLimit: 18,
      requestInterceptors: [
        async (req) => {
          return {
            ...req,
            headers: {
              ...(req.headers ?? {}),
              referer: this.context.baseUrl + "/",
            },
            cookies: [
              {
                name: "wpmanga-adault",
                domain: ".toonily.com",
                value: "1",
              },
              {
                name: "toonily-mature",
                domain: ".toonily.com",
                value: "1",
              },
            ],
          };
        },
      ],
    });

    this.info;
  }

  async handleURL(url: string): Promise<DeepLinkContext | null> {
    const pattern = /https?:\/\/(www\.)?toonily\.com\/webtoon\/([\w-]+)/;
    const match = url.match(pattern);

    if (match && match[2]) {
      const id = match[2];

      return {
        content: {
          id,
          ...(await this.getContent(id)),
        },
      };
    }

    return null;
  }
}
