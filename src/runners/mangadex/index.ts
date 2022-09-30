import {
  AuthMethod,
  Chapter,
  ChapterData,
  CollectionExcerpt,
  CollectionStyle,
  Content,
  ContentType,
  Filter,
  Highlight,
  HighlightCollection,
  NetworkRequest,
  NetworkResponse,
  PagedResult,
  PreferenceGroup,
  Property,
  Provider,
  ProviderLink,
  ProviderLinkType,
  ReadingFlag,
  ReadingMode,
  SearchRequest,
  SearchSort,
  Source,
  SourceInfo,
  Status,
  Tag,
  TrackerInfo,
  ExploreCollection,
  User,
  NonInteractiveProperty,
  ActionGroup,
  DownSyncedContent,
  UpSyncedContent,
} from "@suwatte/daisuke";
import explore_tags from "./explore.json";
import { decode, encode } from "he";
import { groupBy, capitalize, sample } from "lodash";
import { MDStore } from "./store";
import { languageISO, languageLabel, MimasRecommendation } from "./utils";
import { getPreferenceList } from "./preferences";

export class Target extends Source {
  info: SourceInfo = {
    name: "MangaDex",
    id: "org.mangadex",
    version: 1.1,
    website: "https://mangadex.org",
    supportedLanguages: [],
    primarilyAdultContent: true,
    authMethod: AuthMethod.USERNAME_PW,
    contentSync: true,
    hasExplorePage: true,
    thumbnail: `mangadex.png`,
    minSupportedAppVersion: "4.1.0",
  };
  private API_URL = "https://api.mangadex.org";
  private COVER_URL = "https://uploads.mangadex.org/covers";
  private NETWORK_CLIENT: NetworkClient;
  constructor() {
    super();
    this.NETWORK_CLIENT = new NetworkClient();
    this.NETWORK_CLIENT.requestInterceptHandler = async (req) => {
      return await this.requestHandler(req);
    };
  }
  private ADULT_TAG_IDS = [
    "b29d6a3d-1569-4e7a-8caf-7557bc92cd5d",
    "97893a4c-12af-4dac-b6be-0dffb353568e",
    "5bd0e105-4481-44ca-b6e7-7544da56b1a3",
  ];
  private SEASONAL_LIST_ID = "7df1dabc-b1c5-4e8e-a757-de5a2a3d37e9";
  private LAST_SEASONAL_LIST_ID = "7df1dabc-b1c5-4e8e-a757-de5a2a3d37e9";
  private RESULT_LIMIT = 30;
  private DEMOGRAPHICS = ["shounen", "shoujo", "seinen", "josei", "none"];
  private CONTENT_RATINGS = ["safe", "suggestive", "erotica", "pornographic"];
  private LANGUAGES = ["en", "ko", "ja", "zh", "zh-hk"];
  private PUBLICATION_STATUS = ["ongoing", "completed", "hiatus", "cancelled"];
  private VALUE_STORE = new ValueStore();
  private KEYCHAIN = new KeyChainStore();
  private STORE = new MDStore(this.VALUE_STORE);
  private PROPERTIES: Property[] = [];

