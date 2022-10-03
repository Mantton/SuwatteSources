import {
  Chapter,
  ChapterData,
  CollectionExcerpt,
  Content,
  ExploreCollection,
  NetworkRequest,
  PagedResult,
  Property,
  SearchRequest,
  Source,
  SourceInfo,
  Tag,
} from "@suwatte/daisuke";
import { sampleSize } from "lodash";
import {
  DEFAULT_CONTEXT,
  EXPLORE_SECTIONS as EXPLORE_COLLECTIONS,
} from "./constants";
import { Controller } from "./controller";
import { Context } from "./types";

export abstract class MadaraTemplate extends Source {
  context: Context;
  protected controller: Controller;

  constructor(ctx: Context) {
    super();
    this.context = ctx;
    this.controller = new Controller(ctx);
  }
  async willRequestImage(request: NetworkRequest): Promise<NetworkRequest> {
    request.headers = {
      ...request.headers,
      Referer: this.context.baseUrl + "/",
    };
    return request;
  }
  //
  async getContent(contentId: string): Promise<Content> {
    return this.controller.getContent(contentId);
  }

  //
  getChapters(contentId: string): Promise<Chapter[]> {
    return this.controller.getChapters(contentId);
  }

  //
  getChapterData(contentId: string, chapterId: string): Promise<ChapterData> {
    return this.controller.getChapterData(contentId, chapterId);
  }

  //
  getSearchResults(query: SearchRequest): Promise<PagedResult> {
    throw "Method not Implemented";
  }

  //
  async getSourceTags(): Promise<Property[]> {
    const tags = await this.controller.getTags();
    return [
      {
        id: "main",
        label: "Tags",
        tags,
      },
    ];
  }

  //
  async getExplorePageTags(): Promise<Tag[]> {
    const tags = await this.controller.getTags();
    return sampleSize(tags, 7);
  }

  //
  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    return EXPLORE_COLLECTIONS;
  }

  //
  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    return this.controller.getCollection(excerpt);
  }
}

export class Test extends MadaraTemplate {
  info: SourceInfo = {
    id: "com.toonily",
    name: "Toonily",
    thumbnail: "toonily.png",
    version: 1.0,
    hasExplorePage: true,
    primarilyAdultContent: true,
    website: "https://toonily.com",
    supportedLanguages: ["GB"],
  };

  context: Context = {
    ...DEFAULT_CONTEXT,
    baseUrl: this.info.website,
  };
}
