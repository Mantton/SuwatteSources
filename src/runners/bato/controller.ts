import {
  ChapterData,
  Filter,
  Highlight,
  PagedResult,
  SearchRequest,
  Tag,
} from "@suwatte/daisuke";
import { load, Element } from "cheerio";
import { decode } from "he";
import {
  ADULT_TAGS,
  CONTENT_TYPE_TAGS,
  DEMOGRAPHIC_TAGS,
  GENERIC_TAGS,
  LANG_TAGS,
  ORIGIN_TAGS,
  STATUS_TAGS,
} from "./constants";
import { Parser } from "./parser";
export class Controller {
  private TAG_DIVIDER = ":";
  private BASE = "https://bato.to";
  private client = new NetworkClient();
  private parser = new Parser();
  private store = new ValueStore();

  async getSearchResults(query: SearchRequest): Promise<PagedResult> {
    let params: Record<string, any> = {};

    // Keyword
    if (query.query) {
      params["word"] = query.query;
    }

    // Page
    if (query.page) {
      params["page"] = query.page;
    }

    // Filters
    const includedTags = this.getMappedFilters(query.includedTags ?? []);
    const excludedTags = this.getMappedFilters(query.excludedTags ?? []);

    // TODO: This can be simplified by changing the tag prefix to match the Query Param, so something like a forEach could just prepare the values
    params.genres = this.prepareFilterString(
      includedTags.genre,
      excludedTags.genre
    );

    const preparedLangs = this.prepareFilterString(
      includedTags.lang,
      excludedTags.lang
    );
    if (preparedLangs) {
      params.langs = preparedLangs;
    } else {
      const values = await this.store.get("content_search_langs");
      if (values) {
        const langs = values.split(", ");
        params.lang = this.prepareFilterString(langs, []);
      }
    }
    params.origs = this.prepareFilterString(
      includedTags.origin,
      excludedTags.origin
    );
    params.chapters = this.prepareFilterString(
      includedTags.chapters,
      excludedTags.chapters
    );

    const includedWord = this.prepareFilterString(includedTags.word, []);
    if (!params.word && includedWord) params.word = includedWord;

    params.release = this.prepareFilterString(includedTags.status, []);
    params.sort = query.sort?.id ?? "";

    const response = await this.client.get(`${this.BASE}/browse`, {
      params,
    });
    const results = this.parser.parsePagedResponse(response.data);
    return { page: query.page ?? 1, results, isLastPage: results.length > 60 };
  }

  getMappedFilters(data: string[]) {
    type T = Record<string, string[]>;
    const object: T = data.reduce(
      (result: T, value) => {
        // Split Tag Group & Key
        const [group, key] = value.split(this.TAG_DIVIDER);

        // Return Result if Key or Group is Invalid
        if (!group || !key) return result;

        result[group].push(key);
        return result;
      },
      {
        genre: [],
        lang: [],
        origin: [],
        chapters: [],
        status: [],
        word: [],
      }
    );

    return object;
  }

  prepareFilterString(included: string[], excluded: string[]) {
    let str = included.join(",");

    if (excluded.length !== 0) {
      str += "|";
      str += excluded.join(",");
    }

    return str;
  }

  getFilters(): Filter[] {
    return [
      {
        id: "content_type",
        property: {
          id: "content_type",
          label: "Content Type",
          tags: CONTENT_TYPE_TAGS,
        },
        canExclude: true,
      },
      {
        id: "demographic",
        property: {
          id: "demographic",
          label: "Demographics",
          tags: DEMOGRAPHIC_TAGS,
        },
        canExclude: true,
      },
      {
        id: "adult",
        property: {
          id: "adult",
          label: "Mature",
          tags: ADULT_TAGS,
        },
        canExclude: true,
      },
      {
        id: "general",
        property: {
          id: "general",
          label: "Genres",
          tags: GENERIC_TAGS,
        },
        canExclude: true,
      },
      {
        id: "origin",
        property: {
          id: "origin",
          label: "Original Language",
          tags: ORIGIN_TAGS,
        },
        canExclude: false,
      },
      {
        id: "translated",
        property: {
          id: "translated",
          label: "Translated Language",
          tags: LANG_TAGS,
        },
        canExclude: false,
      },
      {
        id: "status",
        property: {
          id: "status",
          label: "Content Status",
          tags: STATUS_TAGS,
        },
        canExclude: false,
      },
    ];
  }

  async getContent(id: string) {
    const response = await this.client.get(`${this.BASE}/series/${id}`);
    return this.parser.parseContent(response.data, id);
  }

  async getChapters(id: string) {
    const response = await this.client.get(`${this.BASE}/series/${id}`);
    return this.parser.parseChapters(response.data, id);
  }

  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const response = await this.client.get(`${this.BASE}/chapter/${chapterId}`);
    return {
      contentId,
      chapterId,
      pages: this.parser.parsePages(response.data),
    };
  }
}
