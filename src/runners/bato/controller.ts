import {
  ChapterData,
  DirectoryFilter,
  DirectoryRequest,
  FilterType,
  PagedResult,
  Property,
} from "@suwatte/daisuke";
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
  private store = ObjectStore;

  async getSearchResults(query: DirectoryRequest): Promise<PagedResult> {
    const params: Record<string, any> = {};

    // Keyword
    if (query.query) {
      params["word"] = query.query;
    }

    // Page
    if (query.page) {
      params["page"] = query.page;
    }

    const includedTags: string[] = [];
    const excludedTags: string[] = [];
    // for (const filter of query.filters ?? []) {
    //   switch (filter.id) {
    //     case "creators":
    //       if (!filter.included || !filter.included[0] || params.word) break;
    //       params.word = filter.included[0];
    //       break;
    //     case "origin":
    //       params.origs = this.prepareFilterString(
    //         filter.included ?? [],
    //         filter.excluded ?? []
    //       );
    //       break;
    //     case "translated":
    //       params.lang = this.prepareFilterString(
    //         filter.included ?? [],
    //         filter.excluded ?? []
    //       );
    //       if (!params.lang) {
    //         const values = ((await this.store.get("content_search_langs")) as
    //           | string[]
    //           | null) ?? ["en"];
    //         if (values) {
    //           const langs = values;
    //           params.lang = this.prepareFilterString(langs, []);
    //         }
    //       }
    //       break;
    //     case "status":
    //       if (!filter.included) break;
    //       params.release = this.prepareFilterString(filter.included, []);
    //       break;
    //     default:
    //       if (filter.included) includedTags.push(...filter.included);
    //       if (filter.excluded) excludedTags.push(...filter.excluded);
    //       break;
    //   }
    // }
    params.sort = query.sort ?? "";
    const response = await this.client.get(`${this.BASE}/browse`, {
      params,
    });
    const results = this.parser.parsePagedResponse(response.data);
    return { results, isLastPage: results.length > 60 };
  }

  prepareFilterString(included: string[], excluded: string[]) {
    let str = included.join(",");

    if (excluded.length !== 0) {
      str += "|";
      str += excluded.join(",");
    }

    return str;
  }

  getFilters(): DirectoryFilter[] {
    return [
      {
        id: "content_type",
        title: "Content Type",
        type: FilterType.EXCLUDABLE_MULTISELECT,
        options: CONTENT_TYPE_TAGS,
      },
      {
        id: "demographic",
        title: "Demographics",
        type: FilterType.EXCLUDABLE_MULTISELECT,
        options: DEMOGRAPHIC_TAGS,
      },
      {
        id: "adult",
        title: "Mature",
        type: FilterType.EXCLUDABLE_MULTISELECT,
        options: ADULT_TAGS,
      },
      {
        id: "general",
        title: "Genres",
        type: FilterType.EXCLUDABLE_MULTISELECT,
        options: GENERIC_TAGS,
      },
      {
        id: "origin",
        title: "Original Language",
        type: FilterType.SELECT,
        options: ORIGIN_TAGS,
      },
      {
        id: "translated",
        title: "Translated Language",
        subtitle:
          "NOTE: When Selected, This will override your language preferences",
        type: FilterType.SELECT,
        options: LANG_TAGS,
      },
      {
        id: "status",
        title: "Content Status",
        type: FilterType.SELECT,
        options: STATUS_TAGS,
      },
    ];
  }

  getProperties(): Property[] {
    return [
      {
        id: "content_type",
        title: "Content Type",
        tags: CONTENT_TYPE_TAGS,
      },
      {
        id: "demographic",
        title: "Demographics",
        tags: DEMOGRAPHIC_TAGS,
      },
      {
        id: "adult",
        title: "Mature",
        tags: ADULT_TAGS,
      },
      {
        id: "general",
        title: "Genres",
        tags: GENERIC_TAGS,
      },
      {
        id: "origin",
        title: "Original Language",
        tags: ORIGIN_TAGS,
      },
      {
        id: "translated",
        title: "Translated Language",
        tags: LANG_TAGS,
      },
      {
        id: "status",
        title: "Content Status",
        tags: STATUS_TAGS,
      },
    ];
  }

  async getContent(id: string) {
    const response = await this.client.get(`${this.BASE}/series/${id}`);
    return this.parser.parseContent(response.data, id);
  }

  async getChapters(id: string) {
    const response = await this.client.get(`${this.BASE}/series/${id}`);
    return this.parser.parseChapters(response.data);
  }

  async getChapterData(chapterId: string): Promise<ChapterData> {
    const response = await this.client.get(`${this.BASE}/chapter/${chapterId}`);
    return {
      pages: this.parser.parsePages(response.data),
    };
  }
}
