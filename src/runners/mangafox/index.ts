import {
  Highlight,
  PageLink,
  PageLinkResolver,
  PageSection,
  ResolvedPageSection,
  RunnerInfo,
  SectionStyle,
  SourceConfig,
} from "@suwatte/daisuke";
import { CheerioElement, TachiBuilder } from "../../template/tachiyomi";
import { Template } from "./template";
import { load } from "cheerio";

const INFO: RunnerInfo = {
  id: "mangafox",
  name: "MangaFox",
  thumbnail: "mangafox.png",
  website: "https://fanfox.net",
  version: 0.1,
};

export class Target extends TachiBuilder implements PageLinkResolver {
  config: SourceConfig = {
    disableChapterDataCaching: true,
  };
  constructor() {
    super(INFO, Template);
  }
  async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
    if (link.id !== "home") throw new Error("Invalid Page");

    const { data: html } = await this.source.client.get(this.source.baseUrl);

    const parseStandardTile = (element: CheerioElement): Highlight => {
      const link = element.find("a");
      const title = link.attr("title") ?? "";
      const cover = element.find("img").first().attr("src") ?? "";
      const id = this.source.getUrlWithoutDomain(link.attr("href") ?? "");
      return { id, title, cover };
    };
    const $ = load(html);

    const hotManga = $(".manga-list-1-list li")
      .toArray()
      .map((v) => parseStandardTile($(v)));

    const beingReadRightNow = $(
      "body > div:nth-child(4) > div.main-large > div:nth-child(2) > ul > li"
    )
      .toArray()
      .map((v) => parseStandardTile($(v)));

    const recommended = $(".manga-list-3 li")
      .toArray()
      .map((v) => parseStandardTile($(v)));

    const latest = $(".manga-list-4-list > li")
      .toArray()
      .map((v) => {
        const elem = $(v);
        const link = elem.find(".manga-list-4-item-title a").first();
        const title = link.attr("title") ?? link.text();
        const id = this.source.getUrlWithoutDomain(link.attr("href") ?? "");
        const updateTime = elem
          .find(".manga-list-4-item-subtitle span")
          .text()
          .trim();
        const cover = elem.find("img").attr("src") ?? "";
        return { id, title, cover, info: [updateTime] };
      });

    return [
      {
        id: "hot",
        title: "Hot Manga Releases",
        items: hotManga,
        style: SectionStyle.GALLERY,
      },
      { id: "readRN", title: "Being Read Right Now", items: beingReadRightNow },
      { id: "recommended", title: "Recommended Titles", items: recommended },
      {
        id: "latest",
        title: "Latest Releases",
        items: latest,
        style: SectionStyle.PADDED_LIST,
        viewMoreLink: { request: { page: 1, sort: { id: "latest" } } },
      },
    ];
  }
  async resolvePageSection(
    _: PageLink,
    __: string
  ): Promise<ResolvedPageSection> {
    throw new Error("Method not used.");
  }
}
