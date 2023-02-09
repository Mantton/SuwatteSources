import {
  Chapter,
  ChapterData,
  CollectionExcerpt,
  Content,
  ExploreCollection,
  Filter,
  PagedResult,
  Property,
  SearchRequest,
  Source,
  SourceInfo,
} from "@suwatte/daisuke";
import { encode } from "he";
import { EXCERPTS, properties } from "./constants";
import { Parser } from "./parser";

export class Target extends Source {
  info: SourceInfo = {
    id: "dev_comic_castle",
    name: "Comic Castle",
    nsfw: false,
    version: 1.1,
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
  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const url = this.info.website + `/read/swiper/${chapterId}/${contentId}`;
    const response = await this.client.get(url);
    const pages = this.parser.parseChapterData(response.data);
    return {
      contentId,
      chapterId,
      pages,
    };
  }
  async getSearchResults(query: SearchRequest): Promise<PagedResult> {
    const { page, query: text, includedTags } = query;
    let path = "/library/search/result";
    let config: any = {
      method: "POST",
      body: {
        search: "",
        submit: "Submit",
      },
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
    };
    if (text) {
      // Title Search
      config.body.search = encode(text);
    }

    if (includedTags && includedTags.length != 0) {
      // Tag Search, Can Only Search Single Tag
      const [lastPathExtension, search] = includedTags[0].split(":");
      path = `/library/search/${lastPathExtension}`;
      config.body.search = encode(search);
    }

    if (query.page) {
      path += `/${page}`;
    }
    const response = await this.client.request({
      url: `${this.info.website}${path}`,
      ...config,
    });
    const { isLastPage, highlights: results } = this.parser.parseSearchResults(
      response.data
    );
    return { page: query.page ?? 1, isLastPage, results };
  }
  async getSourceTags(): Promise<Property[]> {
    return properties();
  }

  async getSearchFilters(): Promise<Filter[]> {
    return properties().map((v) => ({
      id: v.id,
      property: v,
      canExclude: false,
    }));
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
