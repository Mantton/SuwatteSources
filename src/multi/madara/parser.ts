import {
  Chapter,
  ChapterData,
  ChapterPage,
  CollectionStyle,
  Content,
  Highlight,
  HighlightCollection,
  Property,
  ReadingMode,
  Status,
  Tag,
} from "@suwatte/daisuke";
import { imageFromElement } from "./utils";
import moment from "moment";
import { decode } from "he";
import { Madara } from ".";
import { load } from "cheerio";

export namespace Parser {
  export function parseAjaxDirectoryResponse(
    response: string,
    baseUrl: string,
    traversal: string
  ) {
    const highlights: Highlight[] = [];
    const $ = load(response);

    for (const element of $(".page-item-detail")) {
      const title = $("a", $("h3.h5", element)).text();
      const id = $("a", $("h3.h5", element))
        .attr("href")
        ?.replace(`${baseUrl}/${traversal}/`, "")
        .replace(/\/$/, "");

      if (!title || !id) {
        continue;
      }

      const imageElement = $("img", element);
      const imageURL = imageFromElement(imageElement);

      highlights.push({
        contentId: id,
        title,
        cover: imageURL,
      });
    }
    return highlights;
  }

  export function parseTags(data: string, searchPage: boolean): Property[] {
    const $ = load(data);
    const tags: Tag[] = [];
    if (searchPage) {
      for (const obj of $(".checkbox-group div label").toArray()) {
        const label = $(obj).text().trim();
        const id = $(obj).attr("for") ?? label;
        tags.push({ label, id, adultContent: false });
      }
    } else {
      for (const obj of $(
        ".menu-item-object-wp-manga-genre a",
        $(".second-menu")
      ).toArray()) {
        const label = $(obj).text().trim();
        const id = $(obj).attr("href")?.split("/")[4] ?? label;
        tags.push({ label, id, adultContent: false });
      }
    }

    return [
      {
        id: "genres",
        label: "Genres",
        tags,
      },
    ];
  }

  export function parseContent(
    id: string,
    data: string,
    context: Madara
  ): Content {
    const $ = load(data);

    // Title
    const title = $(context.DETAILS_SELECTOR_TITLE).text().trim();

    // Creators
    const author = $(context.DETAILS_SELECTOR_AUTHOR)
      .first()
      .text()
      .replace("Updating", "");
    const artist = $(context.DETAILS_SELECTOR_ARTIST)
      .first()
      .text()
      .replace("Updating", "");
    const creators: string[] = [];
    if (author) creators.push(author);
    if (artist && !creators.includes(artist)) creators.push(artist);

    // Covers
    const cover = imageFromElement($(context.DETAILS_SELECTOR_THUMBNAIL));

    // Additional Titles
    const summary = $(context.DETAILS_SELECTOR_SUMMARY).text().trim();
    // Additional Titles
    const altNameSelector = $(context.DETAILS_ALT_NAME_SELECTOR)
      .first()
      .text()
      .trim();
    const additionalTitles: string[] = [];
    if (altNameSelector && altNameSelector !== "Updating") {
      additionalTitles.push(...altNameSelector.split(", "));
    }

    // Status
    let status = Status.UNKNOWN;
    const statusSelector = $(context.DETAILS_SELECTOR_STATUS)
      .last()
      .text()
      .trim();

    if (context.COMPLETED_STATUS_LIST.includes(statusSelector))
      status = Status.COMPLETED;
    else if (context.ONGOING_STATUS_LIST.includes(statusSelector))
      status = Status.ONGOING;

    // Adult Content
    let adultContent = context.ADULT_CONTENT_ONLY;

    // Properties
    const tags: Tag[] = [];
    for (const node of $(context.DETAILS_SELECTOR_GENRE)) {
      const element = $(node);
      const id = $(node)
        .attr("href")
        ?.replace(`${context.BASE_URL}/${context.GENRE_TRAVERSAL_PATH}`, "")
        .replaceAll("/", "");

      if (!id) continue;
      const tag: Tag = {
        id,
        adultContent: context.ADULT_SLUGS.includes(id),
        label: element.text().trim(),
      };
      tags.push(tag);
      if (tag.adultContent && !adultContent) adultContent = true;
    }

    const properties = [
      {
        id: "genres",
        label: "Genres",
        tags,
      },
    ];

    // Recommended Reading Mode
    let recommendedReadingMode = ReadingMode.VERTICAL;
    const seriesSelector = $(context.SERIES_TYPE_SELECTOR)
      .first()
      .text()
      .toLowerCase();

    if (seriesSelector && seriesSelector === "manga") {
      recommendedReadingMode = ReadingMode.PAGED_MANGA;
    }
    // Recommended Content
    const relatedContent: Highlight[] = [];
    for (const node of $(context.RECOMMENDED_SELECTOR)) {
      const element = $(node);

      const id = element
        .attr("href")
        ?.replace(`${context.BASE_URL}/${context.CONTENT_TRAVERSAL_PATH}/`, "")
        .replace(/\/$/, "");
      const title = element.attr("title") ?? "";
      if (!id || !title) continue;
      const highlight: Highlight = {
        contentId: id,
        title,
        cover: imageFromElement($("img", element)),
      };

      relatedContent.push(highlight);
    }

    const collection: HighlightCollection = {
      id: "related",
      title: "You might also like",
      highlights: relatedContent,
      style: CollectionStyle.NORMAL,
    };

    // Chapters
    let chapters: Chapter[] | undefined = undefined;
    try {
      chapters = parseChapters(context, id, data);
    } catch (error) {
      console.log("caught error parsing chapters", error);
    }
    // Output
    const content: Content = {
      contentId: id,
      title,
      additionalTitles,
      cover,
      status,
      creators,
      summary,
      adultContent,
      webUrl: `${context.BASE_URL}/${context.CONTENT_TRAVERSAL_PATH}/${id}/`,
      properties,
      recommendedReadingMode,
      includedCollections: [collection],
      chapters,
    };

    return content;
  }