  async playground() {}
  async getContent(contentId: string): Promise<Content> {
    const url = `${this.API_URL}/manga/${contentId}`;
    const params = {
      includes: ["artist", "author", "cover_art"],
    };
    const response = await this.NETWORK_CLIENT.get(url, { params });
    const mdResponse = JSON.parse(response.data);
    const data = mdResponse.data;
    const attributes = data.attributes;
    const relationships = data.relationships;

    const titles = [attributes.title[Object.keys(attributes.title)[0]]].concat(
      attributes.altTitles.map((x: any) => decode(x[Object.keys(x)[0]]))
    );
    let adultContent = false;
    const summary = decode(attributes.description.en ?? "").replace(
      /\[\/{0,1}[bus]\]/g,
      ""
    );
    // Status
    let status = Status.UNKNOWN;
    switch (attributes.status) {
      case "ongoing": {
        status = Status.ONGOING;
        break;
      }
      case "completed": {
        status = Status.COMPLETED;
        break;
      }
      case "hiatus": {
        status = Status.HIATUS;
        break;
      }
      case "cancelled": {
        status = Status.CANCELLED;
        break;
      }
    }

    // Properties
    const properties: Property[] = [];

    // Genres
    var genreTags: Tag[] = [];
    for (const tag of attributes.tags) {
      const adult = this.ADULT_TAG_IDS.includes(tag.id);
      const t: Tag = {
        id: tag.id,
        adultContent: adult,
        label: tag.attributes.name.en,
      };

      if (adult) {
        adultContent = true;
      }

      genreTags.push(t);
    }
    const propertyTags: Property = {
      id: "genres",
      label: "Genres",
      tags: genreTags,
    };
    properties.push(propertyTags);

    // * Reading Mode
    let recommendedReadingMode = ReadingMode.PAGED_MANGA;
    const longStripId = "3e2b8dae-350e-4ab8-a8ce-016e844b9f0d";
    const fullColorId = "f5ba408b-0e7a-484d-8d49-4e9125ac96de";
    const mapped = genreTags.map((v) => v.id);

    if (mapped.includes(longStripId)) {
      recommendedReadingMode = ReadingMode.VERTICAL;
    } else if (mapped.includes(fullColorId)) {
      recommendedReadingMode = ReadingMode.PAGED_COMIC;
    }

    // * Content Rating & Publication Demographic & Original Language
    if (attributes.contentRating) {
      const tags: Tag[] = [];
      const tag: Tag = {
        id: `cr|${attributes.contentRating.toLowerCase()}`,
        label: capitalize(attributes.contentRating),
        adultContent: attributes.contentRating == "pornographic",
      };
      if (!adultContent)
        adultContent = attributes.contentRating == "pornographic";
      tags.push(tag);
      const contentRatingProperty: Property = {
        id: "content_rating",
        label: "Content Rating",
        tags,
      };
      properties.push(contentRatingProperty);
    }

    // Original Language
    const originalLang = attributes.originalLanguage;
    if (originalLang) {
      const tags: Tag[] = [];
      const languageTag: Tag = {
        id: `lang|${originalLang}`,
        label: languageLabel(originalLang ?? "unknown"),
        adultContent: false,
      };

      // Properly Rename, Common Languages

      tags.push(languageTag);
      const languageTags: Property = {
        id: "language",
        label: "Original Language",
        tags,
      };
      properties.push(languageTags);
    }

    // Creators
    const credits = relationships.filter((x: any) =>
      ["author", "artist"].includes(x.type)
    );
    const authors = relationships
      .filter((x: any) => x.type == "author")
      .map((x: any) => x.attributes.name);

    const artists = relationships
      .filter((x: any) => x.type == "artist")
      .map((x: any) => x.attributes.name);

    if (credits.length != 0) {
      try {
        const tags: Tag[] = [];
        // Clickable artist & author properties
        const appendedIds: any = [];

        credits.forEach((obj: any) => {
          const tag: Tag = {
            id: `author|${obj.id}`,
            label: decode(obj.attributes.name),
            adultContent: false,
          };

          if (!appendedIds.includes(obj.id)) {
            tags.push(tag);
            appendedIds.push(obj.id);
          }
        });
        const creditsProperty: Property = {
          id: "credits",
          label: "Credits",
          tags,
        };
        properties.push(creditsProperty);

        // let ids = creators;
      } catch (err) {
        // handle error
        console.log("MangaDex: Failed To Parse Creators");
      }
    }
    // Links

    const trackerInfo: TrackerInfo = {
      al: attributes?.links?.al,
      kt: attributes?.links?.kt,
      mal: attributes?.links?.mal,
      mu: attributes?.links?.mu,
    };

    // Related Content
    const includedCollections: HighlightCollection[] = [];
    const relatedManga = relationships
      .filter((v: any) => v.type === "manga")
      .map((v: any) => v.id);

    if (relatedManga.length > 0) {
      const highlights = await this.getMDRelatedCollections(relatedManga);
      includedCollections.push({
        id: "related_manga",
        title: "Related Titles",
        highlights,
        style: CollectionStyle.NORMAL,
      });
    }
    const covers = (await this.getMDCovers([contentId]))[contentId];
    const stats = (await this.getMDStatistics([contentId]))[contentId];
    const nonInteractive: NonInteractiveProperty = {
      id: "base",
      label: "Additional Info",
      tags: [
        `📚 Follows: ${stats.follows.toLocaleString()}`,
        `⭐️ Rating: ${stats.rating.toFixed(1)} / 10 `,
      ],
    };

    let contentType: ContentType = ContentType.UNKNOWN;

    switch (originalLang) {
      case "jp":
        contentType = ContentType.MANGA;
        break;
      case "ko":
        contentType = ContentType.MANHWA;
        break;
    }
    return {
      title: titles[0],
      additionalTitles: titles,
      adultContent,
      cover: covers[0],
      contentId,
      additionalCovers: covers,
      properties,
      summary,
      webUrl: `${this.info.website}/title/${contentId}`,
      trackerInfo,
      status,
      creators: Array.from(new Set(artists.concat(authors))),
      recommendedReadingMode,
      includedCollections,
      contentType,
      nonInteractiveProperties: [nonInteractive],
    };
  }
  async getChapters(contentId: string): Promise<Chapter[]> {
    const translatedLanguage = await this.STORE.getLanguages();

    const chapters: Chapter[] = [];
    let offset = 0;
    const limit = 500;
    let loop = true;
    let index = 0;
    while (loop) {
      const url = `${this.API_URL}/manga/${contentId}/feed`;
      const params = {
        limit,
        offset,
        translatedLanguage,
        contentRating: this.CONTENT_RATINGS,
        includes: ["scanlation_group"],
        "order[volume]": "desc",
        "order[chapter]": "desc",
        "order[publishAt]": "desc",
      };

      const response = await this.NETWORK_CLIENT.get(url, { params });

      const json = JSON.parse(response.data);

      for (const chapter of json.data) {
        const id = chapter.id;
        const attributes = chapter.attributes;
        const title = attributes.title ? decode(attributes.title) : undefined;
        const number = Number(attributes.chapter);
        const volume = attributes.volume
          ? Number(attributes.volume)
          : undefined;
        const date = new Date(attributes.publishAt);
        const language = languageISO(
          attributes.translatedLanguage ?? "UNKNOWN"
        );

        let webUrl = attributes.externalUrl;
        if (!webUrl) {
          webUrl = `${this.info.website}/chapter/${id}`;
        }

        const providers: Provider[] = chapter.relationships
          .filter((v: any) => v.type === "scanlation_group")
          .map((data: any): Provider => {
            const links: ProviderLink[] = [];

            if (data.attributes.website) {
              links.push({
                type: ProviderLinkType.WEBSITE,
                url: data.attributes.website,
              });
            }

            if (data.attributes.twitter) {
              links.push({
                type: ProviderLinkType.TWITTER,
                url: data.attributes.twitter,
              });
            }

            if (data.attributes.discord) {
              const str = data.attributes.discord;
              links.push({
                type: ProviderLinkType.DISCORD,
                url: `https://discord.gg/${str}`,
              });
            }

            return {
              id: data.id,
              name: data.attributes.name,
              links,
            };
          });

        if (attributes.pages <= 0) {
          continue;
        }
        chapters.push({
          contentId,
          chapterId: id,
          title,
          number,
          volume,
          date,
          language,
          webUrl,
          providers,
          index,
        });
        index++;
      }

      offset += 500;
      if (json.total <= offset) {
        loop = false;
      }
    }

    return chapters;
  }
  async getChapterData(
    contentId: string,
    chapterId: string
  ): Promise<ChapterData> {
    const isDataSaver = await this.STORE.getDSMode();
    const url = `${this.API_URL}/at-home/server/${chapterId}`;
    const response = await this.NETWORK_CLIENT.get(url);
    const json = JSON.parse(response.data);

    const serverUrl = json.baseUrl;
    const chapter = json.chapter;
    const key = isDataSaver ? "dataSaver" : "data";
    const path = isDataSaver ? "data-saver" : "data";
    const urls: string[] = chapter[key].map(
      (v: string) => `${serverUrl}/${path}/${chapter.hash}/${v}`
    );
    return {
      contentId,
      chapterId,
      pages: urls.map((url) => ({ url })),
    };
  }
  getSearchResults(query: SearchRequest): Promise<PagedResult> {
    return this.getMDSearchResults(query);
  }

