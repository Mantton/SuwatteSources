/* eslint-disable @typescript-eslint/no-non-null-assertion */
import {
  Chapter,
  ChapterData,
  ChapterPage,
  Content,
  Highlight,
  PagedResult,
  Property,
  ReadingMode,
  Tag,
} from "@suwatte/daisuke";
import { load } from "cheerio";
import { trim } from "lodash";
import { TAG_PREFIX } from "./constants";
import { Context } from "./types";
import {
  generateAnchorTag,
  imageFromElement,
  notUpdating,
  parseDate,
  parseStatus,
} from "./utils";

export class Parser {
  AJAXResponse(ctx: Context, html: string): Highlight[] {
    const highlights: Highlight[] = [];
    const $ = load(html);

    for (const element of $(".page-item-detail")) {
      const title = $("a", $("h3.h5", element)).text();
      const id = $("a", $("h3.h5", element))
        .attr("href")
        ?.replace(`${ctx.baseUrl}/${ctx.contentPath}/`, "")
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

  content(ctx: Context, html: string, contentId: string): Content {
    const $ = load(html);

    // Title
    /**
     * Removes the Text from child elements so we get only the text from the H1 Tag
     * Reference: https://stackoverflow.com/a/8851526
     */
    const title = $(ctx.titleSelector)
      .first()
      ?.clone()
      .children()
      .remove()
      .end()
      .text()
      .trim();
    if (!title)
      throw new Error("Title not found\nPotentially incorrect selectors");

    // Author
    const authors = $(ctx.authorSelector)
      .toArray()
      .map((node) => generateAnchorTag($, node))
      .filter(notUpdating)
      .map(
        (tag): Tag => ({
          id: `${TAG_PREFIX.author}|tag.title.toLowerCase()`,
          label: tag.title,
          adultContent: false,
        })
      );
    // Artists
    const artists = $(ctx.artistSelector)
      .toArray()
      .map((node) => generateAnchorTag($, node))
      .filter(notUpdating)
      .map(
        (tag): Tag => ({
          id: `${TAG_PREFIX.artist}|tag.title.toLowerCase()`,
          label: tag.title,
          adultContent: false,
        })
      );

    // Creators
    const creators = Array.from(
      new Set(authors.concat(artists).map((v) => v.label))
    );

    // Summary
    let summary = "";
    const summaryNode = $(ctx.summarySelector);
    if ($(summaryNode, "p").text().trim()) {
      summary = $(summaryNode, "p")
        .toArray()
        .map((v): string => {
          const elem = $(v);
          return elem.text().replace("<br>", "\n");
        })
        .join("\n\n")
        .trim();
    } else {
      summary = $(ctx.summarySelector).text().trim();
    }

    // Cover
    const coverElem = $(ctx.thumbnailSelector).first();
    const cover = imageFromElement(coverElem);

    // Status
    const statusString = $(ctx.statusSelector).last()?.text().trim() ?? "";
    const status = parseStatus(statusString);

    // Genres
    const genres = $(ctx.genreSelector)
      .toArray()
      .map((node) => generateAnchorTag($, node))
      .map(
        (v): Tag => ({
          id:
            v
              .link!.split("/")
              .filter((v) => v)
              .pop() ?? "",
          label: v.title,
          adultContent: ctx.adultTags.includes(v.title.toLowerCase()),
        })
      )
      .filter((v) => v.id);

    const hashtags = $(ctx.tagSelector)
      .toArray()
      .map((node) => generateAnchorTag($, node))
      .map(
        (v): Tag => ({
          id: `${TAG_PREFIX.hashtag}${
            v
              .link!.split("/")
              .filter((v) => v)
              .pop() ?? ""
          }`,
          label: v.title,
          adultContent: ctx.adultTags.includes(v.title.toLowerCase()),
        })
      )
      .filter((v) => v.id.replace(TAG_PREFIX.hashtag, ""));

    const additionalTitles = $(ctx.alternativeTitlesSelector)
      .first()
      .text()
      .trim()
      .split(";")
      .map(trim);

    const adultContent = genres.some((v) => v.adultContent);

    const properties: Property[] = [
      {
        id: "main",
        label: "Genres",
        tags: genres,
      },
      {
        id: "supporting",
        label: "Tags",
        tags: hashtags,
      },
      {
        id: "creators",
        label: "Credits",
        tags: [
          ...authors.map((v): Tag => ({ ...v, label: `Story By ${v.label}` })),
          ...artists.map((v): Tag => ({ ...v, label: `Art By ${v.label}` })),
        ],
      },
    ];

    const chapters = this.chapters(ctx, html, contentId);
    return {
      contentId,
      title,
      cover,
      summary: summary ? summary : undefined,
      creators,
      status,
      adultContent,
      properties,
      ...(chapters.length > 0 && { chapters }),
      recommendedReadingMode: ReadingMode.VERTICAL,
      additionalTitles:
        additionalTitles.length != 0 ? additionalTitles : undefined,
    };
  }

  chapters(ctx: Context, html: string, contentId: string): Chapter[] {
    const $ = load(html);
    const chapters: Chapter[] = [];
    const nodes = $(ctx.chapterSelector).toArray();
    for (const [index, node] of nodes.entries()) {
      const elem = $(node);

      const id = $("a", elem)
        .first()
        .attr("href")
        ?.replace(`${ctx.baseUrl}/${ctx.contentPath}/${contentId}/`, "")
        .replace(/\/$/, "");

      if (!id) throw new Error("Failed to parse Chapter ID");
      const title = $("a", elem).first().text().trim();

      const numStr = id
        .match(/\D*(\d*-?\d*)\D*$/)
        ?.pop()
        ?.replace(/-/g, ".");
      const number = Number(numStr);
      const dateStr = $(ctx.chapterDateSelector, elem).first().text().trim();
      const date = parseDate(dateStr);

      chapters.push({
        index,
        contentId,
        chapterId: id,
        number,
        date,
        title,
        language: "en_us",
      });
    }

    return chapters;
  }

  chapterData(
    ctx: Context,
    contentId: string,
    chapterId: string,
    html: string
  ): ChapterData {
    const $ = load(html);
    const nodes = $(ctx.imageSelector).toArray();

    const pages: ChapterPage[] = nodes
      .map((node) => imageFromElement($(node)).trim())
      .map((url): ChapterPage => ({ url }));

    return {
      contentId,
      chapterId,
      pages,
    };
  }

  // Parse Genres
  genres(ctx: Context, html: string) {
    const $ = load(html);

    const nodes = $("div.checkbox", "div.checkbox-group").toArray();

    const tags = nodes
      .map((node): Tag => {
        const label = $("label", node).text().trim();
        const id = $("input[type=checkbox]", node).attr("value")?.trim() ?? "";
        const adultContent = ctx.adultTags.includes(label.toLowerCase());
        return { label, id, adultContent };
      })
      .filter((v) => v.id);

    return tags;
  }

  searchResponse(ctx: Context, html: string, page: number): PagedResult {
    const $ = load(html);
    const nodes = $(ctx.searchSelector).toArray();
    const highlights: Highlight[] = nodes.map((node) => {
      const title = $("a", node).attr("title");
      const contentId = $("a", node)
        .attr("href")
        ?.replace(`${ctx.baseUrl}/${ctx.contentPath}/`, "")
        .replace(/\/$/, "");

      if (!title || !contentId) throw "Failed to Parse Search Result";
      const cover = imageFromElement($("img", node));

      return {
        title,
        contentId,
        cover,
      };
    });
    return {
      results: highlights,
      page,
      isLastPage: highlights.length <= (ctx.paginationLimit ?? 30),
    };
  }
}
