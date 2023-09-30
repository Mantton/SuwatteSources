"stt_env wk";

import {
  CatalogRating,
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  DirectoryConfig,
  DirectoryRequest,
  Form,
  PageLink,
  PageLinkResolver,
  PageSection,
  PagedResult,
  Property,
  ResolvedPageSection,
  RunnerInfo,
  RunnerPreferenceProvider,
  UIPicker,
} from "@suwatte/daisuke";
import { ADULT_TAGS, NEPNEP_DOMAINS, SEARCH_SORTERS } from "./constants";
import { Controller } from "./controller";

export class Target
  implements ContentSource, PageLinkResolver, RunnerPreferenceProvider
{
  info: RunnerInfo = {
    id: "m.nepnep",
    website: "https://mangasee123.com",
    version: 1.6,
    name: "NepNep",
    supportedLanguages: ["EN_US"],
    thumbnail: "nepnep.png",
    minSupportedAppVersion: "6.0",
    rating: CatalogRating.MIXED,
  };
  private controller = new Controller();

  // Core
  async getContent(contentId: string): Promise<Content> {
    return this.controller.getContent(contentId);
  }
  async getChapters(contentId: string): Promise<Chapter[]> {
    return this.controller.getChapters(contentId);
  }
  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    return this.controller.getChapterData(contentId, chapterId);
  }

  async getTags?(): Promise<Property[]> {
    const filters = await this.controller.getFilters();
    return filters
      .map(({ id, title, options }) => ({
        id,
        title,
        tags: (options ?? []).map((v) => ({
          id: v.id,
          title: v.title,
          nsfw: ADULT_TAGS.includes(v.id),
        })),
      }))
      .filter((v) => v.tags.length != 0);
  }

  // Directory
  getDirectory(request: DirectoryRequest): Promise<PagedResult> {
    return this.controller.getSearchResults(request);
  }

  async getDirectoryConfig(): Promise<DirectoryConfig> {
    return {
      sort: {
        options: SEARCH_SORTERS,
        canChangeOrder: true,
        default: {
          id: "views_all",
          ascending: false,
        },
      },
      filters: await this.controller.getFilters(),
    };
  }

  // Page Links

  async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
    const key = link.id;
    if (key !== "home") throw new Error("invalid page.");
    return this.controller.buildHomePageSections();
  }

  resolvePageSection(
    _link: PageLink,
    _sectionKey: string
  ): Promise<ResolvedPageSection> {
    throw new Error("already resolved");
  }

  // Preferences
  async getPreferenceMenu(): Promise<Form> {
    return {
      sections: [
        {
          header: "General",
          children: [
            UIPicker({
              id: "host",
              title: "Website",
              options: NEPNEP_DOMAINS.map(({ name: title, id }) => ({
                title,
                id,
              })),
              value:
                (await ObjectStore.string("n_host")) ?? NEPNEP_DOMAINS[0].id,
              async didChange(value) {
                return ObjectStore.set("n_host", value);
              },
            }),
          ],
        },
      ],
    };
  }
}
