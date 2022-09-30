import {
  Chapter,
  ChapterData,
  CollectionExcerpt,
  CollectionStyle,
  Content,
  Highlight,
  Property,
  ReadingMode,
  Status,
  Tag,
} from "@suwatte/daisuke";
import { load } from "cheerio";

const BASE_URL = "https://lightnovelreader.org";
export const getExploreCollections = (): CollectionExcerpt[] => {
  return [
    {
      id: "popular",
      title: "Popular Updates",
      subtitle: "Recently Updated Popular Novels",
      style: CollectionStyle.NORMAL,
    },
    {
      id: "top_viewed",
      title: "Most Viewed Novels",
      subtitle: "All Time Most Popular Titles",
      style: CollectionStyle.NORMAL,
    },
    {
      id: "top_bookmarked",
      title: "Top Bookmarked Novels.",
      style: CollectionStyle.NORMAL,
    },
    {
      id: "top_rated",
      title: "Top Rated Novels",
      subtitle: "What others are enjoying.",
      style: CollectionStyle.NORMAL,
    },
    {
      id: "new",
      title: "New Novels",
      subtitle: "Recently added novels",
      style: CollectionStyle.NORMAL,
    },
    {
      id: "latest",
      title: "Latest Updates",
      subtitle:
        "Read the latest updated light, web, chinese and korean novels.",
      style: CollectionStyle.NORMAL,
    },
  ];
};

export const prepId = (from: string): string => {
  return from.trim().replace(`${BASE_URL}/`, "") ?? "";
};
export const parseHomePageSection = (
  data: string,
  key: string
): Highlight[] => {
  const highlights: Highlight[] = [];
  const $ = load(data);
  switch (key) {
    case "new":
    case "popular":
      const selector = $(
        `body > section:nth-child(${
          key == "new" ? "3" : "4"
        }) > div > div > div:nth-child(${
          key == "new" ? "3" : "2"
        }) > div .card-v`
      ).toArray();
      // body > section:nth-child(4) > div > div > div:nth-child(2) > div
      for (const e of selector) {
        const element = $(e);
        const cover = $("img", element).attr("src") ?? "";
        const title = $(".card-v-name", element).text().trim();
        const contentId =
          $(".card-v-name > a", element)
            .attr("href")
            ?.trim()
            .replace(`${BASE_URL}/`, "") ?? "";

        if (!contentId) continue;
        const highlight = {
          contentId,
          cover,
          title,
        };
        highlights.push(highlight);
      }
      //
      break;
    case "latest":
      const latestSelector = $(
        "body > section:nth-child(5) > div > div > div.col-md-7.col-lg-8.col-xl-9 > div .card-box"
      ).toArray();

      for (const e of latestSelector) {
        const elem = $(e);
        const cover = $("img", elem).attr("src") ?? "";
        const titleElem = $(".card-box-name", elem);
        const title = titleElem.attr("title") ?? "Failed To Parse";
        const contentId =
          $("a", titleElem).attr("href")?.trim().replace(`${BASE_URL}/`, "") ??
          "";
        if (!contentId) continue;

        const highlight = {
          contentId,
          title,
          cover,
        };

        highlights.push(highlight);
      }
      break;
  }
  return highlights;
};

export const parseContent = (data: string, contentId: string): Content => {
  const $ = load(data);

  const title = $(".novel-title").text() ?? "";

  if (!title) throw "Failed To Parse";

  const imageUrl = $(".novels-detail-left img").attr("src") ?? "";
  const rows = $(".novels-detail-right li").toArray();
  const additionalTitles: string[] = [];
  const creators: string[] = [];
  let status = Status.UNKNOWN;

  const TAG_URL = "https://lightnovelreader.org/category";
  const properties: Property[] = [];
  const tags: Tag[] = [];
  for (const row of rows) {
    const dataElem = $(".novels-detail-right-in-right", row);
    const label = $(".novels-detail-right-in-left", row)
      .text()
      .trim()
      .replace(":", "");

    switch (label) {
      case "Alternative Names":
        additionalTitles.push(dataElem.text().trim());
        break;
      case "Status":
        if (dataElem.text().toLowerCase().includes("ongoing")) {
          status = Status.ONGOING;
        } else {
          status = Status.COMPLETED;
        }
        break;
      case "Authors(s)":
      case "Artists(s)":
        if (!dataElem.text().trim().includes("N/A")) {
          creators.push(dataElem.text().trim());
        }
        break;
      case "Genres":
        for (const tag of $("a", dataElem).toArray()) {
          tags.push({
            id: $(tag).text().replace(TAG_URL, ""),
            label: $(tag).text().trim(),
            adultContent: false,
          });
        }
        break;
    }
  }
  const summary = $(
    "body > section:nth-child(4) > div > div > div.col-12.col-xl-9 > div > div:nth-child(5) > div"
  )
    .text()
    .trim();
  return {
    contentId,
    properties,
    summary,
    status,
    title,
    additionalTitles,
    cover: imageUrl,
    creators,
    adultContent: false,
    webUrl: `${BASE_URL}/${contentId}`,
    recommendedReadingMode: ReadingMode.NOVEL,
    chapters: parseChapters(data, contentId),
  };
};

export const parseChapters = (data: string, contentId: string): Chapter[] => {
  const $ = load(data);
  const chapters: Chapter[] = [];
  let index = 0;
  for (let e of $(".novels-detail-chapters li a")) {
    const chapter = $(e);
    const chapterText = chapter.text();
    const chapterId = chapter.attr("href")?.split("/").pop();

    if (!chapterId) continue;
    chapters.push({
      chapterId,
      contentId,
      number: isNaN(
        parseFloat(chapterText.substring(chapterText.indexOf("CH") + 3) ?? "0")
      )
        ? 0
        : parseFloat(
            chapterText.substring(chapterText.indexOf("CH") + 3) ?? "0"
          ),
      index,
      title: chapter.text().replace("CH ", "Chapter ").trim(),
      language: "GB",
      date: new Date(),
      webUrl: chapter.attr("href") ?? "",
    });

    index++;
  }
  return chapters;
};

export const parseChapterText = (
  html: string,
  contentId: string,
  chapterId: string
): ChapterData => {
  const $ = load(html);
  const nodes = $("#chapterText > p");
  let text = "";
  for (const element of nodes.toArray()) {
    const html = $.html(element);
    const t = $(element).text().trim();
    if (t) {
      text += html;
    }
  }

  return {
    chapterId,
    contentId,
    text,
  };
};
