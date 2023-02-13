import {
  Chapter,
  ChapterData,
  CollectionExcerpt,
  Content,
  ExploreCollection,
  ExploreTag,
  Filter,
  FilterType,
  PagedResult,
  Property,
  SearchRequest,
  SearchSort,
  Tag,
} from "@suwatte/daisuke";
import { load } from "cheerio";
import { sampleSize } from "lodash";
import { AJAX_DIRECTORY } from "./constants";
import { Parser } from "./parser";
import { Context } from "./types";
import { AJAXDirectoryRequest } from "./utils";

export class Controller {
  context: Context;
  client = new NetworkClient();
  parser = new Parser();
  constructor(ctx: Context) {
    this.context = ctx;
  }

  // Resolve Explore Collection
  async getCollection(excerpt: CollectionExcerpt): Promise<ExploreCollection> {
    const request = AJAXDirectoryRequest(this.context, {
      sort: excerpt.id,
    });
    const response = await this.client.request(request);
    const highlights = this.parser.AJAXResponse(this.context, response.data);

    return { ...excerpt, highlights };
  }
  // Get Content
  async getContent(id: string): Promise<Content> {
    const response = await this.client.get(
      `${this.context.baseUrl}/${this.context.contentPath}/${id}/`
    );

    return this.parser.content(this.context, response.data, id);
  }

  // Get Chapters
  async getChapters(id: string): Promise<Chapter[]> {
    const response = await this.client.get(
      `${this.context.baseUrl}/${this.context.contentPath}/${id}/`
    );
    return this.parser.chapters(this.context, response.data, id);
  }

  // Get Chapter Data
  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const response = await this.client.get(
      `${this.context.baseUrl}/${this.context.contentPath}/${contentId}/${chapterId}`
    );

    return this.parser.chapterData(
      this.context,
      contentId,
      chapterId,
      response.data
    );
  }

  async getTags(): Promise<Property> {
    // parseGenres;
    const response = await this.client.get(
      `${this.context.baseUrl}/?s=genre&post_type=wp-manga`
    );
    const tags = this.parser.genres(this.context, response.data);
    return {
      id: "genres",
      label: "Genres",
      tags,
    };
  }

  async getExploreTags(): Promise<ExploreTag[]> {
    const tags = (await this.getTags()).tags;
    return sampleSize(tags, 7).map((v) => ({ ...v, filterId: "genres" }));
  }

  async getFilters(): Promise<Filter[]> {
    const main: Filter = {
      id: "genres",
      title: "Genres",
      type: FilterType.MULTISELECT,
      options: (await this.getTags()).tags,
    };

    const adult: Filter = {
      id: "adult",
      title: "Adult Content",
      type: FilterType.SELECT,
      options: [
        {
          id: "all",
          label: "Show All",
        },
        {
          id: "hidden",
          label: "Hide Adult Titles",
        },
        {
          id: "only",
          label: "Show Only Adult Content",
        },
      ],
    };
    return [main, adult];
  }

  // Search
  async handleSearch(request: SearchRequest): Promise<PagedResult> {
    const loadMore = this.context.useLoadMoreSearch;
    return loadMore
      ? this.searchWithLoadMore(request)
      : this.searchWithQueryParams(request);
  }

  async searchWithQueryParams(request: SearchRequest): Promise<PagedResult> {
    const base = `${this.context.baseUrl}/page/${request.page ?? 1}/`;
    const params: Record<string, any> = {
      s: request.query,
      post_type: "wp-manga",
    };
    for (const filter of request.filters ?? []) {
      switch (filter.id) {
        case "genres":
          if (!filter.included) break;
          params["genres[]"] = filter.included;
          break;
        case "adult":
          if (!filter.included || !filter.included[0]) break; // Guard
          params["adult"] = filter.included[0] == "hidden" ? "0" : "1";
          break;
      }
    }

    const response = await this.client.get(base, {
      params,
    });

    const data = this.parser.searchResponse(
      this.context,
      response.data,
      request.page ?? 1
    );

    return data;
  }
  async searchWithLoadMore(request: SearchRequest): Promise<PagedResult> {
    const net = AJAXDirectoryRequest(this.context, request, true);
    const response = await this.client.request(net);
    const highlights = this.parser.AJAXResponse(this.context, response.data);
    return {
      results: highlights,
      isLastPage: highlights.length <= 18,
      page: request.page ?? 1,
    };
  }

  getSorters(): SearchSort[] {
    if (this.context.useLoadMoreSearch) {
      return [
        {
          label: "Popularity",
          id: AJAX_DIRECTORY.POPULAR_AT,
        },
        {
          label: "Top Monthly",
          id: AJAX_DIRECTORY.TRENDING_MONTHLY,
        },
        {
          label: "Top Daily",
          id: AJAX_DIRECTORY.TRENDING_DAILY,
        },
        {
          label: "Rating",
          id: AJAX_DIRECTORY.TOP_RATED,
        },
        {
          label: "New",
          id: AJAX_DIRECTORY.NEW,
        },
        {
          label: "Name",
          id: AJAX_DIRECTORY.NAME,
        },
      ];
    }
    return [
      {
        label: "Views",
        id: "views",
      },
      {
        label: "Rating",
        id: "rating",
      },
      {
        label: "Trending",
        id: "trending",
      },
      {
        label: "Latest",
        id: "latest",
      },
      {
        label: "New",
        id: "new-manga",
      },
      {
        label: "Name",
        id: "alphabet",
      },
    ];
  }
}
