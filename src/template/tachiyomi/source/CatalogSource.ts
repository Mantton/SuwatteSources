import {
  ChapterData,
  DirectoryFilter,
  DirectoryRequest,
  PagedResult,
} from "@suwatte/daisuke";
import { TachiSource } from "./Source";

export abstract class TachiCatalogSource extends TachiSource {
  abstract lang: string;
  abstract supportsLatest: boolean;

  abstract getPopularManga(page: number): Promise<PagedResult>;
  abstract getSearchManga(request: DirectoryRequest): Promise<PagedResult>;
  abstract getLatestManga(page: number): Promise<PagedResult>;
  abstract getPageList(manga: string, chapter: string): Promise<ChapterData>;
  abstract getFilterList(): Promise<DirectoryFilter[]>;
}
