import {
  Chapter,
  ChapterData,
  Content,
  ContentSource,
  DirectoryConfig,
  DirectoryFilter,
  DirectoryRequest,
  FilterType,
  Form,
  ImageRequestHandler,
  NetworkRequest,
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
import {
  EXPLORE_COLLECTIONS as HOMEPAGE_COLLECTIONS,
  getProperties,
  LANGUAGE_OPTIONS,
  SORT_OPTIONS,
} from "./constants";
import { HomePageProps, MangaExcerpt } from "./types";
import {
  CKChapterToChapter,
  MangaToContent,
  MangaToHighlight,
  MDComicToHighlight,
  parseSearchRequest,
} from "./utilts";

export class Target
  implements
    ContentSource,
    ImageRequestHandler,
    RunnerPreferenceProvider,
    PageLinkResolver
{
  info: RunnerInfo = {
    id: "app.comick",
    name: "ComicK",
    version: 0.54,
    website: "https://comick.io/home",
    supportedLanguages: [],
    thumbnail: "comick.png",
    minSupportedAppVersion: "5.0",
  };

  private client = new NetworkClient();
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
    const lang = (await ObjectStore.string("chapter_lang")) ?? "en";
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
    _contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const url = `${this.API_URL}/chapter/${chapterId}?tachiyomi=true`;
    const { data } = await this.client.get(url);
    const images: any[] = JSON.parse(data).chapter.images;

    const pages = images.map((v) => ({ url: v.url }));
    return {
      pages,
    };
  }

  async getTags?(): Promise<Property[]> {
    return getProperties();
  }
  async getDirectory(request: DirectoryRequest): Promise<PagedResult> {
    const { queryString, core: params } = parseSearchRequest(request);
    const url = `${this.API_URL}/v1.0/search?${queryString.replace("&", "")}`;
    const response = await this.client.get(url, { params });
    const data: MangaExcerpt[] = JSON.parse(response.data);
    return {
      results: data.map((v) => MangaToHighlight(v)),
      isLastPage: data.length < 30,
    };
  }
  async getDirectoryConfig(
    _configID?: string | undefined
  ): Promise<DirectoryConfig> {
    return {
      filters: await this.getSearchFilters(),
      sort: {
        options: SORT_OPTIONS,
        canChangeOrder: false,
        default: {
          id: "user_follow_count",
          ascending: false,
        },
      },
    };
  }

  async getPreferenceMenu(): Promise<Form> {
    return {
      sections: [
        {
          header: "Languages",
          footer: "Language in which chapters will be available",
          children: [
            UIPicker({
              id: "chapter_lang",
              title: "Content Languages",
              options: LANGUAGE_OPTIONS,
              value: (await ObjectStore.string("chapter_lang")) ?? "en",
              async didChange(value) {
                return ObjectStore.set("chapter_lang", value);
              },
            }),
          ],
        },
      ],
    };
  }

  async getSearchFilters(): Promise<DirectoryFilter[]> {
    const properties = getProperties();
    return [
      {
        id: "content_type",
        title: "Content Type",
        type: FilterType.MULTISELECT,
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
        title: "Is Completed",
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

  async willRequestImage(url: string): Promise<NetworkRequest> {
    return {
      url,
      headers: {
        referer: "https://comick.io/",
      },
    };
  }
  // Home Page
  async getSectionsForPage(link: PageLink): Promise<PageSection[]> {
    if (link.id !== "home") throw new Error("Page not found");
    return HOMEPAGE_COLLECTIONS;
  }
  private homepage: HomePageProps | undefined;

  async willResolveSectionsForPage(_link: PageLink): Promise<any> {
    const { data } = await this.client.get("https://comick.io/home");
    const str = data
      .split(`<script id="__NEXT_DATA__" type="application/json">`)
      .pop()
      ?.split("</script>")?.[0];
    if (!str) throw new Error("Could not find Homepage JSON");
    this.homepage = JSON.parse(str).props.pageProps.data;
  }

  async resolvePageSection(
    _link: PageLink,
    sectionID: string,
    _pageContext?: any
  ): Promise<ResolvedPageSection> {
    if (!this.homepage) throw new Error("Homepage has not been retrieved");

    switch (sectionID) {
      case "hot_updates":
        return { items: await this.getUpdateHighlights(true) };
      case "recently_added":
        return { items: this.homepage.news.map(MDComicToHighlight) };
      case "most_viewed_30":
        return { items: this.homepage.trending["30"].map(MDComicToHighlight) };
      case "popular_new_7":
        return {
          items: this.homepage.topFollowNewComics["7"].map(MDComicToHighlight),
        };
      case "popular_new_30":
        return {
          items: this.homepage.topFollowNewComics["30"].map(MDComicToHighlight),
        };
      case "completed":
        return {
          items: this.homepage.completions.map(MDComicToHighlight),
        };

      case "recently_followed":
        return {
          items: this.homepage.follows.map((v: any) =>
            MDComicToHighlight(v.md_comics)
          ),
        };

      case "popular_ongoing":
        return {
          items: this.homepage.rank.map(MDComicToHighlight),
        };

      case "upcoming":
        return {
          items: this.homepage.recentRank.map(MDComicToHighlight),
        };

      case "top_followed_7":
        return {
          items: this.homepage.topFollowComics["7"].map(MDComicToHighlight),
        };
      case "top_followed_30":
        return {
          items: this.homepage.topFollowComics["30"].map(MDComicToHighlight),
        };
      case "latest":
        return {
          items: await this.getUpdateHighlights(false),
        };
    }

    throw new Error("Unknown Section ID");
  }

  async getUpdateHighlights(hot: boolean) {
    const { data: str } = await this.client.get(
      `${this.API_URL}/chapter`,
      {
        params: {
          page: "1",
          order: hot ? "hot" : "new",
          tachiyomi: "true",
        },
      }
    );

    const data = JSON.parse(str)?.map((v: any) =>
      MDComicToHighlight(v.md_comics)
    );
    return data;
  }
}