  // * Explore
  async createExploreCollections(): Promise<CollectionExcerpt[]> {
    const shuffle = <T>(array: T[]) => {
      var currentIndex = array.length,
        temporaryValue,
        randomIndex;

      // While there remain elements to shuffle...
      while (0 !== currentIndex) {
        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        // And swap it with the current element.
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
      }

      return array;
    };
    const injectMimasRecs = await this.STORE.getMimasEnabled();
    const injectSeasonal = await this.STORE.getSeasonal();
    const sections: CollectionExcerpt[] = [
      {
        id: "followedCount",
        title: "Popular Titles...",
        subtitle: "The general consensus is never wrong.",
        style: CollectionStyle.INFO,
      },
      {
        id: "createdAt",
        title: "Recently Added",
        style: CollectionStyle.NORMAL,
      },

      {
        id: "rating",
        title: "Highly Rated Titles",
        subtitle: "Masterpieces",
        style: CollectionStyle.INFO,
      },
      {
        id: "relevance",
        title: "Relevant Titles",
        subtitle: "This sort option makes no fucking sense.",
        style: CollectionStyle.NORMAL,
      },
      {
        id: "recentlyUpdated",
        title: "Latest Updates",
        style: CollectionStyle.UPDATE_LIST,
      },
    ];

    // Seasonal Lists
    if (injectSeasonal) {
      sections.push(
        ...[
          // Uncomment when list actually changes
          // {
          //   id: "seasonal_last",
          //   title: "Seasonal List",
          //   subtitle: "Titles from last anime season.",
          //   style: CollectionStyle.GALLERY,
          // },
          {
            id: "seasonal",
            title: "Seasonal List",
            subtitle: "Titles from this anime season.",
            style: CollectionStyle.GALLERY,
          },
        ]
      );
    }

    // Mimas Recommendations
    if (injectMimasRecs) {
      const ids = await this.STORE.getMimasTargets();

      const recommended = ids.map(
        (v): CollectionExcerpt => ({
          id: `mimas|${v}`,
          title: "Recommendation",
          style: CollectionStyle.NORMAL,
        })
      );

      sections.push(...recommended);
    }
    return shuffle(sections);
  }

