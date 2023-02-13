import {
  Chapter,
  ChapterPage,
  CollectionStyle,
  Content,
  Highlight,
  HighlightCollection,
  Property,
  Status,
} from "@suwatte/daisuke";
import { AnyNode, Cheerio, load } from "cheerio";

export class Parser {
  homepage: string = "";

  parseHomePageSection(key: string, data?: string): Highlight[] {
    const highlights: Highlight[] = [];
    let selector = "";
    const $ = load(data ?? this.homepage);
    let elements: Cheerio<AnyNode>;
    switch (key) {
      case "popular_today":
        selector = `.card:contains("Popular Today") .row > div`;
        elements = $(selector);
        for (const element of elements) {
          const id = this.parseIdFromLink(
            $(" a:nth-of-type(1)", element).attr("href") ?? ""
          );
          if (!id) continue;
          const title = $("h6", element).text();
          const cover = $("img", element).attr("data-src");
          if (!title || !cover) continue;
          highlights.push({ contentId: id, title, cover });
        }
        break;
      case "ymal":
        selector = `.card:contains("You may also like") .row > div`;
        elements = $(selector);
        for (const element of elements) {
          const id = this.parseIdFromLink(
            $(" a:nth-of-type(1)", element).attr("href") ?? ""
          );
          if (!id) continue;
          const title = $(".badge", element)
            .attr("data-original-title")
            ?.match(/<p class='text-bold-600 text-left'>(.*)</)?.[1];
          const cover = $("img", element).attr("data-src");
          if (!title || !cover) continue;
          highlights.push({ contentId: id, title, cover });
        }
        break;
      case "ongoing_updates":
        selector = `.card:contains("Ongoing updates") .row > div`;
        elements = $(selector);
        for (const element of elements) {
          const id = this.parseIdFromLink(
            $(" a:nth-of-type(1)", element).attr("href") ?? ""
          );
          if (!id) continue;
          const title = $(".badge", element)
            .attr("data-original-title")
            ?.match(/<p class='text-bold-600 text-left'>(.*)</)?.[1];
          const cover = $("img", element).attr("data-src");
          if (!title || !cover) continue;
          highlights.push({ contentId: id, title, cover });
        }
        break;
      case "c_a_o":
        selector = `.card:contains("Completed & One-shot") .card-body > div`;
        elements = $(selector);
        for (const element of elements) {
          const id = this.parseIdFromLink(
            $(" a:nth-of-type(1)", element).attr("href") ?? ""
          );
          if (!id) continue;
          const title = $(".media-body > p", element).first().text().trim();
          const cover = $("img", element).attr("data-src");
          if (!title || !cover) continue;
          highlights.push({ contentId: id, title, cover });
        }
        break;
      case "most_popular":
        selector = `.card:contains("Most Popular") .row > div`;
        elements = $(selector);
        for (const element of elements) {
          const id = this.parseIdFromLink(
            $(" a:nth-of-type(1)", element).attr("href") ?? ""
          );
          if (!id) continue;
          const title = $(".badge", element)
            .attr("data-original-title")
            ?.match(/<p class='text-bold-600 text-left'>(.*)</)?.[1];
          const cover = $("img", element).attr("data-src");
          if (!title || !cover) continue;
          highlights.push({ contentId: id, title, cover });
        }
        break;
      case "latest":
        selector = `.card:contains("Updates") .row > .col-xl-2`;
        elements = $(selector);
        for (const element of elements) {
          const id = this.parseIdFromLink(
            $(" a:nth-of-type(1)", element).attr("href") ?? ""
          );
          if (!id) continue;
          const title = $("p", element).first().text().trim();
          const cover = $("img", element).attr("data-src");
          if (!title || !cover) continue;
          highlights.push({ contentId: id, title, cover });
        }
        break;
    }
    return highlights;
  }

