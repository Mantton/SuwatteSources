import {
  Chapter,
  ChapterPage,
  Content,
  Highlight,
  Property,
  Provider,
  ProviderLinkType,
  PublicationStatus,
  ReadingMode,
} from "@suwatte/daisuke";
import { load } from "cheerio";
import type { Element } from "domhandler";

import { decode, encode } from "he";
import moment from "moment";
import { getAllGenreTags } from "./constants";
import { AES, enc } from "crypto-js";
export class Parser {
  parsePagedResponse(html: string) {
    const ITEMS_SELECTOR = "div#series-list div.col";
    const $ = load(html);
    const items = $(ITEMS_SELECTOR).toArray();

    const parseElement = (element: Element): Highlight => {
      const item = $("a.item-cover", element);
      const imgElem = $("img", item);
      const cover =
        imgElem.attr("abs:src") ??
        imgElem.attr("src") ??
        imgElem.attr("data-src");
      const title = decode($("a.item-title", element).text().trim());
      const contentId = item
        .attr("href")
        ?.trim()
        .match(/series\/(\d+)/)?.[1];
      if (!title || !cover || !contentId) throw "Failed to Parse";
      return { id: contentId, cover, title };
    };
    const highlights = items.map(parseElement);
    return highlights;
  }

  parseContent(html: string, contentId: string): Content {
    const $ = load(html);
    const infoElement = $("div#mainer div.container-fluid");

    const textFromInfo = (str: string) => {
      return $(`div.attr-item:contains(${str}) span`, infoElement)
        .text()
        .trim();
    };
    const workStatus = textFromInfo("Original work");

    const uploadStatus = textFromInfo("Upload status");
    const title = decode($("h3", infoElement).text().trim());
    const author = textFromInfo("Authors:");
    const artist = textFromInfo("Artists:");
    const summary = (
      $("div.limit-html", infoElement).text() +
      "\n" +
      $(".episode-list > .alert-warning").text().trim()
    ).trim();
    const imgElem = $("div.attr-cover img");
    const cover = imgElem.attr("abs:src") ?? imgElem.attr("src") ?? "";
    let status: PublicationStatus | undefined;

    if (workStatus) {
      if (workStatus.includes("Ongoing")) status = PublicationStatus.ONGOING;
      if (workStatus.includes("Cancelled"))
        status = PublicationStatus.CANCELLED;
      if (workStatus.includes("Hiatus")) status = PublicationStatus.HIATUS;
      if (workStatus.includes("Completed")) {
        if (uploadStatus?.includes("Ongoing"))
          status = PublicationStatus.ONGOING;
        else status = PublicationStatus.COMPLETED;
      }
    }

    // TODO: Rank

    // Reading Mode
    const direction = textFromInfo("Read direction");
    let recommendedReadingMode = ReadingMode.PAGED_MANGA;
    if (direction === "Top to Bottom")
      recommendedReadingMode = ReadingMode.WEBTOON;
    else if (direction === "Left to Right")
      recommendedReadingMode = ReadingMode.PAGED_COMIC;

    // Genres
    const selected = textFromInfo("Genres:")
      ?.split(", ")
      .map((v) => v.trim());
    const tags = getAllGenreTags().filter((v) => selected.includes(v.title));
    const adultContent = tags.some((v) => v.nsfw);
    const properties: Property[] = [];
    properties.push({
      id: "genres",
      title: "Genres",
      tags,
    });

    // Creators
    properties.push({
      id: "creators",
      title: "Credits",
      tags: [artist, author].map((v) => ({
        id: encode(v),
        title: v,
        nsfw: false,
      })),
    });

    const chapters = this.parseChapters(html);

    return {
      title,
      cover,
      summary,
      status,
      creators: [author, artist],
      recommendedPanelMode: recommendedReadingMode,
      properties,
      isNSFW: adultContent,
      chapters,
      webUrl: `https://bato.to/series/${contentId}`,
    };
  }