  async resolveExploreCollection(
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    switch (excerpt.id) {
      case "seasonal":
        return this.getCollectionForList(this.SEASONAL_LIST_ID, excerpt);
      case "seasonal_last":
        return this.getCollectionForList(this.LAST_SEASONAL_LIST_ID, excerpt);
      // Get
      case "recentlyUpdated":
        return {
          ...excerpt,
          highlights: await this.getMDUpdates(1),
        };
      default:
        if (excerpt.id.includes("mimas")) {
          const id = excerpt.id.split("|").pop();
          if (!id) throw new Error("Improper Config");
          const name =
            sample(["More Like", "Because you read", "Similar to"]) ??
            "More Like";

          const recs = await this.getMimasRecommendations(id);
          return {
            highlights: recs.recs.map((v) => ({
              title: v.title,
              contentId: v.contentId,
              cover: v.coverImage,
            })),
            title: `${name} "${recs.target.title}"`,
          };
        } else {
          const sort = (await this.getSearchSorters()).find(
            (v) => v.id === excerpt.id
          );
          const tags = (await this.STORE.getContentRatings()).map(
            (v) => `cr|${v}`
          );
          const query: SearchRequest = {
            page: 1,
            includedTags: tags,
            excludedTags: [],
            sort,
          };

          const overrides = {
            limit: 20,
            getStats: ["followedCount", "rating"].includes(excerpt.id),
          };
          return {
            ...excerpt,
            highlights: (await this.getMDSearchResults(query, overrides))
              .results,
          };
        }
    }
  }

  async getCollectionForList(
    id: string,
    excerpt: CollectionExcerpt
  ): Promise<ExploreCollection> {
    const list = await this.getMDList(id);
    return { ...excerpt, highlights: list.highlights, title: list.title };
  }
  async getExplorePageTags(): Promise<Tag[]> {
    return explore_tags;
  }

  // * Search
  async getSearchSorters(): Promise<SearchSort[]> {
    const data = {
      followedCount: "Popular",
      rating: "User Rating",
      createdAt: "New",
      relevance: "Relevant",
      title: "Alphabetically",
      year: "Yearly",
      updatedAt: "Last Updated",
      latestUploadedChapter: "Last Uploaded Chapter",
    };

    return Object.entries(data).map(([id, label]) => ({
      id,
      label,
    }));
  }
  getSourceTags(): Promise<Property[]> {
    return this.getMDTags();
  }
  async getSearchFilters(): Promise<Filter[]> {
    const filters: Filter[] = [];
    const nonExcludable = [
      "pb_status",
      "demographic",
      "content_rating",
      "lang",
    ];
    for (const property of await this.getMDTags()) {
      const filter: Filter = {
        id: property.id,
        canExclude: !nonExcludable.includes(property.id),
        property,
      };

      filters.push(filter);
    }

    return filters;
  }

  // Events
  async onChapterRead(contentId: string, chapterId: string): Promise<void> {
    await this.STORE.saveToMimasTargets(contentId);

    if (!this.isSignedIn()) return;
    await this.syncToMD(contentId, [chapterId]);
  }

  async onChaptersMarked(
    contentId: string,
    chapterIds: string[],
    completed: boolean
  ): Promise<void> {
    if (!this.isSignedIn()) return;

    if (completed) {
      await this.syncToMD(contentId, chapterIds);
    } else {
      await this.syncToMD(contentId, [], chapterIds);
    }
  }

