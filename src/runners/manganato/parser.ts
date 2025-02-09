import {
  Chapter,
  ChapterPage,
  Content,
  Highlight,
  Property,
  ReadingMode,
  DirectoryRequest,
  PublicationStatus,
  Tag,
} from "@suwatte/daisuke";
import { CheerioAPI, load } from "cheerio";
import type { Element } from "domhandler";
import moment from "moment";
import { ADULT_IDS, FilterResult } from "./constants";

// HomePage
export const parseHomePageTopSection = ($: CheerioAPI): Highlight[] => {
  const elements = $(".owl-carousel > .item").toArray();

  const highlights: Highlight[] = [];
  for (const element of elements) {
    const cover = $("img", element).attr("src");
    const anchor = $("h3 > a", element);
    const contentId = $(anchor).attr("href")?.split("/").pop();
    const title = $(anchor).attr("title");

    if (!contentId || !cover || !title) continue;

    highlights.push({ id: contentId, title, cover });
  }

  return highlights;
};
export const parseHomePageNewSection = ($: CheerioAPI): Highlight[] => {
  const elements = $(".panel-newest-content > a").toArray();
  const highlights: Highlight[] = [];

  for (const element of elements) {
    const cover = $("img", element).attr("src");
    const contentId = $(element).attr("href")?.split("/").pop();
    const title = $("img", element).attr("alt");

    if (!contentId || !cover || !title) continue;

    highlights.push({ id: contentId, title, cover });
  }

  return highlights;
};
export const parseHomePageLatestSection = ($: CheerioAPI): Highlight[] => {
  const elements = $(
    ".panel-content-homepage > .content-homepage-item"
  ).toArray();
  const highlights: Highlight[] = [];

  for (const element of elements) {
    const cover = $("img", element).attr("src");
    const contentId = $("a.tooltip", element).attr("href")?.split("/").pop();
    const title = $("h3", element).text().trim();

    if (!contentId || !cover || !title) continue;

    highlights.push({ id: contentId, title, cover });
  }

  return highlights;
};

// Search
export const parseSearchRequest = (request: DirectoryRequest<FilterResult>) => {
  const params: Record<string, any> = {
    page: request.page ?? 1,
    orby: request.sort?.id ?? "topview",
    s: "all",
  };

  if (request.query) params.keyw = request.query;
  if (!request.filters) return params;

  if (request.filters.genre) {
    const filter = request.filters.genre;
    if (filter.included)
      params["g_i"] = filter.included.map((v) => `_${v}`).join("");
    if (filter.excluded)
      params["g_e"] = filter.excluded.map((v) => `_${v}`).join("");
  }

  if (request.filters.status) {
    const key = request.filters.status;
    if (key !== "all") params.sts = key;
  }

  return params;
};

export const parseSearchResponse = (html: string) => {
  const $ = load(html);
  const elements = $("iv.search-story-item, div.content-genres-item").toArray();

  const highlights = elements
    .map((v) => mangaFromElement($, v))
    .filter((v) => v.title && v.id && v.cover) as Highlight[];

  return highlights;
};

const mangaFromElement = (
  $: CheerioAPI,
  element: Element,
  urlSelector = "h3 a"
) => {
  const anchor = $(urlSelector, element);
  return {
    id: anchor.attr("href")?.split("/").pop(),
    title: anchor.text().trim(),
    cover: $("img", element).attr("src"),
  };
};

// Content

export const parseContent = (html: string, contentId: string): Content => {
  const $ = load(html);

  const doc = $("div.manga-info-top, div.panel-story-info");

  const title = $("h1, h2", doc).first().text().trim();

  if (!title)
    throw new Error(
      "Parsing Error\nFailed to parse title, this may indicate an invalid path"
    );

  const summary = $("div#noidungm, div#panel-story-info-description", doc)
    .text()
    .replace("Description :", "")
    .trim();

  const additionalTitles = $(
    ".story-alternative, tr:has(.info-alternative) h2",
    doc
  )
    .text()
    .split(" ; ");

  const cover = $("div.manga-info-pic img, span.info-image img", doc).attr(
    "src"
  );
  if (!cover) throw new Error("Parsing Error, Thumbnail URL not found");

  const status = parseStatus($("td:contains(Status) + td", doc).text());

  const genres = $("td:contains(Genre) + td a", doc)
    .toArray()
    .map((elem) => ({
      title: $(elem).text(),
      id: $(elem).attr("href")?.split("-").pop(),
    }));
  const properties: Property[] = [
    {
      id: "genre",
      title: "Genres",
      tags: genres
        .filter((v) => v.id)
        .map((v) => ({
          ...v,
          nsfw: ADULT_IDS.includes(v.id ?? ""),
        })) as Tag[],
    },
  ];
  const nsfw = properties[0].tags.some((v) => v.nsfw);
  const recommendedPanelMode = properties[0].tags.some((v) => v.id === "40")
    ? ReadingMode.WEBTOON
    : ReadingMode.PAGED_MANGA;
  return {
    summary,
    title,
    additionalTitles,
    cover,
    status,
    isNSFW: nsfw,
    recommendedPanelMode,
    webUrl: `https://chapmanganato.com/${contentId}`,
    chapters: parseChapters(html),
  };
};

const parseStatus = (text?: string) => {
  if (!text) return;
  switch (text) {
    case "Ongoing":
      return PublicationStatus.ONGOING;
    case "Completed":
      return PublicationStatus.COMPLETED;
  }
};

// Parse Chapters
export const parseChapters = (html: string): Chapter[] => {
  const $ = load(html);

  const chapters: Chapter[] = [];
  const chapterElements = $(
    "div.panel-story-chapter-list > ul.row-content-chapter > li"
  ).toArray();

  for (const [index, element] of chapterElements.entries()) {
    const anchor = $(".chapter-name", element);
    const chapterText = anchor.text().trim();
    const chapterId = anchor.attr("href")?.split("/").pop();
    if (!chapterId) continue;
    const webUrl = anchor.attr("href");
    const numStr = chapterText.match(/(?:[Cc]hapter)\s(\d+\.?\d?)/)?.[1];
    if (!numStr || Number.isNaN(numStr)) continue;

    const number = Number(numStr);
    const dateStr = $(".chapter-time", element).attr("title");
    const date = moment(dateStr, "MMM dd,yy").toDate();
    const title = chapterText.split(`${number}: `).pop()?.trim();
    chapters.push({
      title,
      webUrl,
      chapterId,
      number,
      date,
      index,
      language: "en_US",
    });
  }

  return chapters;
};

export const parseChapterData = (html: string) => {
  const pages: ChapterPage[] = [];
  const $ = load(html);
  const elements = $(".container-chapter-reader > img").toArray();
  for (const element of elements) {
    const url = $(element).attr("src");

    if (!url) continue;

    pages.push({
      url,
    });
  }
  return pages;
};
