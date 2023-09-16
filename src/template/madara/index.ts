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
  Property,
  RunnerInfo,
  SourceConfig,
} from "@suwatte/daisuke";
import { Controller } from "./controller";
import { Context } from "./types";

export abstract class MadaraTemplate
  implements ContentSource, ImageRequestHandler
{
  context: Context;
  protected controller: Controller;
  info!: RunnerInfo;
  config?: SourceConfig | undefined;

  constructor(ctx: Context) {
    this.context = ctx;
    this.controller = new Controller(ctx);
  }
  async willRequestImage(url: string): Promise<NetworkRequest> {
    return {
      url,
      headers: { Referer: this.context.baseUrl + "/" },
    };
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

  //
  async getTags(): Promise<Property[]> {
    const main = await this.controller.getTags();
    return [main];
  }

  getDirectory(request: DirectoryRequest): Promise<PagedResult> {
    return this.controller.handleSearch(request);
  }
  async getDirectoryConfig(
    _configID?: string | undefined
  ): Promise<DirectoryConfig> {
    return {};
  }
}
