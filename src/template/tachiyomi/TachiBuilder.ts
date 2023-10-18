import {
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  DirectoryConfig,
  DirectoryRequest,
  ImageRequestHandler,
  NetworkRequest,
  PagedResult,
  RunnerInfo,
} from "@suwatte/daisuke";
import { TachiHttpSource } from "./source";

export class TachiBuilder implements ContentSource, ImageRequestHandler {
  info: RunnerInfo;
  source: TachiHttpSource;

  constructor(info: RunnerInfo, template: new () => TachiHttpSource) {
    this.source = new template();
    this.info = {
      ...info,
      supportedLanguages: [this.source.lang],
      website: this.source.baseUrl,
    };
  }

  async getContent(contentId: string): Promise<Content> {
    const content = await this.source.getMangaDetails(contentId);
    return {
      ...content,
      webUrl: this.source.getMangaURL(contentId),
    };
  }

  async getChapters(contentId: string): Promise<Chapter[]> {
    return this.source.getMangaChapters(contentId);
  }

  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    return this.source.getPageList(contentId, chapterId);
  }
  async getDirectory(search: DirectoryRequest): Promise<PagedResult> {
    if (
      !search.query &&
      !search.filters &&
      (search.listId === "template_popular_list" ||
        search.listId === "template_latest_list")
    ) {
      const isPopular = search.listId === "template_popular_list";
      return isPopular
        ? this.source.getPopularManga(search.page)
        : this.source.getLatestManga(search.page);
    } else {
      return this.source.getSearchManga(search);
    }
  }

  async getDirectoryConfig(_: string | undefined): Promise<DirectoryConfig> {
    const definedSortOptions = await this.source.getSortOptions();
    const getLists = () => {
      const options = [
        {
          id: "template_popular_list",
          title: "Popular Titles",
        },
      ];
      if (this.source.supportsLatest) {
        options.push({
          id: "template_latest_list",
          title: "Latest Titles",
        });
      }
      return options;
    };
    return {
      lists: getLists(),
      sort: {
        options: definedSortOptions,
      },
      filters: await this.source.getFilterList(),
    };
  }

  // * Image Request Handler
  async willRequestImage(imageURL: string): Promise<NetworkRequest> {
    return this.source.imageRequest(imageURL);
  }
}
