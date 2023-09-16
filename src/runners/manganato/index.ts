import {
  CatalogRating,
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  DirectoryConfig,
  DirectoryRequest,
  Generate,
  ImageRequestHandler,
  NetworkRequest,
  PageLink,
  PageLinkResolver,
  PageSection,
  PagedResult,
  ResolvedPageSection,
  RunnerInfo,
} from "@suwatte/daisuke";
import {
  FILTERS,
  HOMEPAGE_SECTIONS,
  SORT_OPTONS as SORT_OPTIONS,
} from "./constants";
import { Controller } from "./controller";

export class Target
  implements ContentSource, ImageRequestHandler, PageLinkResolver
{
  info: RunnerInfo = {
    id: "com.manganato",
    name: "MangaNato",
    version: 0.3,
    website: "https://manganto.com",
    thumbnail: "manganato.png",
    supportedLanguages: ["en_US"],
    minSupportedAppVersion: "6.0",
    rating: CatalogRating.SAFE,
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

  async willRequestImage(url: string): Promise<NetworkRequest> {
    return {
      url,
      headers: {
        referer: "https://manganato.com",
      },
    };
  }

  // Directory
  async getDirectoryConfig(
    _key?: string | undefined
  ): Promise<DirectoryConfig> {
    return Generate<DirectoryConfig>({
      filters: FILTERS,
      sort: {
        options: SORT_OPTIONS,
        default: {
          id: "topview",
          ascending: false,
        },
        canChangeOrder: false,
      },
    });
  }

  async getDirectory(request: DirectoryRequest): Promise<PagedResult> {
    const results = await this.controller.getDirectoryResults(request);
    return {
      results,
      isLastPage: results.length > 24,
    };
  }

  async getSectionsForPage({ id }: PageLink): Promise<PageSection[]> {
    if (id !== "home") throw new Error(`Cannot handle page, ${id}`);
    return HOMEPAGE_SECTIONS;
  }

  async willResolveSectionsForPage(_link: PageLink): Promise<any> {
    await this.controller.getHomePage();
    return;
  }
  async resolvePageSection(
    _link: PageLink,
    sectionID: string,
    _pageContext?: any
  ): Promise<ResolvedPageSection> {
    return {
      items: await this.controller.resolveHomePageSection(sectionID),
    };
  }
}
