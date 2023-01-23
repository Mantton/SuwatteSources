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
import { sampleSize } from "lodash";
import { BASE_EXPLORE_COLLECTIONS, SEARCH_SORTERS } from "./constants";
import { Controller } from "./controller";
import { preferences } from "./preference";
// Wanted to make this less bloated than MangaDex LMAO
export class Target extends Source {
  info: SourceInfo = {
    id: "m.nepnep",
    website: "https://mangasee123.com",
    version: 1.1,
    name: "NepNep",
    supportedLanguages: ["EN_US"],
    nsfw: false,
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
    const filters = await this.controller.getFilters();
    return filters.map((v) => v.property);
  }

  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    // Refresh
    return BASE_EXPLORE_COLLECTIONS;
  }

  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    return await this.controller.resolveExcerpt(excerpt);
  }

  async getExplorePageTags(): Promise<Tag[]> {
    const tags = (await this.controller.getFilters())[0].property.tags;
    return sampleSize(tags, 7);
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
