import { load } from "cheerio";
import {
  Generate,
  Highlight,
  PageSection,
  SectionStyle,
} from "@suwatte/daisuke";
import { TachiParsedHttpSource } from "../../template/tachiyomi";

export const getHomepage = async (
  source: TachiParsedHttpSource
): Promise<PageSection[]> => {
  const url = source.baseUrl + "/home";
  const { data: html } = await source.client.get(url);

  const $ = load(html);

  const featured = $(".deslide-wrap .swiper-wrapper .swiper-slide")
    .toArray()
    .map((v) => {
      const element = $(v);

      const id = element.find(".deslide-cover").attr("href") ?? "";
      const cover = element.find("img").first().attr("src") ?? "";
      const title = element.find("img").first().attr("alt") ?? "";
      return Generate<Highlight>({ id, cover, title });
    });

  const trending = $(".trending-list .swiper-wrapper .swiper-slide")
    .toArray()
    .map((v) => {
      const element = $(v);
      const id = element.find(".link-mask").first().attr("href") ?? "";
      const title = element.find("img").first().attr("alt") ?? "";
      const cover = element.find("img").first().attr("src") ?? "";
      return Generate<Highlight>({ id, cover, title });
    });

  const recommended = $("#manga-featured .swiper-wrapper .swiper-slide")
    .toArray()
    .map((v) => {
      const element = $(v);
      const id = element.find(".link-mask").first().attr("href") ?? "";
      const title = element.find("img").first().attr("alt") ?? "";
      const cover = element.find("img").first().attr("src") ?? "";
      return Generate<Highlight>({ id, cover, title });
    });

  const latest = $(`#latest-chap ${source.searchMangaSelector()}`)
    .toArray()
    .map((v) => source.searchMangaFromElement($(v)));

  const parseChart = (selector: string) =>
    $(`${selector} .ulclear .manga-poster`)
      .toArray()
      .map((v) => {
        const element = $(v);
        const id = element.attr("href") ?? "";
        const title = element.find("img").first().attr("alt") ?? "";
        const cover = element.find("img").first().attr("src") ?? "";
        return Generate<Highlight>({ id, cover, title });
      });

  const topViewedDaily = parseChart("#chart-today");
  const topViewedWeekly = parseChart("#chart-week");
  const topViewedMonthly = parseChart("#chart-month");

  return [
    {
      id: "featured",
      title: "Featured Titles",
      items: featured,
    },
    {
      id: "trending",
      title: "Trending Titles",
      items: trending,
      style: SectionStyle.INFO,
    },
    {
      id: "recommended",
      title: "Recommended Titles",
      items: recommended,
    },
    {
      id: "top_daily",
      title: "Top Daily",
      items: topViewedDaily,
      style: SectionStyle.INFO,
    },
    {
      id: "top_weekly",
      title: "Week's Delight",
      items: topViewedWeekly,
    },
    {
      id: "top_monthly",
      title: "Most Viewed This Month",
      items: topViewedMonthly,
      style: SectionStyle.INFO,
    },
    {
      id: "latest",
      title: "Latest Updates",
      items: latest,
      style: SectionStyle.PADDED_LIST,
    },
  ];
};
