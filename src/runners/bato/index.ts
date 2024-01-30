import {
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  DirectoryConfig,
  DirectoryRequest,
  PagedResult,
  Property,
  RunnerInfo,
} from "@suwatte/daisuke";
import { SORTERS } from "./constants";
import { Controller } from "./controller";

export class Target implements ContentSource {
  info: RunnerInfo = {
    id: "to.bato",
    name: "Bato",
    version: 0.4,
    website: "https://bato.to",
    supportedLanguages: [],
    thumbnail: "bato.png",
    minSupportedAppVersion: "5.0",
  };

  private controller = new Controller();
  getContent(contentId: string): Promise<Content> {
    return this.controller.getContent(contentId);
  }
  getChapters(contentId: string): Promise<Chapter[]> {
    return this.controller.getChapters(contentId);
  }
  getChapterData(contentId: string, chapterId: string): Promise<ChapterData> {
    return this.controller.getChapterData(chapterId);
  }

  async getTags?(): Promise<Property[]> {
    return this.controller.getProperties();
  }

  getDirectory(request: DirectoryRequest): Promise<PagedResult> {
    return this.controller.getSearchResults(request);
  }
  async getDirectoryConfig(
    _configID?: string | undefined
  ): Promise<DirectoryConfig> {
    return {
      filters: this.controller.getFilters(),
      sort: {
        options: SORTERS,
        canChangeOrder: false,
      },
    };
  }

  // async getUserPreferences(): Promise<PreferenceGroup[]> {
  //   const store = new ObjectStore();

  //   return [
  //     {
  //       id: "language",
  //       children: [
  //         new MultiSelectPreference({
  //           label: "Languages",
  //           key: "n_content_search_langs",
  //           options: LANG_TAGS.map((v) => ({ label: v.label, value: v.id })),
  //           value: {
  //             get: async () => {
  //               return (
  //                 ((await store.get("n_content_search_langs")) as
  //                   | string[]
  //                   | null) ?? ["en"]
  //               );
  //             },
  //             set: async (v) => {
  //               return await store.set("n_content_search_langs", v);
  //             },
  //           },
  //         }),
  //       ],
  //     },
  //   ];
  // }
}