  parseIdFromLink(str: string) {
    return str.match(/detail\/(\d+)\//)?.[1];
  }

  // Content
  parseContent(html: string, id: string): Content {
    const $ = load(html);
    const body = $("div.card-body > div.mb-2");
    const cover = $("img", body).attr("data-src");
    const summary = $("#comic-desc").text().trim();
    const title = $("h1", body).first().text().trim();
    if (!cover)
      throw new Error(
        "cover not found.\nThis failing might indicate a further selector issue."
      );
    const status = this.parseStatus(
      $("p span.mr-1 strong", body).text().trim()
    );
    const views = $("p span.danger strong").text().trim();

    const properties: Property[] = [];

    // Genres
    properties.push({ id: "tags", label: "Tags", tags: [] });
    for (const element of $("p:contains(Genre) ~ div button")) {
      const value = $(element).attr("value");
      if (!value) continue;
      properties[0].tags.push({
        id: value,
        label: $(element).text().trim(),
        adultContent: false,
      });
    }
    // Publisher

    const publisherElement = $("p:contains(Publisher) + div button", body);
    if (!publisherElement.attr("value"))
      throw new Error("Failed to parse publisher");
    properties.push({ id: "publisher", label: "Publisher", tags: [] });

    properties[1].tags.push({
      id: publisherElement.attr("value") ?? "",
      label: publisherElement.text().trim(),
      adultContent: false,
    });
    // Credits
    properties.push({ id: "creators", label: "Credits", tags: [] });

    // Writers
    for (const element of $("thead:contains(Writer) + tbody button")) {
      const value = $(element).attr("value");
      if (!value) continue;
      properties[1].tags.push({
        id: value,
        label: $(element).text().trim(),
        adultContent: false,
      });
    }

    // Artists
    for (const element of $("thead:contains(Artist) + tbody button")) {
      const value = $(element).attr("value");
      if (!value) continue;
      properties[1].tags.push({
        id: `artist:${value}`,
        label: $(element).text().trim(),
        adultContent: false,
      });
    }

    // Creators
    const creators = properties[1].tags.map((v) => v.label);
    const included: HighlightCollection = {
      id: "ymal",
      title: "You May Also Like",
      highlights: this.parseHomePageSection("ymal", html),
      style: CollectionStyle.NORMAL,
    };
    return {
      contentId: id,
      title,
      cover,
      summary,
      status,
      properties,
      creators,
      stats: {
        views: Number(views) ?? 1,
      },
      includedCollections: [included],
      chapters: this.parseChapters(html, id),
    };
  }

  private parseStatus(str: string): Status {
    let status = Status.UNKNOWN;

    switch (str.toLowerCase()) {
      case "completed":
        return Status.COMPLETED;
      case "ongoing":
        return Status.ONGOING;
    }
    return status;
  }

  // Chapters
  parseChapters(html: string, contentId: string) {
    const $ = load(html);
    const selector = "div.card-body > .table-responsive tr a";
    const elements = $(selector).toArray().reverse(); // Reverse For simplicity
    const chapters: Chapter[] = [];
    let idx = 0;
    for (const element of elements) {
      const title = $(element).text().trim();
      const url = $(element).attr("href");

      if (!title || !url) throw new Error("Chapter Element Cannot be parsed");
      const [, chapterId] = url.match(/pbp\/(\d+)\/(\d+)\/\/(\d+)/) ?? [];
      const [, numberStr] = title.match(/(\d+)/) || [];
      const number = Number(numberStr);
      if (!chapterId || Number.isNaN(number))
        throw new Error("Chapter Element Cannot be parsed");

      chapters.push({
        index: idx,
        chapterId,
        contentId,
        title,
        number,
        date: new Date(),
        language: "en_US",
      });
      idx++;
    }
    return chapters;
  }

  // Chapter Data

  parseChapterData(html: string) {
    const $ = load(html);
    const elements = $(".swiper-wrapper .swiper-slide img").toArray();
    const urls = elements
      .map((v) => $(v).attr("src")?.trim())
      .filter((a) => a)
      .map((url) => ({ url }));
    return urls;
  }

  parseSearchResults(html: string) {
    const $ = load(html);

    const items = $("div.shadow-sm").toArray();
    const highlights: Highlight[] = [];
    for (const item of items) {
      const title = $("p", item).text().trim();
      const cover = $("img", item).attr("data-src");
      const link = $("a", item).attr("href");
      if (!link) continue;
      const contentId = this.parseIdFromLink(link);
      if (!contentId || !cover) continue;

      highlights.push({
        title,
        cover,
        contentId,
      });
    }

    const isLastPage = $("li.page-item.next a").length == 0;
    return { isLastPage, highlights };
  }
}
