import { Content, Highlight } from "@suwatte/daisuke";
import { load } from "cheerio";
import { Context } from "./types";
import { imageFromElement } from "./utils";

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
    const title = $(ctx.titleSelector).first();

    if (!title)
      throw new Error("Title not found\nPotentially incorrect selectors");

    console.log(title);
    throw "not ready";
  }
}
