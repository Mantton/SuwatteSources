import {
  Chapter,
  ChapterData,
  CollectionExcerpt,
  Content,
  ExploreCollection,
  Filter,
  FilterType,
  NetworkRequest,
  PagedResult,
  PreferenceGroup,
  PreferenceType,
  Property,
  SearchRequest,
  SearchSort,
  Source,
  SourceInfo,
} from "@suwatte/daisuke";
import {
  EXPLORE_COLLECTIONS,
  getProperties,
  LANGUAGE_OPTIONS,
  SORT_OPTIONS,
} from "./constants";
import { MangaExcerpt } from "./types";
import {
  CKChapterToChapter,
  MangaToContent,
  MangaToHighlight,
  MDComicToHighlight,
  parseSearchRequest,
} from "./utilts";

export class Target extends Source {
  info: SourceInfo = {
    id: "app.comick",
    name: "ComicK",
    version: 0.1,
    website: "https://comick.app/home",
    supportedLanguages: [],
    nsfw: false,
    thumbnail: "comick.png",
    minSupportedAppVersion: "4.6.0",
  };

  private client = new NetworkClient();
  private store = new ValueStore();
  private API_URL = "https://api.comick.fun";

  async getContent(contentId: string): Promise<Content> {
    const data = await this.getManga(contentId);
    const content = MangaToContent(data, contentId);
    return content;
  }
  async getChapters(contentId: string): Promise<Chapter[]> {
    const manga = await this.getManga(contentId);
    const { chapter_count: limit, hid } = manga.comic;

    if (!limit || !hid) throw new Error("Could Not Get Chapter Count");

    const url = `${this.API_URL}/comic/${hid}/chapters`;
    const lang = await this.store.get("content_lang");
    const { data: response } = await this.client.get(url, {
      params: {
        ...(lang && lang !== "all" && { lang }),
        ...{ tachiyomi: "true", limit },
      },
    });

    const { chapters: data } = JSON.parse(response);
    const chapters: Chapter[] = data.map((v: any, index: number) => ({
      ...CKChapterToChapter(v),
      contentId,
      index,
    }));
    return chapters;
  }
  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const url = `${this.API_URL}/chapter/${chapterId}?tachiyomi=true`;
    const { data } = await this.client.get(url);
    const images: any[] = JSON.parse(data).chapter.images;