  export function parseChapters(ctx: Madara, contentId: string, data: string) {
    const $ = load(data);
    let index = 0;
    const chapters: Chapter[] = [];
    for (const node of $("li.wp-manga-chapter").toArray()) {
      const elem = $(node);
      const chapterId = ($("a", elem).first().attr("href") || "")
        .replace(
          `${ctx.BASE_URL}/${ctx.CONTENT_TRAVERSAL_PATH}/${contentId}/`,
          ""
        )
        .replace(/\/$/, "");
      const numberString = decode(chapterId)
        .match(/\D*(\d*\-?\d*)\D*$/)
        ?.pop()
        ?.replace(/-/g, ".");
      const number = Number(numberString);
      if (!chapterId || !number) throw "Unable to Parse Chapter identifiers";
      const title = $("a", elem).first().text().trim() ?? "";

      // Chapter Date
      const dateString =
        $(
          "span.chapter-release-date > a, span.chapter-release-date > span.c-new-tag > a",
          elem
        ).attr("title") ??
        $("span.chapter-release-date > i", elem).text().trim();

      const date = dateString ? getChapterDate(dateString) : new Date();

      const chapter: Chapter = {
        chapterId,
        number,
        title,
        date,
        contentId,
        index,
        language: "GB",
        webUrl: $("a", elem).first().attr("href"),
      };
      chapters.push(chapter);
      index++;
    }
    return chapters;
  }

  export function parsePages(
    ctx: Madara,
    contentId: string,
    chapterId: string,
    data: string
  ): ChapterData {
    const $ = load(data);
    const nodes = $(ctx.PAGE_LIST_SELECTOR);
    const pages = nodes
      .toArray()
      .map((node) => imageFromElement($(node)).trim())
      .map((url): ChapterPage => ({ url }));
    return {
      contentId,
      chapterId,
      pages,
    };
  }

  function getChapterDate(str: string) {
    str = str.toLowerCase();
    let mom = moment();
    const number = Number((/\d*/.exec(str) ?? [])[0]);
    if (str.includes("less than") || str.includes("just")) {
      // Do nothing
    } else if (str.includes("year")) {
      mom.subtract(number, "years").toDate();
    } else if (str.includes("month")) {
      mom.subtract(number, "months");
    } else if (str.includes("week")) {
      mom.subtract(number, "weeks");
    } else if (str.includes("yester")) {
      mom.subtract(1, "day");
    } else if (str.includes("day")) {
      mom.subtract(number, "days");
    } else if (str.includes("hour")) {
      mom.subtract(number, "hours");
    } else if (str.includes("minute")) {
      mom.subtract(number, "minutes");
    } else if (str.includes("second")) {
      mom.subtract(number, "seconds");
    } else {
      mom = moment(str);
    }
    return mom.toDate();
  }
}
