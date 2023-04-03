import {
  Chapter,
  ChapterData,
  CollectionExcerpt,
  Content,
  ExploreCollection,
  Filter,
  NetworkRequest,
  PagedResult,
  Property,
  SearchRequest,
  Source,
  SourceInfo,
} from "@suwatte/daisuke";
import { EXPLORE_COLLECTIONS, FILTERS, PROPERTIES } from "./constants";
import { Controller } from "./controller";

export class Target extends Source {
  info: SourceInfo = {
    id: "com.manganato",
    name: "MangaNato",
    version: 0.2,
    website: "https://manganto.com",
    thumbnail: "manganato.png",
    nsfw: false,
    supportedLanguages: ["en_US"],
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

  async getSourceTags(): Promise<Property[]> {
    return PROPERTIES;
  }

  // Searching
  async getSearchResults(query: SearchRequest): Promise<PagedResult> {
    const results = await this.controller.getSearchResults(query);
    return {
      page: query.page ?? 1,
      results,
      isLastPage: results.length > 24,
    };
  }
  async getSearchFilters(): Promise<Filter[]> {
    return FILTERS;
  }

  // Explore
  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    return EXPLORE_COLLECTIONS;
  }

  willResolveExploreCollections(): Promise<void> {
    return this.controller.getHomePage();
  }
  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    const highlights = await this.controller.resolveExploreCollection(
      excerpt.id
    );
    return {
      ...excerpt,
      highlights,
    };
  }

  async willRequestImage(request: NetworkRequest): Promise<NetworkRequest> {
    request.headers = {
      ...(request.headers ?? {}),
      ...{
        referer: "https://manganato.com",
      },
    };
    return request;
  }
}