    const pages = images.map((v) => ({ url: v.url }));
    return {
      contentId,
      chapterId,
      pages,
    };
  }
  async getSearchResults(query: SearchRequest): Promise<PagedResult> {
    const { queryString, core: params } = parseSearchRequest(query);
    const url = `${this.API_URL}/v1.0/search?${queryString.replace("&", "")}`;
    const response = await this.client.get(url, { params });
    const data: MangaExcerpt[] = JSON.parse(response.data);
    return {
      page: query.page ?? 1,
      results: data.map((v) => MangaToHighlight(v)),
      isLastPage: data.length < 30,
    };
  }
  async getSourceTags(): Promise<Property[]> {
    return getProperties();
  }

  async getUserPreferences(): Promise<PreferenceGroup[]> {
    return [
      {
        id: "lang",
        header: "Language",
        children: [
          {
            key: "content_lang",
            label: "Language",
            type: PreferenceType.select,
            defaultValue: "en",
            options: LANGUAGE_OPTIONS,
          },
        ],
        footer: "Languages in which chapters will be available",
      },
    ];
  }

  async getSearchSorters(): Promise<SearchSort[]> {
    return SORT_OPTIONS;
  }

  async getSearchFilters(): Promise<Filter[]> {
    const properties = getProperties();
    return [
      {
        id: "content_type",
        title: "Content Type",
        type: FilterType.SELECT,
        options: properties[0].tags,
      },
      {
        id: "demographic",
        title: "Demographic",
        type: FilterType.MULTISELECT,
        options: properties[1].tags,
      },
      {
        id: "genres",
        title: "Genres",
        type: FilterType.EXCLUDABLE_MULTISELECT,
        options: properties[2].tags,
      },
      {
        id: "completed",
        title: "Content Status",
        label: "Completed",
        type: FilterType.TOGGLE,
      },
    ];
  }

  // Helpers
  async getManga(slug: string) {
    const url = `${this.API_URL}/comic/${slug}`;
    const response = await this.client.get(url, {
      params: { tachiyomi: "true" },
    });
    return JSON.parse(response.data);
  }

  async willRequestImage(request: NetworkRequest): Promise<NetworkRequest> {
    request.headers = {
      ...request.headers,
      referer: "https://comic.app/",
    };

    return request;
  }

  // Explore Page
  private homepage: any;
  async willResolveExploreCollections(): Promise<void> {
    const { data } = await this.client.get("https://comick.app/home");
    const str = data
      .split(`<script id="__NEXT_DATA__" type="application/json">`)
      .pop()
      ?.split("</script>")?.[0];

    if (!str) throw new Error("Could not find Homepage JSON");
    this.homepage = JSON.parse(str).props.pageProps;
  }

  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    return EXPLORE_COLLECTIONS;
  }

  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    let highlights: any;
    switch (excerpt.id) {
      case "hot_updates":
        return {
          ...excerpt,
          highlights: await this.getUpdateHighlights(true),
        };
      case "recently_added":
        highlights = this.homepage.news.map((v: any) => MDComicToHighlight(v));
        return { ...excerpt, highlights };
      case "most_viewed_7":
        highlights = this.homepage.trending["7"].map((v: any) =>
          MDComicToHighlight(v)
        );
        return { ...excerpt, highlights };
      case "most_viewed_30":
        highlights = this.homepage.trending["30"].map((v: any) =>
          MDComicToHighlight(v)
        );
        return { ...excerpt, highlights };
      case "popular_new_7":
        highlights = this.homepage.topFollowNewComics["7"].map((v: any) =>
          MDComicToHighlight(v)
        );
        return { ...excerpt, highlights };
      case "popular_new_30":
        highlights = this.homepage.topFollowNewComics["30"].map((v: any) =>
          MDComicToHighlight(v)
        );
        return { ...excerpt, highlights };
      case "completed":
        highlights = this.homepage.completions.map((v: any) =>
          MDComicToHighlight(v)
        );
        return { ...excerpt, highlights };

      case "recently_followed":
        highlights = this.homepage.follows.map((v: any) =>
          MDComicToHighlight(v.md_comics)
        );
        return { ...excerpt, highlights };

      case "popular_ongoing":
        highlights = this.homepage.rank.map((v: any) => MDComicToHighlight(v));
        return { ...excerpt, highlights };

      case "upcoming":
        highlights = this.homepage.recentRank.map((v: any) =>
          MDComicToHighlight(v)
        );
        return { ...excerpt, highlights };

      case "top_followed_7":
        highlights = this.homepage.topFollowComics["7"].map((v: any) =>
          MDComicToHighlight(v)
        );
        return { ...excerpt, highlights };
      case "top_followed_30":
        highlights = this.homepage.topFollowComics["30"].map((v: any) =>
          MDComicToHighlight(v)
        );
        return { ...excerpt, highlights };
      case "latest":
        return {
          ...excerpt,
          highlights: await this.getUpdateHighlights(false),
        };
    }
    throw "Not Ready";
  }

  async getUpdateHighlights(hot: boolean) {
    const { data: str } = await this.client.get(
      "https://api.comick.app/chapter",
      {
        params: {
          page: "1",
          order: hot ? "hot" : "new",
        },
      }
    );

    const data = JSON.parse(str)?.map((v: any) =>
      MDComicToHighlight(v.md_comics)
    );
    return data;
  }
}

// Homepage
// Chapter Info is in :
// https://api.comick.app/chapter?page=1&order=hot&limit=60 -> Hot Updates
// https://api.comick.app/chapter?page=1&order=new&limit=30 -> New Updates
// Core data  is in : __NEXT_DATA__;
