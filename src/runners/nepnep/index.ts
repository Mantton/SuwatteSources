import {
  Chapter,
  ChapterData,
  CollectionExcerpt,
  Content,
  ExploreCollection,
  Filter,
  PagedResult,
  PreferenceGroup,
  Property,
  SearchRequest,
  SearchSort,
  Source,
  SourceInfo,
  Tag,
} from "@suwatte/daisuke";
import { BASE_EXPLORE_COLLECTIONS, SEARCH_SORTERS } from "./constants";
import { Controller } from "./controller";
import { preferences } from "./preference";
// Wanted to make this less bloated than MangaDex LMAO
export class Target extends Source {
  info: SourceInfo = {
    id: "m.nepnep",
    website: "https://mangasee123.com",
    version: 1.0,
    name: "NepNep",
    hasExplorePage: true,
    supportedLanguages: ["GB"],
    primarilyAdultContent: false,
    authors: ["Mantton"],
    thumbnail: "nepnep.png",
  };
  private controller = new Controller();

  async getContent(contentId: string): Promise<Content> {
    return this.controller.getContent(contentId);
  }
  async getChapters(contentId: string): Promise<Chapter[]> {
    return this.controller.getChapters(contentId);
  }
  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    return this.controller.getChapterData(contentId, chapterId);
  }

  async getSourceTags(): Promise<Property[]> {
    throw new Error("Method not implemented.");
  }

  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    // Refresh
    await this.controller.populate();
    return BASE_EXPLORE_COLLECTIONS;
  }

  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    return await this.controller.resolveExcerpt(excerpt);
  }

  async getExplorePageTags(): Promise<Tag[]> {
    return [];
  }
  // Searching
  async getSearchSorters(): Promise<SearchSort[]> {
    return SEARCH_SORTERS;
  }

  async getSearchFilters(): Promise<Filter[]> {
    return this.controller.getFilters();
  }

  async getSearchResults(query: SearchRequest): Promise<PagedResult> {
    return this.controller.getSearchResults(query);
  }

  // Preference
  async getUserPreferences(): Promise<PreferenceGroup[]> {
    return preferences;
  }
}