  async onContentsAddedToLibrary(ids: string[]): Promise<void> {
    if (!this.isSignedIn()) return;

    for (const id of ids) {
      await this.NETWORK_CLIENT.post(`${this.API_URL}/manga/${id}/status`, {
        body: {
          status: "reading",
        },
      });
    }
  }

  // Preferences
  async getUserPreferences(): Promise<PreferenceGroup[]> {
    return getPreferenceList();
  }

  async getSourceActions(): Promise<ActionGroup[]> {
    return [
      {
        id: "base",
        header: "Mimas",
        children: [
          {
            isDestructive: true,
            systemImage: "trash",
            title: "Clear Recommendations",
            key: "mimas_clear",
          },
        ],
      },
    ];
  }

  async didTriggerAction(key: string): Promise<void> {
    switch (key) {
      case "mimas_clear":
        await this.STORE.clearMimasTargets();
        break;
    }
  }
  // Auth
  async handleBasicAuth(username: string, password: string) {
    const response = await this.NETWORK_CLIENT.post(
      `${this.API_URL}/auth/login`,
      {
        body: {
          username,
          password,
        },
      }
    );

    const data = JSON.parse(response.data);

    const session = data.token.session;
    const refresh = data.token.refresh;

    await this.KEYCHAIN.set("session", session);
    await this.KEYCHAIN.set("refresh", refresh);
  }

  async getAuthenticatedUser(): Promise<User | null> {
    const token = await this.KEYCHAIN.get("session");
    if (!token) {
      return null;
    }

    const response = await this.NETWORK_CLIENT.get(`${this.API_URL}/user/me`);
    const data = JSON.parse(response.data);
    const mdUser = data.data;

    const user: User = {
      id: mdUser.id,
      username: mdUser.attributes.username,
      avatar: "https://mangadex.org/avatar.png",
      info: ["Testing"],
    };

    return user;
  }

  async handleUserSignOut() {
    try {
      await this.NETWORK_CLIENT.get(`${this.API_URL}/auth/logout`);
    } catch (err) {
      console.log(err);
    }
    await this.KEYCHAIN.remove("session");
    await this.KEYCHAIN.remove("refresh");
  }

  // * Syncing
  async syncUserLibrary(
    library: UpSyncedContent[]
  ): Promise<DownSyncedContent[]> {
    const fetchedLib = await this.fetchUserLibrary();

    // Titles in local but not cloud
    const toUpSync = library.filter(
      (v) => !fetchedLib.find((a) => a.id === v.id)
    );
    // Titles in cloud but not local
    const toDownSync = fetchedLib.filter((v) => {
      const target = library.find((a) => a.id === v.id);

      // Not in library, down sync
      if (!target) return true;

      // NonMatching Reading Flag
      if (v.readingFlag && target.flag != v.readingFlag) return true;

      return false;
    });
    // Handle UpSync
    await this.handleUpSync(toUpSync);
    return toDownSync;
  }

  async handleUpSync(entries: UpSyncedContent[]) {
    for (const entry of entries) {
      await this.NETWORK_CLIENT.post(
        `${this.API_URL}/manga/${entry.id}/status`,
        {
          body: {
            status:
              Object.keys(this.READING_STATUS).find(
                (key) => this.READING_STATUS[key] === entry.flag
              ) ?? ReadingFlag.PLANNED,
          },
        }
      );
    }
  }
  async fetchUserLibrary() {
    const library: DownSyncedContent[] = [];

    // Fetch Reading Status
    const statuses = await this.getMDUserStatuses();
    const limit = 100;
    let offset = 0;

    while (true) {
      const response = await this.NETWORK_CLIENT.get(
        `${this.API_URL}/user/follows/manga`,
        {
          params: {
            limit,
            offset,
            includes: ["cover_art"],
          },
        }
      );
      const highlights = (
        await this.parsePagedResponse(response, 1, false, false)
      ).results;
      // prepare
      const mapped: DownSyncedContent[] = highlights.map(
        (v): DownSyncedContent => {
          const status = this.getMDReadingStatus(statuses[v.contentId]);
          return {
            id: v.contentId,
            title: v.title,
            cover: v.cover,
            readingFlag: status,
          };
        }
      );
      library.push(...mapped);
      // Loop Logic
      offset += limit;
      if (highlights.length < limit) {
        break;
      }
    }

    return library;
  }

  async getReadChapterMarkers(contentId: string): Promise<string[]> {
    const response = await this.NETWORK_CLIENT.get(
      `${this.API_URL}/manga/read`,
      { params: { ids: [contentId], grouped: true } }
    );

    const data = JSON.parse(response.data);

    const ids = data.data[contentId];
    return ids ?? [];
  }

