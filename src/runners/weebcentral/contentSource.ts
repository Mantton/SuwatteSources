import {
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  Property,
  PublicationStatus,
  ReadingMode,
  Highlight,
  Tag,
  HighlightCollection,
  ChapterPage,
} from "@suwatte/daisuke";
import { HOST_URL } from ".";
import { CheerioAPI, load } from "cheerio";
import type { Element } from "domhandler";
import moment from "moment";
import { ChapterRecognition } from "../../template/tachiyomi";

type MethodOnlyContentSource = Omit<
  ContentSource,
  "info" | "getDirectory" | "getDirectoryConfig"
>;
export const WCContentSource: MethodOnlyContentSource = {
  getContent: async function (contentId: string): Promise<Content> {
    const CLIENT = new NetworkClient();
    const url = HOST_URL + "/series/" + contentId;
    const { data } = await CLIENT.get(url);
    const $ = load(data);
    const content = parseContent($, url);
    return content;
  },

  getChapters: async function (contentId: string): Promise<Chapter[]> {
    const CLIENT = new NetworkClient();
    const url = HOST_URL + "/series/" + contentId + "/full-chapter-list";
    const { data } = await CLIENT.get(url);
    const $ = load(data);
    const chapters = parseChapters($);
    return chapters;
  },

  getChapterData: async function (
    _: string,
    chapterId: string
  ): Promise<ChapterData> {
    const CLIENT = new NetworkClient();
    const url = HOST_URL + "/chapters/" + chapterId + "/images";
    const { data } = await CLIENT.get(url, {
      params: {
        is_prev: "False",
        reading_style: "long_strip",
      },
    });

    const $ = load(data);
    const chapterData = parseChapterData($);
    return chapterData;
  },
};

const parseContent = ($: CheerioAPI, webUrl: string): Content => {
  const LEFT = $("#top > section:nth-child(1) > section:nth-child(1)");
  const RIGHT = $("#top > section:nth-child(1) > section:nth-child(2)");

  const title = $("h1", RIGHT).text().trim();
  const cover = $("img", LEFT).attr("src") ?? "";
  const summary = $("li:has(strong:contains(Description)) > p", RIGHT)
    .text()
    .trim()
    .replace("NOTE: ", "\n\nNOTE: ");
  const additionalTitles = $(
    "li:has(strong:contains(Associated Name)) li",
    RIGHT
  )
    .toArray()
    .map((el) => $(el).text().trim());

  const creators = $("ul > li:has(strong:contains(Author)) > span > a", LEFT)
    .map((_, el) => $(el).text().trim())
    .toArray();

  const status = parseStatus(
    $("ul > li:has(strong:contains(Status)) > a", LEFT).text().trim()
  );

  const genres: Tag[] = $("ul > li:has(strong:contains(Tag)) a", LEFT)
    .toArray()
    .map((el) => {
      const title = $(el).text().trim();
      return {
        title,
        id: title,
      };
    });

  const properties: Property[] = [
    {
      id: "genre",
      title: "Genres",
      tags: genres,
    },
  ];

  const anilistID = $(
    'ul > li:has(strong:contains(Track)) abbr[title="AniList"] a',
    LEFT
  )
    .attr("href")
    ?.match(/https:\/\/anilist\.co\/manga\/(\d+)(?:\/[^\/]*)?\/?/)?.[1];

  const mangaupdatesID = $(
    'ul > li:has(strong:contains(Track)) abbr[title="MangaUpdates"] a',
    LEFT
  )
    .attr("href")
    ?.split("/")
    .at(-1);

  const trackerInfo: Record<string, string> = {};
  if (anilistID) {
    trackerInfo["anilist"] = anilistID;
  }
  if (mangaupdatesID) {
    trackerInfo["mangaupdates"] = mangaupdatesID;
  }

  const recommendedPanelMode = parseReadingMode(
    $("ul > li:has(strong:contains(Type)) a", LEFT).text().trim()
  );

  const recommendations: HighlightCollection = (() => {
    const SELECTOR = ".glide__track li > a";
    const items = $(SELECTOR).toArray();
    const highlights: Highlight[] = items.map((item) => {
      const el = $(item);
      const title = el.text().trim();
      const cover = $("img", el).attr("src") ?? "";
      const id = el.attr("href")?.split("/").at(-2) ?? "";
      return {
        id,
        title,
        cover,
      };
    });

    return {
      id: "recommendations",
      title: `More Like '${title}'`,
      highlights,
    };
  })();

  const collections =
    recommendations.highlights.length != 0 ? [recommendations] : undefined;

  return {
    title,
    additionalTitles,
    recommendedPanelMode,
    status,
    creators,
    cover,
    summary,
    properties,
    collections,
    webUrl,
    trackerInfo,
  };
};

const parseStatus = (status: string): PublicationStatus | undefined => {
  switch (status.toLowerCase()) {
    case "ongoing":
      return PublicationStatus.ONGOING;
    case "complete":
      return PublicationStatus.COMPLETED;
    case "hiatus":
      return PublicationStatus.HIATUS;
    case "canceled":
      return PublicationStatus.CANCELLED;
  }

  return;
};

const parseReadingMode = (mode: string): ReadingMode | undefined => {
  switch (mode.toLowerCase()) {
    case "manga":
      return ReadingMode.PAGED_MANGA;
    case "manhwa":
    case "manhua":
      return ReadingMode.WEBTOON;
  }

  return;
};

const parseChapters = ($: CheerioAPI): Chapter[] => {
  const recognizer = new ChapterRecognition();
  const chapters = $("div[x-data] > a")
    .toArray()
    .map((el, i) => parseChapter($, el, i, recognizer));

  return chapters;
};

const parseChapter = (
  $: CheerioAPI,
  item: Element,
  index: number,
  recognizer: ChapterRecognition
): Chapter => {
  const title = $("span.flex > span", item).first().text().trim();
  const webUrl = $(item).attr("href") ?? "";
  const chapterId = webUrl.split("/").at(-1) ?? "";
  const date = moment(
    $("time[datetime]", item).attr("datetime") ?? ""
  ).toDate();

  const number = recognizer.parseChapterNumber("", title);
  return {
    index,
    chapterId,
    webUrl,
    number,
    title,
    date,
    language: "en_US",
  };
};

const parseChapterData = ($: CheerioAPI): ChapterData => {
  const elements = $('section[x-data*="scroll"] > img').toArray();
  const pages: ChapterPage[] = elements.map((el) => ({
    url: $(el).attr("src"),
  }));

  return { pages };
};
