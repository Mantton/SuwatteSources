import { Content, Highlight, Property, Status, Tag } from "@suwatte/daisuke";
import { load } from "cheerio";
import { trim } from "lodash";
import { TAG_PREFIX } from "./constants";
import { AnchorTag, Context } from "./types";
import {
  generateAnchorTag,
  imageFromElement,
  notUpdating,
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
    const title = $(ctx.titleSelector).first()?.text().trim();
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
    let summaryNode = $(ctx.summarySelector);
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

    console.log(genres);

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
    return {
      contentId,
      title,
      cover,
      summary: summary ? summary : undefined,
      creators,
      status,
      adultContent,
      properties,
      additionalTitles:
        additionalTitles.length != 0 ? additionalTitles : undefined,
    };
  }
}
