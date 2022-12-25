import {
  Chapter,
  ChapterData,
  CollectionExcerpt,
  Content,
  ExploreCollection,
  PagedResult,
  Property,
  SearchRequest,
  Source,
  SourceInfo,
} from "@suwatte/daisuke";
import { EXCERPTS } from "./constants";
import { Parser } from "./parser";

export class Target extends Source {
  info: SourceInfo = {
    id: "dev_comic_castle",
    name: "Comic Castle",
    nsfw: false,
    version: 1.0,
    website: "https://comicastle.org",
    supportedLanguages: ["en_US"],
    thumbnail: "comic_castle.png",
  };

  private client = new NetworkClient();
  private parser = new Parser();
  async getContent(contentId: string): Promise<Content> {
    const url = this.info.website + `/home/detail/${contentId}`;
    const response = await this.client.get(url);
    return {
      webUrl: url,
      ...this.parser.parseContent(response.data, contentId),
    };
  }
  async getChapters(contentId: string): Promise<Chapter[]> {
    const url = this.info.website + `/home/detail/${contentId}`;
    const response = await this.client.get(url);
    return this.parser.parseChapters(response.data, contentId);
  }
  getChapterData(contentId: string, chapterId: string): Promise<ChapterData> {
    throw new Error("Method not implemented.");
  }
  getSearchResults(query: SearchRequest): Promise<PagedResult> {
    throw new Error("Method not implemented.");
  }
  getSourceTags(): Promise<Property[]> {
    throw new Error("Method not implemented.");
  }

  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    return EXCERPTS;
  }

  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    await this.populateHomePage();
    const highlights = this.parser.parseHomePageSection(excerpt.id);
    return {
      ...excerpt,
      highlights,
    };
  }

  // * Helpers
  private async populateHomePage() {
    if (this.parser.homepage) return;

    const response = await this.client.get(`${this.info.website}/home`);
    this.parser.homepage = response.data;
  }
}