  parseChapters(html: string) {
    const $ = load(html);

    const listSelector = $("div.main div.p-2").toArray();
    const chapters: Chapter[] = [];
    let index = 0;
    for (const element of listSelector) {
      const urlElement = $("a.chapt", element);
      const chapterId = $(urlElement).attr("href")?.trim().split("/").pop();

      if (!chapterId) continue;

      const group = $("div.extra > a:not(.ps-3)", element).first();
      const time = $("div.extra > i.ps-3", element).text().trim();
      let title: string | undefined = $("span", urlElement)
        ?.text()
        .trim()
        .replace(": ", "");

      if (!title) title = undefined;
      const chapterText = $("b", urlElement)
        .text()
        .trim()
        .split(/Chapter|Episode|Ch\./);

      let volume: number | undefined = undefined;
      if (chapterText[0] && chapterText[0].includes("Vol")) {
        const volStr = chapterText[0]
          .replace(/Volume|Vol\./, "")
          .trim()
          .match(/\d+/)?.[0];
        volume = Number(volStr);
        if (!volume) volume = undefined;
      }
      // TODO: Better Special Chapter Handling
      let number = -1;
      const strNum = chapterText[1]?.match(/(\d+(\.\d+)?)/)?.[1];
      if (strNum) {
        number = Number(strNum) ?? -1;
        if (!number) number = -1;
      } else {
        title = chapterText[0];
      }

      const providers: Provider[] = [];
      if (group) {
        const name = group.text().trim();
        const link = group.attr("href");
        if (name) {
          providers.push({
            id: name,
            name,
            links: [
              {
                type: ProviderLinkType.WEBSITE,
                url: (link && `https://bato.to${link}`) ?? "",
              },
            ],
          });
        }
      }
      const flag = $(".item-flag").attr("data-lang");
      const language = flag ? `${flag}_${flag.toUpperCase()}` : "en_GB";
      const date = this.parseDate(time);
      chapters.push({
        chapterId,
        number,
        volume,
        date,
        index,
        providers,
        title,
        language,
      });
      index++;
    }

    return chapters;
  }

  parseDate(str: string) {
    const value = Number(str.split(" ")[0]);
    const current = moment();

    if (!value) return current.toDate();

    const low = str.toLowerCase();
    if (low.includes("sec")) return current.subtract(value, "seconds").toDate();
    else if (low.includes("min"))
      return current.subtract(value, "minutes").toDate();
    else if (low.includes("day"))
      return current.subtract(value, "days").toDate();
    else if (low.includes("week"))
      return current.subtract(value, "weeks").toDate();
    else if (low.includes("month"))
      return current.subtract(value, "months").toDate();
    else if (low.includes("year"))
      return current.subtract(value, "years").toDate();

    return current.toDate();
  }

  parsePages(html: string): ChapterPage[] {
    const $ = load(html);
    const script = $("script:contains('const batoWord =')")?.html();

    if (!script) throw new Error("Could not find script with image data.");

    const imgHttpLisString = script
      .split("const imgHttps = ")
      .pop()
      ?.split(";")?.[0]
      .trim();

    if (!imgHttpLisString) throw new Error("Image List Not Found.");

    const imgHttpList: string[] = JSON.parse(imgHttpLisString);
    const batoWord = script
      .split("const batoWord = ")
      .pop()
      ?.split(";")?.[0]
      .replace(/"/g, "");
    const batoPass = script.split("const batoPass = ").pop()?.split(";")?.[0];
    if (!batoWord || !batoPass || !imgHttpList || imgHttpList.length == 0)
      throw new Error("Bad State");

    const evaluatedPass = eval(batoPass).toString();
    const imgAccListString = AES.decrypt(batoWord, evaluatedPass).toString(
      enc.Utf8
    );

    const imgAccList: string[] = JSON.parse(imgAccListString);
    const urls = imgHttpList.map((v, i) => `${v}?${imgAccList[i]}`);

    return urls.map((url) => ({ url }));
  }
}