  READING_STATUS: Record<string, ReadingFlag> = {
    reading: ReadingFlag.READING,
    plan_to_read: ReadingFlag.PLANNED,
    dropped: ReadingFlag.DROPPED,
    completed: ReadingFlag.COMPLETED,
    re_reading: ReadingFlag.REREADING,
    on_hold: ReadingFlag.PAUSED,
  };
  // Authenticated User
  getMDReadingStatus(str: string): ReadingFlag {
    switch (str) {
      case "reading":
        return ReadingFlag.READING;
      case "plan_to_read":
        return ReadingFlag.PLANNED;
      case "dropped":
        return ReadingFlag.DROPPED;
      case "completed":
        return ReadingFlag.COMPLETED;
      case "re_reading":
        return ReadingFlag.REREADING;
      case "on_hold":
        return ReadingFlag.PAUSED;
      default:
        break;
    }
    return ReadingFlag.UNKNOWN;
  }
  async getMDUserStatuses() {
    try {
      const response = await this.NETWORK_CLIENT.get(
        `${this.API_URL}/manga/status`
      );
      return JSON.parse(response.data).statuses as Record<string, string>;
    } catch (err: any) {
      console.log(err.response.data);
    }
    return {};
  }
  // Helpers
  async getMDTags() {
    if (this.PROPERTIES.length != 0) {
      return this.PROPERTIES;
    }

    const properties: Property[] = [];
    const response = await this.NETWORK_CLIENT.get(`${this.API_URL}/manga/tag`);
    const data = JSON.parse(response.data).data;
    const grouped = groupBy(data, (v) => v.attributes.group);
    for (const group in grouped) {
      const label = capitalize(group);

      const tags = grouped[group].map((tag): Tag => {
        return {
          label: tag.attributes.name.en,
          adultContent: this.ADULT_TAG_IDS.includes(tag.id),
          id: tag.id,
        };
      });

      const property: Property = {
        id: group,
        label,
        tags,
      };

      properties.push(property);
    }

    properties.push({
      id: "pb_status",
      label: "Publication Status",
      tags: this.PUBLICATION_STATUS.map((v) => {
        return {
          id: `s|${v}`,
          label: capitalize(v),
          adultContent: false,
        };
      }),
    });

    properties.push({
      id: "demographic",
      label: "Publication Demographic",
      tags: this.DEMOGRAPHICS.map((v) => {
        return {
          id: `pd|${v}`,
          label: capitalize(v),
          adultContent: false,
        };
      }),
    });

    properties.push({
      id: "content_rating",
      label: "Content Rating",
      tags: this.CONTENT_RATINGS.map((v) => {
        return {
          id: `cr|${v}`,
          label: capitalize(v),
          adultContent: v === "pornographic",
        };
      }),
    });

    properties.push({
      id: "lang",
      label: "Original Language",
      tags: this.LANGUAGES.map((v) => {
        return {
          id: `lang|${v}`,
          label: languageLabel(v),
          adultContent: false,
        };
      }),
    });

    this.PROPERTIES = properties;
    return properties;
  }

  async getMDList(listId: string) {
    let response = await this.NETWORK_CLIENT.get(
      `${this.API_URL}/list/${listId}`
    );
    const data = JSON.parse(response.data).data;
    const contentIds = data.relationships
      .filter((x: any) => x.type == "manga")
      .map((x: any) => x.id);

    const listName = data.attributes.name ?? "Seasonal";

    response = await this.NETWORK_CLIENT.get(`${this.API_URL}/manga`, {
      params: {
        includes: ["cover_art"],
        ids: contentIds,
        limit: this.RESULT_LIMIT,
      },
    });
    return {
      title: listName,
      highlights: (await this.parsePagedResponse(response, 1, true)).results,
    };
  }

  async parsePagedResponse(
    response: NetworkResponse,
    page: number = 1,
    fetchCovers: boolean = false,
    fetchStatistics: boolean = false
  ): Promise<PagedResult> {
    const json = JSON.parse(response.data);

    const ids: string[] = json.data.map((v: any) => v.id);

    let stats: any = {};
    if (fetchStatistics) {
      stats = await this.getMDStatistics(ids);
    }
    // batch
    const highlights = (json.data as any[]).map(async (manga: any) => {
      const attributes = manga.attributes;

      const tags = attributes.tags.map((tag: any) => tag.attributes.name.en);
      const title = decode(attributes.title[Object.keys(attributes.title)[0]]);
      const fileName = manga.relationships
        .filter((x: any) => x.type == "cover_art")
        .map((x: any) => x.attributes?.fileName)[0];

      const suffix = await this.STORE.getCoverQuality();
      const defaultCover = `${this.COVER_URL}/${manga.id}/${fileName}${suffix}`;

      const highlight: Highlight = {
        title,
        tags,
        cover: defaultCover,
        contentId: manga.id,
      };

      if (fetchCovers) {
        highlight.additionalCovers = (await this.getMDCovers([manga.id]))[
          manga.id
        ].slice(0, 5);
      }

      if (fetchStatistics) {
        highlight.stats = stats[manga.id];
      }
      return highlight;
    });
    let results = await Promise.all(highlights);
    return {
      page,
      results,
      isLastPage: highlights.length === 0,
      totalResultCount: json.total,
    };
  }

