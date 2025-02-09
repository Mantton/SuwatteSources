import {
  Highlight,
  PageLink,
  PageLinkResolver,
  PageSection,
  ResolvedPageSection,
  RunnerInfo,
  SectionStyle,
} from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { Template } from "./template";
import { load } from "cheerio";

const INFO: RunnerInfo = {
  id: "readm",
  name: "ReadM",
  thumbnail: "readm.png",
  version: 0.1,
};

export class Target extends TachiBuilder implements PageLinkResolver {
  constructor() {
    super(INFO, Template);
  }

  resolvePageSection(_: PageLink, __: string): Promise<ResolvedPageSection> {
    throw new Error("Method not used.");
  }

  async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
    if (link.id !== "home") throw new Error("Unknown Page");
    const { data: html } = await this.source.client.get(this.source.baseUrl);
    const $ = load(html);
    const hotManga = $("#manga-hot-updates .item")
      .toArray()
      .map((v): Highlight => {
        const element = $(v);
        const cover =
          this.source.baseUrl + element.find("img").first().attr("src");
        const id =
          element
            .find("a")
            .first()
            .attr("href")
            ?.match(/(\/manga\/[^/]+)/)?.[1] ?? "";
        const title = element.find("strong").text();
        const subtitle =
          "Chapter " + element.find(".caption span").text().trim();
        return { id, title, subtitle, cover };
      });

    const popularManga = $("#latest_trailers li")
      .toArray()
      .map((v): Highlight => {
        const element = $(v);
        const id = element.find("a").first().attr("href") ?? "";
        const title = element.find("a").first().attr("title") ?? "";
        const cover =
          this.source.baseUrl + element.find("img").first().attr("data-src");

        return { id, title, cover };
      });

    const latestManga = $(".latest-updates > li")
      .toArray()
      .map((v): Highlight => {
        const element = $(v);
        const title = element.find("h2").first().text().trim();
        const id = element.find("h2 > a").first().attr("href") ?? "";
        const cover =
          this.source.baseUrl + element.find("img").first().attr("data-src");
        const timeAgo = element.find(".date").first().text().trim() + " Ago";

        return { id, title, cover, info: [timeAgo] };
      });

    const parseLargeTiles = (selector: string) =>
      $(selector)
        .toArray()
        .map((v): Highlight => {
          const element = $(v);
          const id = element.find(".poster-media a").first().attr("href") ?? "";
          const title = element.find("img").first().attr("alt") ?? "";
          const cover =
            this.source.baseUrl + element.find("img").first().attr("data-src");

          return { id, title, cover };
        });
    const recentlyAdded = parseLargeTiles(
      "#router-view > div > div:nth-child(8) > div > ul > li"
    );
    const adminChoice = parseLargeTiles(
      "#router-view > div > div:nth-child(9) > div > ul > li"
    );
    return [
      {
        id: "hot",
        title: "Hot Manga",
        items: hotManga,
      },
      {
        id: "admin",
        title: "Admins Choice",
        items: adminChoice,
      },
      {
        id: "popular",
        title: "Popular Titles",
        items: popularManga,
      },
      {
        id: "new",
        title: "Recently Added",
        items: recentlyAdded,
      },
      {
        id: "latest",
        title: "Latest Updates",
        items: latestManga,
        style: SectionStyle.PADDED_LIST,
      },
    ];
  }
}
