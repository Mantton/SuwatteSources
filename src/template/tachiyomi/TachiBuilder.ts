import {
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  DirectoryConfig,
  DirectoryRequest,
  NetworkClientBuilder,
  PagedResult,
  RunnerInfo,
} from "@suwatte/daisuke";
import { TachiTemplate } from "./TachiTemplate";

export class TachiBuilder implements ContentSource {
  info: RunnerInfo;
  source: TachiTemplate;
  client: NetworkClient;

  constructor(info: RunnerInfo, template: new () => TachiTemplate) {
    this.info = info;
    this.source = new template();

    const headers = this.source.headersBuilder();

    if (Object.keys(headers).length) {
      const builder = new NetworkClientBuilder();

      for (const [k, v] of Object.entries(headers)) {
        builder.addHeader(k, v);
      }
      this.client = builder.build();
    } else {
      this.client = new NetworkClient();
    }
  }

  async getContent(contentId: string): Promise<Content> {
    const request = this.source.mangaDetailsRequest(contentId);
    const { data: response } = await this.client.request(request);
    const content = this.source.parseMangaDetails(response);
    return content;
  }

  async getChapters(contentId: string): Promise<Chapter[]> {
    const request = this.source.chapterListRequest(contentId);
    const { data: response } = await this.client.request(request);
    const chapters = this.source.parseChapterList(response);
    return chapters;
  }

  async getChapterData(_: string, chapterId: string): Promise<ChapterData> {
    const request = this.source.pageListRequest(chapterId);
    const { data: response } = await this.client.request(request);
    const data = this.source.parsePageList(response);
    return data;
  }
  async getDirectory(search: DirectoryRequest): Promise<PagedResult> {
    if (
      !search.query &&
      !search.filters &&
      (search.sort?.id === "popular" || search.sort?.id === "latest")
    ) {
      const isPopular = search.sort?.id === "popular";
      const request = isPopular
        ? this.source.popularMangaRequest(search.page)
        : this.source.latestUpdatesRequest(search.page);
      const { data: response } = await this.client.request(request);
      const result = isPopular
        ? this.source.parsePopularManga(response)
        : this.source.parseLatestManga(response);
      return result;
    } else {
      const request = this.source.searchMangaRequest(
        search.page,
        search.query ?? "",
        search.filters ?? {}
      );

      const { data: response } = await this.client.request(request);
      const result = this.source.parseSearchManga(response, search);
      return result;
    }
  }
  async getDirectoryConfig(_: string | undefined): Promise<DirectoryConfig> {
    return {
      sort: {
        default: { id: "popular" },
        options: (() => {
          const options = [
            {
              id: "popular",
              title: "Popular",
            },
          ];
          if (this.source.supportsLatest) {
            options.push({
              id: "latest",
              title: "Latest",
            });
          }
          return options;
        })(),
      },
    };
  }
}
