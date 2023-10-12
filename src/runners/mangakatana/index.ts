import {
  Highlight,
  PageLink,
  PageLinkResolver,
  PageSection,
  ResolvedPageSection,
  RunnerInfo,
  SectionStyle,
} from "@suwatte/daisuke";
import {
  CheerioElement,
  TachiBuilder,
  TachiParsedHttpSource,
} from "../../template/tachiyomi";
import { Template } from "./template";
import { load } from "cheerio";

const INFO: RunnerInfo = {
  id: "mangakatana",
  name: "MangaKatana",
  website: "https://mangakatana.com",
  thumbnail: "mangakatana.png",
  version: 0.1,
};

export class Target extends TachiBuilder implements PageLinkResolver {
  constructor() {
    super(INFO, Template);
  }
  async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
    if (link.id !== "home") throw new Error("Unknown Page");

    const { data: html } = await this.source.client.get(this.source.baseUrl);

    const $ = load(html);

    const parseElement = (element: CheerioElement): Highlight => {
      const title = element.find(".title").text().trim();
      const cover =
        element.find(".wrap_img img").first().attr("src") ??
        element.find(".wrap_img img").first().attr("data-src") ??
        "";
      const id = this.source.getUrlWithoutDomain(
        element.find(".title a").first().attr("href") ?? ""
      );
      return { id, title, cover };
    };

    const hotUpdates = $("ul.slick_book li")
      .toArray()
      .map((v) => parseElement($(v)));

    const hotManga = $("#hot_book .item")
      .toArray()
      .map((v) => parseElement($(v)));

    const latestManga = $("#book_list .item")
      .toArray()
      .map((v) =>
        (this.source as TachiParsedHttpSource).latestUpdatesFromElement($(v))
      );

    return [
      {
        id: "hot_updates",
        title: "Trending Updates",
        items: hotUpdates,
        style: SectionStyle.GALLERY,
      },
      {
        id: "hot_manga",
        title: "Hot Manga",
        items: hotManga,
      },
      {
        id: "latest",
        title: "Latest Updates",
        items: latestManga,
        style: SectionStyle.PADDED_LIST,
      },
    ];
  }
  resolvePageSection(_: PageLink, __: string): Promise<ResolvedPageSection> {
    throw new Error("Method not used.");
  }
}
