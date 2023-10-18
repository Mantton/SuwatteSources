import { load } from "cheerio";
import { AJAX_DIRECTORY } from "./constants";
import { Parser } from "./parser";
import { Context } from "./types";
import { AJAXDirectoryRequest } from "./utils";
import {
  Content,
  Chapter,
  ChapterData,
  Property,
  FilterType,
  PagedResult,
  DirectoryFilter,
  DirectoryRequest,
  Option,
  ResolvedPageSection,
  NetworkClientBuilder,
} from "@suwatte/daisuke";

export class Controller {
  context: Context;
  client: NetworkClient;
  parser = new Parser();
  constructor(ctx: Context) {
    this.context = ctx;

    let builder = new NetworkClientBuilder();

    if (this.context.requestInterceptors) {
      for (const interceptor of this.context.requestInterceptors) {
        builder = builder.addRequestInterceptor(interceptor);
      }
    }
    this.client = builder.build();
  }

  // Resolve Explore Collection
  async getCollection(id: string): Promise<ResolvedPageSection> {
    const request = AJAXDirectoryRequest(this.context, {
      sort: {
        id,
        ascending: false,
      },
      page: 1,
    });
    const response = await this.client.request(request);
    const highlights = this.parser.AJAXResponse(this.context, response.data);

    return { items: highlights };
  }
  // Get Content
  async getContent(id: string): Promise<Content> {
    const url = `${this.context.baseUrl}/${this.context.contentPath}/${id}/`;
    const response = await this.client.get(url);

    return {
      ...this.parser.content(this.context, response.data, id),
      webUrl: url,
    };
  }

  // Get Chapters
  async getChapters(id: string): Promise<Chapter[]> {
    const url = `${this.context.baseUrl}/${this.context.contentPath}/${id}/`;
    const response = await this.client.get(url);

    const $ = load(response.data);
    const wrapper = $("div[id^=manga-chapters-holder]");
    const elements = $(this.context.chapterSelector).toArray();

    if (elements.length == 0 && wrapper.length != 0) {
      const { data } = await this.client.post(url + "ajax/chapters", {
        headers: {
          Referer: `${this.context.baseUrl}/`,
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      return this.parser.chapters(this.context, data, id);
    } else {
      return this.parser.chapters(this.context, response.data, id);
    }
  }

  // Get Chapter Data
  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const response = await this.client.get(
      `${this.context.baseUrl}/${this.context.contentPath}/${contentId}/${chapterId}`
    );

    return this.parser.chapterData(this.context, response.data);
  }

  async getTags(): Promise<Property> {
    // parseGenres;
    const response = await this.client.get(
      `${this.context.baseUrl}/?s=genre&post_type=wp-manga`
    );
    const tags = this.parser.genres(this.context, response.data);
    return {
      id: "genres",
      title: "Genres",
      tags,
    };
  }

  async getFilters(): Promise<DirectoryFilter[]> {
    const main: DirectoryFilter = {
      id: "genres",
      title: "Genres",
      type: FilterType.MULTISELECT,
      options: (await this.getTags()).tags,
    };

    const adult: DirectoryFilter = {
      id: "adult",
      title: "Adult Content",
      type: FilterType.SELECT,
      options: [
        {
          id: "all",
          title: "Show All",
        },
        {
          id: "hidden",
          title: "Hide Adult Titles",
        },
        {
          id: "only",
          title: "Show Only Adult Content",
        },
      ],
    };
    return [main, adult];
  }

  // Search
  async handleSearch(request: DirectoryRequest): Promise<PagedResult> {
    const loadMore = this.context.useLoadMoreSearch;
    return loadMore
      ? this.searchWithLoadMore(request)
      : this.searchWithQueryParams(request);
  }

  async searchWithQueryParams(request: DirectoryRequest): Promise<PagedResult> {
    const base = `${this.context.baseUrl}/search/page/${request.page ?? 1}/`;
    const params: Record<string, any> = {
      s: "",
      m_orderby: request.sort?.id ?? "views",
      ...(request.query && {
        s: request.query,
      }),
    };
    const genres = request.filters?.genres ?? [];
    params["genre[]"] = genres;

    const adult = request.filters?.adult === "hidden" ? "0" : "1";
    params["adult"] = adult;

    const response = await this.client.get(base, {
      params,
    });
    const data = this.parser.searchResponse(this.context, response.data);

    return data;
  }
  async searchWithLoadMore(request: DirectoryRequest): Promise<PagedResult> {
    const net = AJAXDirectoryRequest(this.context, request, true);
    const response = await this.client.request(net);
    const highlights = this.parser.AJAXResponse(this.context, response.data);
    return {
      results: highlights,
      isLastPage: highlights.length <= 18,
    };
  }

  getSorters(): Option[] {
    if (this.context.useLoadMoreSearch) {
      return [
        {
          title: "Popularity",
          id: AJAX_DIRECTORY.POPULAR_AT,
        },
        {
          title: "Top Monthly",
          id: AJAX_DIRECTORY.TRENDING_MONTHLY,
        },
        {
          title: "Top Daily",
          id: AJAX_DIRECTORY.TRENDING_DAILY,
        },
        {
          title: "Rating",
          id: AJAX_DIRECTORY.TOP_RATED,
        },
        {
          title: "New",
          id: AJAX_DIRECTORY.NEW,
        },
        {
          title: "Name",
          id: AJAX_DIRECTORY.NAME,
        },
      ];
    }
    return [
      {
        title: "Views",
        id: "views",
      },
      {
        title: "Rating",
        id: "rating",
      },
      {
        title: "Trending",
        id: "trending",
      },
      {
        title: "Latest",
        id: "latest",
      },
      {
        title: "New",
        id: "new-manga",
      },
      {
        title: "Name",
        id: "alphabet",
      },
    ];
  }
}
