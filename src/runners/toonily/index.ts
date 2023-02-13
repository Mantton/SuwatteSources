import { AuthMethod, NetworkRequest, SourceInfo, User } from "@suwatte/daisuke";
import { load } from "cheerio";
import { MadaraTemplate } from "../../template/madara";
import { DEFAULT_CONTEXT } from "../../template/madara/constants";
import { imageFromElement } from "../../template/madara/utils";

export class Target extends MadaraTemplate {
  info: SourceInfo = {
    id: "com.toonily",
    name: "Toonily",
    thumbnail: "toonily.png",
    version: 1.2,
    website: "https://toonily.com",
    supportedLanguages: ["EN_US"],
    nsfw: true,
    minSupportedAppVersion: "4.6.0",
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
      useLoadMoreSearch: true,
    });
  }

  async onSourceLoaded(): Promise<void> {
    this.controller.client.requestInterceptHandler = async (req) => {
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
    };
  }

  async getAuthenticationMethod(): Promise<AuthMethod> {
    return AuthMethod.WEB;
  }
  async willRequestWebViewAuth(): Promise<NetworkRequest> {
    return {
      url: this.info.website,
    };
  }
  async didReceiveWebAuthCookie(name: string): Promise<boolean> {
    return name.includes("wordpress_logged_in");
  }

  async getAuthenticatedUser(): Promise<User | null> {
    const response = await this.controller.client.get(
      "https://toonily.com/user-settings/?tab=account-settings"
    );

    const $ = load(response.data);

    const username = $(
      "#form-account-settings > div > div:nth-child(2) > div:nth-child(2) > div > span"
    ).text();

    const avatar = imageFromElement($(".c-user-avatar > img"));

    if (!username) {
      return null;
    }

    return {
      id: username,
      username,
      avatar,
      info: [],
    };
  }
}
