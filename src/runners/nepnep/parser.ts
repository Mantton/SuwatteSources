import {
  Highlight,
  Content,
  Property,
  ReadingMode,
  HighlightCollection,
  Chapter,
  ChapterData,
  ChapterPage,
  FilterType,
  DirectoryFilter,
  DirectoryRequest,
} from "@suwatte/daisuke";
import { load } from "cheerio";
import { capitalize, toLower } from "lodash";
import moment from "moment";
import {
  HIGHLIGHT_LIMIT,
  TAG_PREFIX,
  ADULT_TAGS,
  VERTICAL_TYPES,
  STATUS_KEYS,
  PATHS,
  DEFAULT_FILTERS,
} from "./constants";
import {
  HomePageEntry,
  DirectoryEntry,
  ChapterDetail,
  ParsedRequest,
  FilterProps,
} from "./types";
import { parseChapterString } from "./utils";

export class Parser {
  THUMBNAIL_TEMPLATE = "";

  homepageSection(entries: HomePageEntry[]) {
    const highlights: Highlight[] = [];
    for (const entry of entries.slice(0, HIGHLIGHT_LIMIT)) {
      highlights.push({
        id: entry.IndexName,
        title: entry.SeriesName,
        cover: this.coverFor(entry.IndexName),
      });
    }
    return highlights;
  }

