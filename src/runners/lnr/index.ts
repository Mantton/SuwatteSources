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
  Tag,
} from "@suwatte/daisuke";
import { sampleSize } from "lodash";
import {
  getExploreCollections,
  parseChapters,
  parseChapterText,
  parseContent,
  parseHomePageSection,
  parseRankingPage,
  parseTags,
} from "./parser";

export class Target extends Source {
  info: SourceInfo = {
    id: "mttn.org.lnr",
    name: "Light Novel Reader",
    version: 1.1,
    supportedLanguages: ["EN_US"],
    website: "https://lightnovelreader.me",
    nsfw: false,
    thumbnail: "lnr.png",
  };
  CLIENT = new NetworkClient();
  BASE_URL = "https://lightnovelreader.me";
  async getContent(contentId: string): Promise<Content> {
    const response = await this.CLIENT.get(`${this.BASE_URL}/${contentId}`);
    return parseContent(response.data, contentId);
  }
  async getChapters(contentId: string): Promise<Chapter[]> {
    const response = await this.CLIENT.get(`${this.BASE_URL}/${contentId}`);
    return parseChapters(response.data, contentId);
  }
  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const response = await this.CLIENT.get(
      `${this.BASE_URL}/${contentId}/${chapterId}`
    );
    return parseChapterText(response.data, contentId, chapterId);
  }
  async getSearchResults(query: SearchRequest): Promise<PagedResult> {
    if (query.page && query.page > 1)
      return { page: query.page, isLastPage: true, results: [] };
    const params: any = {};

    if (query.query) {
      params["keyword"] = query.query;
    }

    if (query.includedTags && query.includedTags.length != 0) {
      const genres = [],
        langs = [],
        types = [];

      for (const tag of query.includedTags) {
        const [pre, val] = tag.split("|");
        switch (pre) {
          case "genre":
            genres.push(val);
            break;
          case "type":
            types.push(val);
            break;
          case "lang":
            langs.push(val);
        }
      }

      if (genres.length != 0) params["include[genre]"] = genres;
      if (types.length != 0) params["include[novel_type]"] = types;
      if (langs.length != 0) params["include[language]"] = langs;
    }

    if (query.excludedTags && query.excludedTags.length != 0) {
      const excludedGenres = query.excludedTags
        .map((v) => v.split("|").pop() ?? "")
        .filter((v) => v);
      if (excludedGenres.length != 0) params["exclude[genre]"] = excludedGenres;
    }
    const response = await this.CLIENT.post(
      this.BASE_URL + "/detailed-search-lnr",
      {
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        body: params,
      }
    );

    const results = parseRankingPage(response.data);
    return {
      page: 1,
      results,
      isLastPage: true,
    };
  }
  async getSourceTags(): Promise<Property[]> {
    const response = await this.CLIENT.get(
      this.BASE_URL + "/detailed-search-lnr"
    );
    return parseTags(response.data);
  }

  // Explore
  private HOMEPAGE: string | null = null;
  async getHomePage() {
    this.HOMEPAGE = (await this.CLIENT.get(`${this.BASE_URL}`)).data;
  }
  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    // Parse Homepage
    try {
      await this.getHomePage();
    } catch {}
    return getExploreCollections();
  }

  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    if (["most-viewed", "subscribers", "top-rated"].includes(excerpt.id)) {
      return {
        ...excerpt,
        highlights: await this.getRankedHighlights(excerpt.id),
      };
    }

    if (!this.HOMEPAGE) {
      await this.getHomePage();
    }
    if (!this.HOMEPAGE) {
      throw new Error("Could not fetch Homepage");
    }
    const highlights = parseHomePageSection(this.HOMEPAGE, excerpt.id);
    return {
      ...excerpt,
      highlights,
    };
  }

  async getExplorePageTags(): Promise<Tag[]> {
    const response = await this.CLIENT.get(
      this.BASE_URL + "/detailed-search-lnr"
    );
    const props = parseTags(response.data);
    return sampleSize(props[0].tags, 7);
  }

  async getRankedHighlights(key: string) {
    const url = this.BASE_URL + `/ranking/${key}/1`;
    const response = await this.CLIENT.get(url);
    return parseRankingPage(response.data);
  }

  async getSearchFilters(): Promise<Filter[]> {
    const response = await this.CLIENT.get(
      this.BASE_URL + "/detailed-search-lnr"
    );
    const props = parseTags(response.data);
    return props.map((v) => ({
      id: v.id,
      canExclude: v.id === "genre",
      property: v,
    }));
  }
}
