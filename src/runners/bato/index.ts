import {
  Chapter,
  ChapterData,
  Content,
  Filter,
  PagedResult,
  PreferenceGroup,
  PreferenceType,
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
    version: 0.11,
    website: "https://bato.to",
    supportedLanguages: [],
    nsfw: false,
    thumbnail: "bato.png",
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
    return this.controller.getFilters().map((v) => v.property);
  }

  async getSearchFilters(): Promise<Filter[]> {
    return this.controller.getFilters();
  }

  async getSearchSorters(): Promise<SearchSort[]> {
    return SORTERS;
  }

  async getUserPreferences(): Promise<PreferenceGroup[]> {
    return [
      {
        id: "language",
        children: [
          {
            label: "Languages",
            key: "content_search_langs",
            defaultValue: "lang:en",
            type: PreferenceType.multiSelect,
            options: LANG_TAGS.map((v) => ({ label: v.label, value: v.id })),
          },
        ],
      },
    ];
  }
}
