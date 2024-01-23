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

const info: RunnerInfo = {
  id: "asurascans",
  name: "Asura Scans",
  version: 0.2,
  thumbnail: "asurascan.png",
};

export class Target extends TachiBuilder implements PageLinkResolver {
  constructor() {
    super(info, Template);
  }

  async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
    if (link.id !== "home") throw new Error("Accessing invalid page");
    return this.getHomePage();
  }

  resolvePageSection(_: PageLink, __: string): Promise<ResolvedPageSection> {
    throw new Error("Method not used");
  }

  private async getHomePage(): Promise<PageSection[]> {
    const client = this.source.client;
    const { data: response } = await client.get(this.source.baseUrl);
    const $ = load(response);

    const cleanImage = (val: string) =>
      val.match(/(https:\/\/asuratoon\.com\/[^']+)/)?.[1] ?? val;

    const trendingWeekly = $(".slide-item")
      .toArray()
      .map((val): Highlight => {
        const element = $(val);

        const cover = cleanImage(element.find("img").attr("src") ?? "");
        const info = element.find(".title > .ellipsis");
        const title = info.text().trim();
        const id = this.source.getUrlWithoutDomain(
          info.find("a").attr("href") ?? ""
        );

        const genres = $(".extra-category > a")
          .toArray()
          .map((v) => $(v).text().trim())
          .join(", ");

        return { id, title, cover, info: [genres] };
      });

    const trendingDaily = $(".listupd > .bs")
      .toArray()
      .map((val): Highlight => {
        const element = $(val);
        const id = this.source.getUrlWithoutDomain(
          element.find("a").attr("href") ?? ""
        );

        const title = element.find(".tt").text().trim();
        const cover = cleanImage(element.find("img").attr("src") ?? "");

        return { id, title, cover };
      });

    const parsePopList = (selector: string) =>
      $(selector)
        .toArray()
        .map((val): Highlight => {
          const element = $(val);

          const id = this.source.getUrlWithoutDomain(
            element.find("a.series").attr("href") ?? ""
          );

          const cover = cleanImage(
            element.find(".series img").attr("src") ?? ""
          );
          const title = element.find("h2").text().trim();
          const genres = element
            .find("span > a")
            .toArray()
            .map((v) => $(v).text().trim())
            .join(", ");
          return { id, cover, title, info: [genres] };
        });

    const popularWeekly = parsePopList(".wpop-weekly li");
    const popularMonthly = parsePopList(".wpop-monthly li");
    const popularAllTime = parsePopList(".wpop-alltime li");

    const latestUpdates = $(".listupd .utao")
      .toArray()
      .map((val): Highlight => {
        const element = $(val);
        const id = this.source.getUrlWithoutDomain(
          element.find("a.series").attr("href") ?? ""
        );

        const title = element.find("h4").text().trim();
        const cover = element.find(".imgu img").attr("src") ?? "";
        const latestChapter = `${element
          .find("ul > li > a")
          .first()
          .text()
          .trim()} • ${element.find("ul > li > span").first().text().trim()}`;

        return {
          id,
          title,
          cover,
          info: [latestChapter],
        };
      });

    return [
      {
        id: "trending_weekly",
        title: "Trending Weekly",
        items: trendingWeekly,
        style: SectionStyle.GALLERY,
      },
      {
        id: "trending_daily",
        title: "Trending Daily",
        items: trendingDaily,
      },
      {
        id: "popular_weekly",
        title: "Popular Titles This Week",
        items: popularWeekly,
      },
      {
        id: "popular_monthly",
        title: "Monthly Picks",
        items: popularMonthly,
        style: SectionStyle.INFO,
      },
      {
        id: "popular_at",
        title: "Must Reads",
        subtitle: "All time favorites, binge-worthy, thrilling stories",
        items: popularAllTime,
        style: SectionStyle.GALLERY,
      },
      {
        id: "latest",
        title: "Latest Updates",
        items: latestUpdates,
        style: SectionStyle.PADDED_LIST,
        viewMoreLink: { request: { page: 1, sort: { id: "latest" } } },
      },
    ];
  }
}
