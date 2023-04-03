import {
  Chapter,
  ChapterData,
  Content,
  Filter,
  MultiSelectPreference,
  PagedResult,
  PreferenceGroup,
  Property,
  SearchRequest,
  SearchSort,
  Source,
  SourceInfo,
} from "@suwatte/daisuke";
import { LANG_TAGS, SORTERS } from "./constants";
import { Controller } from "./controller";

export class Target extends Source {
  info: SourceInfo = {
    id: "to.bato",
    name: "Bato",
    version: 0.3,
    website: "https://bato.to",
    supportedLanguages: [],
    nsfw: false,
    thumbnail: "bato.png",
    minSupportedAppVersion: "5.0",
  };

  private controller = new Controller();
  getContent(contentId: string): Promise<Content> {
    return this.controller.getContent(contentId);
  }
  getChapters(contentId: string): Promise<Chapter[]> {
    return this.controller.getChapters(contentId);
  }
  getChapterData(contentId: string, chapterId: string): Promise<ChapterData> {
    return this.controller.getChapterData(contentId, chapterId);
  }
  getSearchResults(query: SearchRequest): Promise<PagedResult> {
    return this.controller.getSearchResults(query);
  }
  async getSourceTags(): Promise<Property[]> {
    return this.controller.getProperties();
  }

  async getSearchFilters(): Promise<Filter[]> {
    return this.controller.getFilters();
  }

  async getSearchSorters(): Promise<SearchSort[]> {
    return SORTERS;
  }

  async getUserPreferences(): Promise<PreferenceGroup[]> {
    const store = new ObjectStore();

    return [
      {
        id: "language",
        children: [
          new MultiSelectPreference({
            label: "Languages",
            key: "n_content_search_langs",
            options: LANG_TAGS.map((v) => ({ label: v.label, value: v.id })),
            value: {
              get: async () => {
                return (
                  ((await store.get("n_content_search_langs")) as
                    | string[]
                    | null) ?? ["en"]
                );
              },
              set: async (v) => {
                return await store.set("n_content_search_langs", v);
              },
            },
          }),
        ],
      },
    ];
  }
}