  async getMDStatistics(ids: string[]): Promise<any> {
    const response = await this.NETWORK_CLIENT.get(
      `${this.API_URL}/statistics/manga`,
      {
        params: {
          manga: ids,
        },
      }
    );
    const json = JSON.parse(response.data);
    const stats = json.statistics;

    const getValue = (key: string) => {
      let obj = stats[key];
      return {
        follows: obj.follows,
        rating: obj.rating.average,
        // views: 0,
      };
    };
    return ids.reduce((a, v) => ({ ...a, [v]: getValue(v) }), {});
  }

  async getMDCovers(ids: string[]): Promise<Record<string, string[]>> {
    const results: any = {};
    const response = await this.NETWORK_CLIENT.get(`${this.API_URL}/cover`, {
      params: {
        manga: ids,
        limit: 100,
        "order[volume]": "desc",
      },
    });
    const json =
      typeof response.data === "string"
        ? JSON.parse(response.data)
        : response.data;

    for (const id of ids) {
      let files = (json.data as any[]).filter((data) =>
        Object.values(data.relationships.flatMap((x: any) => x.id)).includes(id)
      );

      const suffix = await this.STORE.getCoverQuality();

      let covers = files.map(
        (val) => `${this.COVER_URL}/${id}/${val.attributes.fileName}${suffix}`
      );
      results[id] = covers;
    }

    return results;
  }

  async getMDUpdates(page: number): Promise<Highlight[]> {
    const contentRating = await this.STORE.getContentRatings();
    const langs = await this.STORE.getLanguages();
    let response = await this.NETWORK_CLIENT.get(`${this.API_URL}/chapter`, {
      params: {
        limit: 50,
        offset: 50 * (page - 1),
        "order[readableAt]": "desc",
        translatedLanguage: langs,
        contentRating: contentRating,
        includeFutureUpdates: "0",
      },
    });

    const chapterListJSON = JSON.parse(response.data);
    const base = chapterListJSON.data.map(
      (x: any) => x.relationships.find((y: any) => y.type == "manga").id
    );
    const ids = Array.from(new Set(base));
    response = await this.NETWORK_CLIENT.get(`${this.API_URL}/manga`, {
      params: {
        ids,
        limit: ids.length,
        contentRating,
        includes: ["cover_art"],
      },
    });

    const highlights = (
      await this.parsePagedResponse(response, 1)
    ).results.sort((a, b) => {
      return ids.indexOf(a.contentId) - ids.indexOf(b.contentId);
    });

    highlights.forEach((entry) => {
      const chapterObject = chapterListJSON.data.find(
        (json: any) =>
          entry.contentId ==
          json.relationships.find((y: any) => y.type == "manga").id
      );

      const volume = chapterObject.attributes.volume;
      const chapter = chapterObject.attributes.chapter;
      const chapterName = `${
        volume ? `Volume ${volume} ` : ""
      }Chapter ${chapter}`;
      const chapterDate = new Date(chapterObject.attributes.publishAt);
      const getOccurrences = (array: string[], value: string) => {
        let count = 0;
        array.forEach((v: string) => v === value && count++);
        return count;
      };
      const chapterCount = getOccurrences(base, entry.contentId);

      entry.updates = {
        label: chapterName,
        date: chapterDate,
        count: chapterCount,
      };
    });
    return highlights;
  }

