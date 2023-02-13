import {
  Chapter,
  ChapterData,
  ChapterPage,
  CollectionStyle,
  Content,
  Filter,
  FilterType,
  Highlight,
  HighlightCollection,
  Property,
  ReadingMode,
  SearchRequest,
  Status,
} from "@suwatte/daisuke";
import { load } from "cheerio";
import { capitalize, toLower } from "lodash";
import moment from "moment";
import {
  ADULT_TAGS,
  DEFAULT_FILTERS,
  HIGHLIGHT_LIMIT,
  PATHS,
  STATUS_KEYS,
  TAG_PREFIX,
  VERTICAL_TYPES,
} from "./constants";
import {
  ChapterDetail,
  DirectoryEntry,
  HomePageEntry,
  ParsedRequest,
} from "./types";
import { parseChapterString } from "./utils";

export class Parser {
  private THUMBNAIL_URL = "";

  thumbnail(html: string) {
    const $ = load(html);
    const selector = ".SearchResult > .SearchResultCover img";

    const url = $(selector).first().attr("ng-src");
    if (!url) throw new Error("Failed to parse thumbnail URL");
    this.THUMBNAIL_URL = url;
  }

  hasThumbnail() {
    return !!this.THUMBNAIL_URL;
  }

  homepageSection(entries: HomePageEntry[]) {
    const highlights: Highlight[] = [];
    for (const entry of entries.slice(0, HIGHLIGHT_LIMIT)) {
      highlights.push({
        contentId: entry.IndexName,
        title: entry.SeriesName,
        cover: this.coverFor(entry.IndexName),
        // tags: entry.Genres,
      });
    }
    return highlights;
  }

  filters(html: string): Filter[] {
    const filters: Filter[] = [];
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
        label: v,
      })),
    });

    // Types
    filters.push({
      id: TAG_PREFIX.type,
      title: "Types",
      type: FilterType.EXCLUDABLE_MULTISELECT,
      options: types.map((v) => ({
        id: v.toLowerCase(),
        label: v,
      })),
    });

    return [...filters, ...DEFAULT_FILTERS];
  }
  coverFor(id: string): string {
    return this.THUMBNAIL_URL.replace("{{Result.i}}", id);
  }
  toHighlight(entry: DirectoryEntry): Highlight {
    return {
      contentId: entry.i,
      title: entry.s,
      cover: this.coverFor(entry.i),
    };
  }

  search(request: SearchRequest): ParsedRequest {
    const { filters } = request;
    const grouped = filters?.find((v) => v.id == "grouped");
    const groupedTypes = grouped?.included
      ?.filter((v) => v.startsWith(TAG_PREFIX.type))
      .map((v) => v.split(":")?.[1])
      .filter((v) => v);
    const groupedYear = grouped?.included
      ?.filter((v) => v.startsWith(TAG_PREFIX.year))
      .map((v) => v.split(":")?.[1])
      .filter((v) => v)?.[0];
    const orig = grouped?.included?.includes(TAG_PREFIX.translation);
    return {
      query: request.query?.toLowerCase(),

      // Tags
      includedTags: filters
        ?.find((v) => v.id == TAG_PREFIX.genres)
        ?.included?.map(toLower),
      excludedTags: filters
        ?.find((v) => v.id == TAG_PREFIX.genres)
        ?.excluded?.map(toLower),

      // Author
      authors: filters
        ?.find((v) => v.id == TAG_PREFIX.author)
        ?.included?.map(toLower),
      // Status
      p_status: filters
        ?.find((v) => v.id == TAG_PREFIX.publication)
        ?.included?.map(toLower),
      s_status: filters
        ?.find((v) => v.id == TAG_PREFIX.scanlation)
        ?.included?.map(toLower),

      // Types
      includeTypes:
        filters?.find((v) => v.id == TAG_PREFIX.type)?.included?.map(toLower) ??
        groupedTypes,
      excludeTypes: filters
        ?.find((v) => v.id == TAG_PREFIX.type)
        ?.excluded?.map(toLower),

      // Original Translation
      originalTranslation:
        filters?.find((v) => v.id == TAG_PREFIX.translation)?.bool ??
        orig ??
        false,
      // Release Year
      released:
        filters?.find((v) => v.id == TAG_PREFIX.year)?.included?.[0] ??
        groupedYear,
    };
  }

  // Content
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
      label: "Genres",
      tags: genres.map((v) => ({
        id: v.toLowerCase(),
        label: v,
        adultContent: ADULT_TAGS.includes(v.toLowerCase()),
      })),
    });

    const adultContent = properties[0].tags.some((v) => v.adultContent);

    // Grouped Types, Released, Official Translation
    const groupedProperty: Property = {
      id: "grouped",
      label: "Additional Tags",
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
      label: type,
    });

    // Released

    groupedProperty.tags.push({
      id: `${TAG_PREFIX.year}:${released}`,
      label: `Released in ${released}`,
    });

    // Reading Mode
    let recommendedReadingMode = ReadingMode.PAGED_MANGA;
    if (VERTICAL_TYPES.includes(type)) {
      recommendedReadingMode = ReadingMode.VERTICAL;
    }

    if (officialTranslation) {
      groupedProperty.tags.push({
        id: TAG_PREFIX.lang,
        label: "Official Translation",
      });
    }
    properties.push(groupedProperty);

    /// Authors
    properties.push({
      id: TAG_PREFIX.author,
      label: "Author(s)",
      tags: creators.map((v) => ({
        id: v.trim().toLowerCase(),
        label: v.split(" ").map(capitalize).join(" ").trim(),
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

    const status = STATUS_KEYS[statusString] ?? Status.UNKNOWN;

    // Related
    const includedCollections: HighlightCollection[] = [];
    const relatedString = html.match(PATHS.related)?.[1];

    if (relatedString) {
      const entries: HomePageEntry[] = JSON.parse(relatedString);
      const highlights = this.homepageSection(entries);
      const collection: HighlightCollection = {
        id: "related",
        title: "Related Titles",
        style: CollectionStyle.NORMAL,
        highlights,
      };
      includedCollections.push(collection);
    }

    const cover = this.coverFor(id);
    const chapters = this.chapters(html, id);
    return {
      contentId: id,
      additionalTitles,
      summary,
      cover,
      includedCollections,
      adultContent,
      recommendedReadingMode,
      title,
      status,
      properties,
      creators,
      webUrl: `${host}/manga/${id}`,
      chapters,
    };
  }

  chapters(html: string, contentId: string): Chapter[] {
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
        contentId,
        ...numbers,
        index,
        date: moment(object.Date).subtract(1, "hour").toDate(),
        language: "en_us",
      });
      index++;
    }
    return chapters;
  }

  chapterData(html: string, chapterId: string, contentId: string): ChapterData {
    const host = html.match(PATHS.chapter_data_domain)?.[1].replaceAll(`"`, "");
    const path = html.match(PATHS.chapter_data_path)?.[1].replaceAll(`"`, "");
    const chapterStr = html.match(PATHS.chapter_data_chapter)?.[1];

    if (!host || !path || !chapterStr) throw new Error("Unable to find info");

    const chapter: ChapterDetail = JSON.parse(chapterStr);
    const directory =
      chapter.Directory && chapter.Directory.length > 0
        ? `${chapter.Directory}/`
        : "";
    let c = parseChapterString(chapter.Chapter).number.toString().split(".");
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
      chapterId,
      contentId,
      pages,
    };
  }
}
