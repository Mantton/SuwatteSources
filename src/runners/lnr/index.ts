import {
  Chapter,
  ChapterData,
  CollectionExcerpt,
  Content,
  ExploreCollection,
  Filter,
  Highlight,
  NetworkRequest,
  PagedResult,
  PreferenceGroup,
  Property,
  ReadingFlag,
  RunnerType,
  SearchRequest,
  SearchSort,
  Source,
  SourceInfo,
  Tag,
  TrackerInfo,
  URLContentIdentifier,
  User,
} from "@suwatte/daisuke";
import {
  getExploreCollections,
  parseChapters,
  parseChapterText,
  parseContent,
  parseHomePageSection,
} from "./parser";

export class Target extends Source {
  info: SourceInfo = {
    id: "mttn.org.lnr",
    name: "Light Novel Reader",
    version: 1.0,
    hasExplorePage: true,
    supportedLanguages: ["GB"],
    website: "https://lightnovelreader.org",
    primarilyAdultContent: false,
  };
  CLIENT = new NetworkClient();
  BASE_URL = "https://lightnovelreader.org";
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
  getSearchResults(query: SearchRequest): Promise<PagedResult> {
    throw new Error("Method not implemented.");
  }
  getSourceTags(): Promise<Property[]> {
    throw new Error("Method not implemented.");
  }

  // Explore
  HOMEPAGE: string | null = null;
  async getHomePage() {
    this.HOMEPAGE = (await this.CLIENT.get(`${this.BASE_URL}`)).data;
  }
  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    // Parse Homepage
    try {
      this.getHomePage();
    } catch {}
    return getExploreCollections();
  }

  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    if (excerpt.id.includes("top")) {
      // Make Search Request
      throw new Error("Not Implemented");
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
}
