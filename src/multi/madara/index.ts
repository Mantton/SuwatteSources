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
} from "@suwatte/daisuke";
import { ajaxDirectoryRequest, generateExploreSections } from "./utils";
import { Parser } from "./parser";
export abstract class Madara extends Source {
  // Template Variables
  abstract BASE_URL: string;
  CONTENT_TRAVERSAL_PATH: string = "manga";
  GENRE_TRAVERSAL_PATH = "genre";
  HAS_ADVANCED_SEARCH: boolean = true;
  FILTER_NON_MANGA_ITEMS: boolean = true;
  USE_NEW_CHAPTER_ENDPOINT = false;
  OLD_CHAPTER_ENDPOINT_DISABLED = false;
  CHAPTER_LIST_SELECTOR = "a";
  CHAPTER_URL_SUFFIX = "?style=list";
  NON_ADULT_SLUGS: string[] = [];
  ADULT_SLUGS: string[] = ["mature"];
  ADULT_CONTENT_ONLY = false;

  // SELECTORS
  DETAILS_SELECTOR_TITLE = "div.post-title h3, div.post-title h1";
  DETAILS_SELECTOR_AUTHOR = "div.author-content > a";
  DETAILS_SELECTOR_ARTIST = "div.artist-content > a";
  DETAILS_SELECTOR_STATUS = "div.summary-content";
  DETAILS_SELECTOR_SUMMARY =
    "div.description-summary div.summary__content, div.summary_content div.post-content_item > h5 + div, div.summary_content div.manga-excerpt";
  DETAILS_SELECTOR_THUMBNAIL = "div.summary_image img";
  DETAILS_SELECTOR_GENRE = "div.genres-content a";
  DETAILS_SELECTOR_TAG = "div.tags-content a";
  DETAILS_SELECTOR_SERIES_TYPE =
    ".post-content_item:contains(Type) .summary-content";
  DETAILS_ALT_NAME_SELECTOR =
    ".post-content_item:contains(Alt) .summary-content";
  SERIES_TYPE_SELECTOR = ".post-content_item:contains(Type) .summary-content";
  RECOMMENDED_SELECTOR = "row c-row related-manga related-reading-wrap a";
  PAGE_LIST_SELECTOR = "div.page-break > img";
  readonly CLIENT = new NetworkClient();
  readonly COMPLETED_STATUS_LIST = [
    "Completed",
    "Completo",
    "Concluído",
    "Concluido",
    "Terminé",
    "Hoàn Thành",
    "مكتملة",
  ];
  readonly ONGOING_STATUS_LIST = [
    "OnGoing",
    "Продолжается",
    "Updating",
    "Em Lançamento",
    "Em lançamento",
    "Em andamento",
    "Em Andamento",
    "En cours",
    "Ativo",
    "Lançando",
    "Đang Tiến Hành",
    "Devam Ediyor",
    "Devam ediyor",
    "In Corso",
    "In Arrivo",
    "مستمرة",
  ];
  // Methods
  async getContent(contentId: string): Promise<Content> {
    const response = await this.CLIENT.get(
      `${this.BASE_URL}/${this.CONTENT_TRAVERSAL_PATH}/${contentId}/`
    );
    return Parser.parseContent(contentId, response.data, this);
  }
  async getChapters(contentId: string): Promise<Chapter[]> {
    const response = await this.CLIENT.get(
      `${this.BASE_URL}/${this.CONTENT_TRAVERSAL_PATH}/${contentId}/`
    );

    return Parser.parseChapters(this, contentId, response.data);
  }
  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    console.log(contentId, chapterId);
    const response = await this.CLIENT.get(
      `${this.BASE_URL}/${this.CONTENT_TRAVERSAL_PATH}/${contentId}/${chapterId}/?style=list`
    );
    return Parser.parsePages(this, contentId, chapterId, response.data);
  }
  getSearchResults(query: SearchRequest): Promise<PagedResult> {
    throw new Error("Method not implemented.");
  }
  getSourceTags(): Promise<Property[]> {
    throw new Error("Method not implemented.");
  }

  // Explore Page
  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    return generateExploreSections();
  }

  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    const request = ajaxDirectoryRequest(this.BASE_URL, 1, excerpt.id);
    const response = await this.CLIENT.request(request);
    const highlights = Parser.parseAjaxDirectoryResponse(
      response.data,
      this.BASE_URL,
      this.CONTENT_TRAVERSAL_PATH
    );
    return {
      ...excerpt,
      highlights,
    };
  }

  async willRequestImage(request: NetworkRequest): Promise<NetworkRequest> {
    request.headers = {
      ...request.headers,
      Referer: this.BASE_URL + "/",
    };
    return request;
  }
}
