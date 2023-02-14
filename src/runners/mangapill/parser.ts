import {
  Chapter,
  ChapterData,
  Content,
  Highlight,
  ReadingMode,
  Status,
} from "@suwatte/daisuke";
import { load } from "cheerio";

const SEARCH_MANGA_SELECTOR = ".grid > div:not([class])";
export const parseSearchResults = (html: string) => {
  const $ = load(html);

  const elements = $(SEARCH_MANGA_SELECTOR).toArray();
  const results: Highlight[] = [];
  elements.forEach((element) => {
    const cover = $("img", element).attr("data-src");
    const title = $("div a ", element).text().trim();
    const contentId = $("a[href^='/manga/']", element)
      .attr("href")
      ?.split("/")
      .at(-2);

    if (!cover || !title || !contentId) return;

    results.push({ cover, title, contentId });
  });

  return results;
};

export const parseContent = (html: string, contentId: string): Content => {
  const $ = load(html);

  const genres = $("a[href*=genre]")
    .toArray()
    .map((elem) => $(elem).text());
  const status = parseStatus(
    $(
      "div.container > div:first-child > div:last-child > div:nth-child(3) > div:nth-child(2) > div"
    ).text()
  );
  const summary = $(
    "div.container > div:first-child > div:last-child > div:nth-child(2) > p"
  ).text();
  const cover = $(
    "div.container > div:first-child > div:first-child > img"
  ).attr("data-src");
  const title = $(".lazy").attr("alt")?.trim();
  const webUrl = `https://mangapill.com/manga/${contentId}`;
  const adultContent = $(".alert-warning").text().includes("Mature");
  const type = $(".grid.grid-cols-1.gap-3.mb-3 div:first-child div")
    .text()
    .toLowerCase();
  const recommendedReadingMode =
    type == "manhwa" ? ReadingMode.VERTICAL : ReadingMode.PAGED_MANGA;

  if (!title || !cover)
    throw new Error("Invalid Parse, Missing Either the Title or the Thumbnail");
  return {
    contentId,
    title,
    cover,
    summary,
    webUrl,
    adultContent,
    recommendedReadingMode,
    status,
    properties: [
      {
        id: "genre",
        label: "Genres",
        tags: genres.map((v) => ({ id: v, label: v })),
      },
    ],
    chapters: parseChapters(html, contentId),
  };
};

export const parseStatus = (str: string) => {
  switch (str) {
    case "publishing":
      return Status.ONGOING;
    case "finished":
      return Status.COMPLETED;
    case "on hiatus":
      return Status.HIATUS;
    case "discontinued":
      return Status.CANCELLED;
  }
};

export const parseChapters = (html: string, contentId: string): Chapter[] => {
  const $ = load(html);
  const elements = $("#chapters > div > a").toArray();

  const chapters: Chapter[] = [];
  for (const [index, element] of elements.entries()) {
    const chapterId = $(element).attr("href");

    const title = $(element).text();
    const date = new Date();
    const language = "en_US";
    const numStr = chapterId?.split("-").pop();
    if (!chapterId || !numStr || Number.isNaN(numStr)) continue;
    const number = Number(numStr);
    chapters.push({
      contentId,
      chapterId,
      index,
      date,
      title,
      language,
      number,
    });
  }
  return chapters;
};

export const parseChapterData = (
  html: string,
  chapterId: string,
  contentId: string
): ChapterData => {
  const $ = load(html);
  const pages = $("picture img")
    .toArray()
    .map((elem) => {
      return { url: $(elem).attr("data-src") ?? "" };
    });

  return { chapterId, contentId, pages };
};
