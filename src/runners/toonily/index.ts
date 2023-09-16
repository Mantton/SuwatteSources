import {
  ContentSource,
  DeepLinkContext,
  GroupedUpdateResponse,
  RunnerInfo,
  SourceConfig,
} from "@suwatte/daisuke";
import { MadaraTemplate } from "../../template/madara";
import { DEFAULT_CONTEXT } from "../../template/madara/constants";
import { GroupedUpdatesProvider } from "@suwatte/daisuke";

export class Target
  extends MadaraTemplate
  implements ContentSource, GroupedUpdatesProvider
{
  info: RunnerInfo = {
    id: "com.toonily",
    name: "Toonily",
    thumbnail: "toonily.png",
    version: 1.4,
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
      contentPath: "webtoon",
      tagSelector: ".wp-manga-tags-list > a",
      filterNonMangaItems: false,
      chapterUseAJAX: true,
      searchSelector: "div.page-item-detail.manga",
      useLoadMoreSearch: false,
      dateFormat: "MMM d, yyyy",
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

  async getGroupedUpdates(
    ids: string[],
    dateString: Date
  ): Promise<GroupedUpdateResponse> {
    console.log(ids);
    console.log(dateString);
    console.log(typeof dateString);
    throw new Error("Complete");
  }

  // async willRequestWebViewAuth(): Promise<NetworkRequest> {
  //   return {
  //     url: this.info.website,
  //   };
  // }

  // async didReceiveAuthenticationCookieFromWebView(cookie: {
  //   name: string;
  //   value: string;
  // }): Promise<boolean> {
  //   return cookie.name.includes("wordpress_logged_in");
  // }

  //   async getAuthenticatedUser(): Promise<User | null> {
  //     const response = await this.controller.client.get(
  //       "https://toonily.com/user-settings/?tab=account-settings"
  //     );

  //     const $ = load(response.data);

  //     const username = $(
  //       "#form-account-settings > div > div:nth-child(2) > div:nth-child(2) > div > span"
  //     ).text();

  //     const avatar = imageFromElement($(".c-user-avatar > img"));

  //     if (!username) {
  //       return null;
  //     }

  //     return {
  //       id: username,
  //       username,
  //       avatar,
  //       info: [],
  //     };
  //   }
}
