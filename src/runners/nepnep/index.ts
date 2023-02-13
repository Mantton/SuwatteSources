import {
  Chapter,
  ChapterData,
  CollectionExcerpt,
  Content,
  ExploreCollection,
  ExploreTag,
  Filter,
  PagedResult,
  PreferenceGroup,
  Property,
  SearchRequest,
  SearchSort,
  Source,
  SourceInfo,
} from "@suwatte/daisuke";
import { sampleSize } from "lodash";
import {
  ADULT_TAGS,
  BASE_EXPLORE_COLLECTIONS,
  SEARCH_SORTERS,
  TAG_PREFIX,
} from "./constants";
import { Controller } from "./controller";
import { preferences } from "./preference";
// Wanted to make this less bloated than MangaDex LMAO
export class Target extends Source {
  info: SourceInfo = {
    id: "m.nepnep",
    website: "https://mangasee123.com",
    version: 1.2,
    name: "NepNep",
    supportedLanguages: ["EN_US"],
    nsfw: false,
    authors: ["Mantton"],
    thumbnail: "nepnep.png",
    minSupportedAppVersion: "4.6.0",
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
    return filters
      .map((v) => ({
        id: v.id,
        label: v.title,
        tags: (v.options ?? []).map((v) => ({
          ...v,
          adultContent: ADULT_TAGS.includes(v.id),
        })),
      }))
      .filter((v) => v.tags.length != 0);
  }

  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    // Refresh
    return BASE_EXPLORE_COLLECTIONS;
  }

  async willResolveExploreCollections(): Promise<void> {
    await this.controller.fetchHomePage();
  }

  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    return await this.controller.resolveExcerpt(excerpt);
  }

  async getExplorePageTags(): Promise<ExploreTag[]> {
    const tags = (await this.getSourceTags())[0].tags.filter(
      (v) => !v.adultContent
    );
    return sampleSize(tags, 7).map((v) => ({
      ...v,
      filterId: TAG_PREFIX.genres,
    }));
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