  filters(html: string): DirectoryFilter[] {
    const filters: DirectoryFilter[] = [];
    const genreStr = html.match(PATHS.genre_tag)?.[1].replace(/'/g, '"').trim();
    const typesStr = html
      .match(PATHS.format_tag)?.[1]
      .match(/(\[.*])/)?.[1]
      .replace(/'/g, '"')
      .trim();

    if (!genreStr || !typesStr) throw new Error("Failed to parse Filters");
    const genres: string[] = JSON.parse(genreStr);
    const types: string[] = JSON.parse(typesStr);
    // Genres
    filters.push({
      id: TAG_PREFIX.genres,
      title: "Genres",
      type: FilterType.EXCLUDABLE_MULTISELECT,
      options: genres.map((v) => ({
        id: v.toLowerCase(),
        title: v,
      })),
    });

    // Types
    filters.push({
      id: TAG_PREFIX.type,
      title: "Types",
      type: FilterType.EXCLUDABLE_MULTISELECT,
      options: types.map((v) => ({
        id: v.toLowerCase(),
        title: v,
      })),
    });

    return [...filters, ...DEFAULT_FILTERS];
  }
  coverFor(id: string): string {
    return this.THUMBNAIL_TEMPLATE.replace("{{Result.i}}", id);
  }
  toHighlight(entry: DirectoryEntry): Highlight {
    return {
      id: entry.i,
      title: entry.s,
      cover: this.coverFor(entry.i),
    };
  }

  search(request: DirectoryRequest<FilterProps>): ParsedRequest {
    const { filters, tag, query } = request;

    if (query) {
      return {
        query,
      };
    }

    if (filters) {
      return {
        includedTags: filters.genres?.included?.map(toLower) ?? [],
        excludedTags: filters.genres?.excluded?.map(toLower) ?? [],
        p_status: filters.p_status,
        s_status: filters.s_status,
        includeTypes: filters.type?.included.map(toLower),
        excludeTypes: filters.type?.excluded.map(toLower),
      };
    }

    if (tag) {
      switch (tag.propertyId) {
        case "p_status":
        case "s_status": {
          return { [tag.propertyId]: [tag.tagId] };
        }
        case "type": {
          return { includeTypes: [tag.tagId] };
        }
        case "genres": {
          return { includedTags: [tag.tagId] };
        }

        case "released": {
          return { released: tag.tagId };
        }
        case "author": {
          return { authors: [tag.tagId] };
        }
        case "translation":
          return { originalTranslation: true };
      }
    }

    return {};
  }

  //   // Content
  content(html: string, id: string, host: string): Content {
    const $ = load(html);

    const body = $(".row");
    const title = $("h1", body).text();
    if (!title) throw new Error("Failed to Parse Profile");
    const summary = $(".Content", body).text().split("{")[0];

    const additionalTitles = $(
      ".list-group-item:has(span:contains(Alternate))",
      body
    )
      .text()
      .replace("Alternate Name(s):", "")
      .trim()
      .split(", ")
      .map((v) => v.trim())
      .filter((v) => v && v !== title);

    const creators = $(".list-group-item:has(span:contains(Author)) a", body)
      .map((_, v) => $(v).text())
      .toArray()
      .map((v) => v.trim())
      .filter((v) => !!v);

    // Properties
    const properties: Property[] = [];
    const genres = $(".list-group-item:has(span:contains(Genre)) a", body)
      .map((_, v) => $(v).text())
      .toArray()
      .map((v) => v.trim())
      .filter((v) => !!v);
    properties.push({
      id: TAG_PREFIX.genres,
      title: "Genres",
      tags: genres.map((v) => ({
        id: v.toLowerCase(),
        title: v,
        nsfw: ADULT_TAGS.includes(v.toLowerCase()),
      })),
    });

    const nsfw = properties[0].tags.some((v) => v.nsfw);

    // Grouped Types, Released, Official Translation
    const groupedProperty: Property = {
      id: "grouped",
      title: "Additional Tags",
      tags: [],
    };

    const type = $(".list-group-item:has(span:contains(Type)) a", body)
      .first()
      .text();
    const released = $(".list-group-item:has(span:contains(Released)) a", body)
      .first()
      .text();
    const officialTranslation = $(
      ".list-group-item:has(span:contains(Official Translation)) a",
      body
    )
      .first()
      .text();

    // Type
    groupedProperty.tags.push({
      id: `${TAG_PREFIX.type}:${type.toLowerCase()}`,
      title: type,
    });

    // Released

    groupedProperty.tags.push({
      id: `${TAG_PREFIX.year}:${released}`,
      title: `Released in ${released}`,
    });

    // Reading Mode
    let recommendedPanelMode = ReadingMode.PAGED_MANGA;
    if (VERTICAL_TYPES.includes(type)) {
      recommendedPanelMode = ReadingMode.WEBTOON;
    }

    if (officialTranslation) {
      groupedProperty.tags.push({
        id: TAG_PREFIX.translation,
        title: "Official Translation",
      });
    }
    properties.push(groupedProperty);

    /// Authors
    properties.push({
      id: TAG_PREFIX.author,
      title: "Author(s)",
      tags: creators.map((v) => ({
        id: v.trim().toLowerCase(),
        title: v.split(" ").map(capitalize).join(" ").trim(),
      })),
    });

    const statusString = $(
      ".list-group-item:has(span:contains(Status)) a:contains(Publish)",
      body
    )
      .text()
      .replace(" (Publish)", "")
      .trim()
      .toLowerCase();

    const status = STATUS_KEYS[statusString];

    // Related
    const collections: HighlightCollection[] = [];
    const relatedString = html.match(PATHS.related)?.[1];

    if (relatedString) {
      const entries: HomePageEntry[] = JSON.parse(relatedString);
      const highlights = this.homepageSection(entries);
      const collection: HighlightCollection = {
        id: "related",
        title: "Related Titles",
        highlights: highlights,
      };
      collections.push(collection);
    }

    const cover =
      $('meta[property="og:image"]').attr("content") ?? this.coverFor(id);
    const chapters = this.chapters(html);
    return {
      additionalTitles,
      summary,
      cover,
      collections,
      isNSFW: nsfw,
      recommendedPanelMode,
      title,
      status,
      properties,
      creators,
      webUrl: `${host}/manga/${id}`,
      chapters,
    };
  }

  chapters(html: string): Chapter[] {
    const str = html.match(PATHS.chapters)?.[1];
    if (!str) throw new Error("Failed to Parse Chapters");

    const objects: ChapterDetail[] = JSON.parse(str);
    let index = 0;
    const chapters: Chapter[] = [];
    for (const object of objects) {
      const chapterId = object.Chapter;
      const numbers = parseChapterString(chapterId);
      chapters.push({
        chapterId,
        ...numbers,
        index,
        date: moment(object.Date).subtract(1, "hour").toDate(),
        language: "en_us",
      });
      index++;
    }
    return chapters;
  }

  chapterData(html: string): ChapterData {
    const host = html.match(PATHS.chapter_data_domain)?.[1].replaceAll(`"`, "");
    const path = html.match(PATHS.chapter_data_path)?.[1].replaceAll(`"`, "");
    const chapterStr = html.match(PATHS.chapter_data_chapter)?.[1];

    if (!host || !path || !chapterStr) throw new Error("Unable to find info");

    const chapter: ChapterDetail = JSON.parse(chapterStr);
    const directory =
      chapter.Directory && chapter.Directory.length > 0
        ? `${chapter.Directory}/`
        : "";
    const c = parseChapterString(chapter.Chapter).number.toString().split(".");
    let chapterPath = c[0];
    chapterPath = chapterPath.padStart(4, "0");
    const decimal = c[1];
    if (decimal) {
      chapterPath += `.${decimal}`;
    }
    const base = `https://${host}/manga/${path}/${directory}${chapterPath}`;

    const pageCount = chapter.Page ? parseInt(chapter.Page) : 0;

    if (!pageCount) throw new Error("Invalid Page Count");

    const pages: ChapterPage[] = Array.from(Array(pageCount), (_, n) => ({
      url: `${base}-${(n + 1).toString().padStart(3, "0")}.png`,
    }));
    return {
      pages,
    };
  }
}