  async getMDSearchResults(
    query: SearchRequest,
    overrides: any = {}
  ): Promise<PagedResult> {
    const page = query.page ?? 1;
    const limit = overrides.limit ?? this.RESULT_LIMIT;
    const offset = (page - 1) * limit;

    const url = `${this.API_URL}/manga`;
    const params: any = { limit, offset, includes: ["cover_art"] };

    // Keyword
    if (query.query) {
      params.title = encode(query.query);
    }

    // Order
    if (query.sort) {
      params[`order[${query.sort.id}]`] = "desc";
    } else {
      params["order[followedCount]"] = "desc";
    }

    // Included
    if (query.includedTags) {
      // Content Rating
      const includedCR = query.includedTags
        .filter((tag) => tag.includes("cr|"))
        .map((tag) => tag.split("|").pop()!);
      params.contentRating =
        includedCR.length == 0
          ? ["safe", "suggestive", "erotica", "pornographic"]
          : includedCR;

      // Publication Demographic
      const includedPD = query.includedTags
        ?.filter((tag) => tag.includes("pd|"))
        .map((tag) => tag.split("|").pop()!);
      params.publicationDemographic = includedPD;

      // Original Language
      const includedLANG = query.includedTags
        ?.filter((tag) => tag.includes("lang|"))
        .map((tag) => tag.split("|").pop()!);
      params.originalLanguage = includedLANG;

      // Status
      const includedSTS = query.includedTags
        ?.filter((tag) => tag.includes("s|"))
        .map((tag) => tag.split("|").pop());
      params.status = includedSTS;

      // Creators
      const includedCreators = query.includedTags
        ?.filter((tag) => tag.includes("author|"))
        .map((tag) => tag.split("|").pop());
      params.authors = includedCreators;

      // Included Tags
      const includedTAG = query.includedTags.filter(
        (tag) => !tag.includes("|")
      );
      params.includedTags = includedTAG;
    }

    if (query.excludedTags) {
      const excludedTAG = query.excludedTags.filter(
        (tag) => !tag.includes("|")
      );
      params.excludedTags = excludedTAG;
    }
    const response = await this.NETWORK_CLIENT.get(url, { params });

    return this.parsePagedResponse(
      response,
      page,
      false,
      overrides.getStats ?? false
    );
  }
  async getMDRelatedCollections(ids: string[]) {
    const response = await this.NETWORK_CLIENT.get(`${this.API_URL}/manga`, {
      params: {
        includes: ["cover_art"],
        ids,
      },
    });
    const paged = await this.parsePagedResponse(response);
    return paged.results;
  }

  // Network Functions
  // Ref: https://stackoverflow.com/a/69058154
  isTokenExpired = (token: string) =>
    Date.now() >=
    JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()).exp *
      1000;
  async clearTokens() {
    await this.KEYCHAIN.remove("session");
    await this.KEYCHAIN.remove("refresh");
  }
  async refreshTokens() {
    const token = await this.KEYCHAIN.get("refresh");

    if (!token) {
      await this.clearTokens();
      return;
    }
    if (this.isTokenExpired(token)) {
      await this.clearTokens();
      return;
    }
    // Refresh
    try {
      const refreshResponse = await this.NETWORK_CLIENT.post(
        `${this.API_URL}/auth/refresh`,
        {
          body: {
            token,
          },
        }
      );
      const data = JSON.parse(refreshResponse.data);

      await this.KEYCHAIN.set("session", data.token.session);
      await this.KEYCHAIN.set("refresh", data.token.refresh);
    } catch {
      await this.clearTokens();
    }

    console.log("Refreshed Token");
  }

  async isSignedIn() {
    return !!(await this.KEYCHAIN.get("session"));
  }
  async requestHandler(request: NetworkRequest) {
    let token: string | null = null;
    try {
      token = await this.KEYCHAIN.get("session");
    } catch (error) {
      console.log("Nested Object Reference Error");
      return request;
    }

    if (
      !token ||
      !["auth/log", "user", "read", "/status"].some((v) =>
        request.url.includes(v)
      )
    ) {
      return request;
    }
    if (this.isTokenExpired(token)) {
      await this.refreshTokens();
      token = await this.KEYCHAIN.get("session");
      if (!token) {
        return request;
      }
    }
    request.headers = {
      ...request.headers,
      authorization: `Bearer ${token.trim()}`,
      referer: "https://mangadex.org",
    };

    return request;
  }
  async getMimasRecommendations(
    id: string
  ): Promise<{ recs: MimasRecommendation[]; target: MimasRecommendation }> {
    const MIMAS_URL = "https://mimas.mantton.com";

    const response = await this.NETWORK_CLIENT.get(
      `${MIMAS_URL}/similar/org.mangadex/${id}?page=1`
    );
    const data = JSON.parse(response.data);
    return {
      recs: data.results,
      target: data.target,
    };
  }

  async syncToMD(
    id: string,
    chapterIdsRead: string[],
    chapterIdsUnread: string[] = []
  ) {
    await this.NETWORK_CLIENT.post(`${this.API_URL}/manga/${id}/read`, {
      body: {
        chapterIdsUnread,
        chapterIdsRead,
      },
    });
  }
}
