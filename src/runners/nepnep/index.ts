import {
  Chapter,
  ChapterData,
  CollectionExcerpt,
  Content,
  ExploreCollection,
  ExploreTag,
  Filter,
  PagedResult,
  PreferenceGroup,
  Property,
  SearchRequest,
  SearchSort,
  SelectPreference,
  Source,
  SourceInfo,
} from "@suwatte/daisuke";
import { sampleSize } from "lodash";
import {
  ADULT_TAGS,
  BASE_EXPLORE_COLLECTIONS,
  NEPNEP_DOMAINS,
  SEARCH_SORTERS,
} from "./constants";
import { Controller } from "./controller";

export class Target extends Source {
  info: SourceInfo = {
    id: "m.nepnep",
    website: "https://mangasee123.com",
    version: 1.3,
    name: "NepNep",
    supportedLanguages: ["EN_US"],
    nsfw: false,
    authors: ["Mantton"],
    thumbnail: "nepnep.png",
    minSupportedAppVersion: "5.0",
  };
  private controller = new Controller();

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

  async getSourceTags(): Promise<Property[]> {
    const filters = await this.controller.getFilters();
    return filters
      .map((v) => ({
        id: v.id,
        label: v.title,
        tags: (v.options ?? []).map((v) => ({
          ...v,
          adultContent: ADULT_TAGS.includes(v.id),
        })),
      }))
      .filter((v) => v.tags.length != 0);
  }

  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    // Refresh
    return BASE_EXPLORE_COLLECTIONS;
  }

  willResolveExploreCollections(): Promise<void> {
    return this.controller.fetchHomePage();
  }

  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    return await this.controller.resolveExcerpt(excerpt);
  }

  async getExplorePageTags(): Promise<ExploreTag[]> {
    const tags = (await this.getSourceTags())[0].tags.filter(
      (v) => !v.adultContent
    );
    const selected = sampleSize(tags, 7);

    return selected.map((v) => ({
      ...v,
      request: { filters: [{ id: "genres", included: [v.id] }] },
    }));
  }
  // Searching
  async getSearchSorters(): Promise<SearchSort[]> {
    return SEARCH_SORTERS;
  }

  async getSearchFilters(): Promise<Filter[]> {
    return this.controller.getFilters();
  }

  async getSearchResults(query: SearchRequest): Promise<PagedResult> {
    return this.controller.getSearchResults(query);
  }

  // Preference
  async getSourcePreferences(): Promise<PreferenceGroup[]> {
    const store = new ObjectStore();
    return [
      {
        id: "general",
        header: "General",
        children: [
          new SelectPreference({
            key: "host",
            label: "NepNep Site",
            options: NEPNEP_DOMAINS.map((v) => ({
              label: v.name,
              value: v.id,
            })),
            value: {
              get: async () => {
                const stored = await store.string("n_host");
                const def = NEPNEP_DOMAINS[0].id;
                if (!stored) return def;
                return NEPNEP_DOMAINS.find((v) => v.id == stored)?.id ?? def;
              },
              set: async (value) => {
                return store.set("n_host", value);
              },
            },
          }),
        ],
      },
    ];
  }
}
