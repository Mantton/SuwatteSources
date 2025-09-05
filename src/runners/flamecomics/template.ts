import {
  Chapter,
  ChapterData,
  Content,
  DirectoryFilter,
  DirectoryRequest,
  FilterType,
  Highlight,
  NetworkRequest,
  Option,
  PagedResult,
  PublicationStatus,
  ReadingMode,
} from "@suwatte/daisuke";
import { TachiHttpSource } from "../../template/tachiyomi";
import { load } from "cheerio";

type Series = {
  title: string;
  altTitles?: string; // JSON encoded array of strings
  description: string;
  cover: string;
  type: string;
  tags?: string[];
  author?: string[];
  artist?: string[];
  status: string;
  series_id: number;
  last_edit: string;
  views?: number;
};

type SearchPageData = { pageProps: { series: Series[] } };
type LatestPageData = {
  pageProps: { latestEntries: { blocks: { series: Series[] }[] } };
};
type MangaPageData = { pageProps: { chapters: ChapterDTO[]; series: Series } };
type ChapterDTO = {
  chapter: number;
  title?: string;
  release_date: number; // epoch seconds
  series_id: number;
  token: string;
  images: { [k: string]: { name: string } } | Array<{ name: string }>;
};

export class Template extends TachiHttpSource {
  baseUrl = "https://flamecomics.xyz";
  lang = "en";
  supportsLatest = true;
  name = "Flame Comics";

  private cdn = "https://cdn.flamecomics.xyz";
  private buildId?: string;
  private cachedFilterOptions?: { statuses: Option[]; types: Option[]; tags: Option[] };

  headers(): Record<string, string> {
    return { Referer: `${this.baseUrl}/` };
  }

  // Utility
  private async getBuildId(): Promise<string> {
    if (this.buildId) return this.buildId;
    const { data } = await this.client.request({
      url: this.baseUrl,
      headers: this.headers(),
    });
    const $ = load(data);
    const txt = $("script#__NEXT_DATA__").text();
    if (!txt) throw new Error("FlameComics: __NEXT_DATA__ not found");
    const json = JSON.parse(txt);
    const id: string | undefined = json?.buildId;
    if (!id) throw new Error("FlameComics: buildId not present");
    this.buildId = id;
    return id;
  }

  private dataApi(
    path: string,
    query?: Record<string, any>,
    fragment?: string,
  ): NetworkRequest {
    return {
      url: `${this.baseUrl}/_next/data/${this.buildId}/${path}`,
      params: query,
      fragment,
      headers: this.headers(),
    } as any;
  }

  private thumbUrl(series: Series): string {
    // https://cdn.flamecomics.xyz/uploads/images/series/{id}/{cover}?{last_edit}
    const base = `${this.cdn}/uploads/images/series/${series.series_id}/${series.cover}`;
    return `${base}?${encodeURIComponent(series.last_edit)}=`;
  }

  // Requests
  popularMangaRequest(page: number): NetworkRequest {
    return this.dataApi("browse.json", undefined, String(page));
  }
  latestUpdatesRequest(_page: number): NetworkRequest {
    return this.dataApi("index.json");
  }
  searchMangaRequest(request: DirectoryRequest): NetworkRequest {
    const sanitized = (request.query ?? "")
      .toLowerCase()
      .replace(/[^A-Za-z0-9 ]/g, "");
    const fragment = `${request.page}&${sanitized}`;
    return this.dataApi("browse.json", undefined, fragment);
  }

  // Parsing helpers
  private mapSeriesToHighlight(series: Series): Highlight {
    return {
      id: `/series/${series.series_id}`,
      title: series.title,
      cover: this.thumbUrl(series),
    };
  }

  private paginate<T>(
    items: T[],
    page: number,
    perPage = 20,
  ): { pageItems: T[]; hasMore: boolean } {
    const start = (page - 1) * perPage;
    const end = Math.min(page * perPage, items.length);
    return { pageItems: items.slice(start, end), hasMore: end < items.length };
  }

  // Parsers
  parsePopularManga(response: string): PagedResult {
    const data = JSON.parse(response) as SearchPageData;
    const page = this.extractPageFromFragment(response) ?? 1;
    const sorted = [...data.pageProps.series].sort(
      (a, b) => (b.views ?? 0) - (a.views ?? 0),
    );
    const mapped = sorted.map((s) => this.mapSeriesToHighlight(s));
    const { pageItems, hasMore } = this.paginate(mapped, page, 20);
    return { results: pageItems, isLastPage: !hasMore };
  }

  parseLatestManga(response: string): PagedResult {
    const data = JSON.parse(response) as LatestPageData;
    const series = data.pageProps.latestEntries.blocks[0]?.series ?? [];
    const results = series.map((s) => this.mapSeriesToHighlight(s));
    return { results, isLastPage: true };
  }

  parseSearchManga(response: string, context: DirectoryRequest): PagedResult {
    const data = JSON.parse(response) as SearchPageData;
    const sanitized = (context.query ?? "")
      .toLowerCase()
      .replace(/[^A-Za-z0-9 ]/g, "");
    // Query filter (title/alt)
    let filtered = data.pageProps.series.filter((series) => {
      const titles: string[] = [series.title];
      if (series.altTitles) {
        try {
          const alts = JSON.parse(series.altTitles) as string[];
          titles.push(...alts);
        } catch {
          // ignore
        }
      }
      return titles.some((t) =>
        t
          .toLowerCase()
          .replace(/[^A-Za-z0-9 ]/g, "")
          .includes(sanitized),
      );
    });

    // Apply filters (client-side)
    const f: any = (context as any).filters ?? {};
    const wantedStatus: string | undefined = f.status && typeof f.status === "string" && f.status !== "Any" && f.status !== "" ? String(f.status).toLowerCase() : undefined;
    const wantedTypes: string[] = Array.isArray(f.types) ? f.types.map((x: string) => String(x).toLowerCase()) : [];
    const wantedTags: string[] = Array.isArray(f.tags) ? f.tags.map((x: string) => String(x).toLowerCase()) : [];

    if (wantedStatus || wantedTypes.length || wantedTags.length) {
      filtered = filtered.filter((s) => {
        const sStatus = (s.status ?? "").toLowerCase();
        const sType = (s.type ?? "").toLowerCase();
        const sTags = (s.tags ?? []).map((t) => String(t).toLowerCase());
        if (wantedStatus && sStatus !== wantedStatus) return false;
        if (wantedTypes.length && !wantedTypes.includes(sType)) return false;
        if (wantedTags.length && !wantedTags.some((t) => sTags.includes(t))) return false;
        return true;
      });
    }

    // Sorting
    const sortId = context.sort?.id ?? "views";
    if (sortId === "title-asc") {
      filtered = [...filtered].sort((a, b) => a.title.localeCompare(b.title));
    } else if (sortId === "title-desc") {
      filtered = [...filtered].sort((a, b) => b.title.localeCompare(a.title));
    } else if (sortId === "views") {
      filtered = [...filtered].sort((a, b) => (b.views ?? 0) - (a.views ?? 0));
    }
    const mapped = filtered.map((s) => this.mapSeriesToHighlight(s));
    const { pageItems, hasMore } = this.paginate(mapped, context.page, 20);
    return { results: pageItems, isLastPage: !hasMore };
  }

  parseMangaDetails(response: string): Content {
    const data = JSON.parse(response) as MangaPageData;
    const s = data.pageProps.series;
    const title = s.title;
    const cover = this.thumbUrl(s);
    const summary = load(s.description).text();
    const tags = s.tags ?? [];
    const genres = [s.type, ...tags].filter(Boolean).join(", ");
    const author = s.author?.join(", ");
    const artist = s.artist?.join(", ");
    const info = [author, artist].filter(Boolean) as string[];
    const status = this.parseStatus(s.status);
    return {
      title,
      cover,
      summary,
      info,
      status,
      recommendedPanelMode: ReadingMode.WEBTOON,
    };
  }

  private parseStatus(val?: string): PublicationStatus | undefined {
    const v = (val || "").toLowerCase();
    if (v === "hiatus") return PublicationStatus.HIATUS;
    if (v === "completed") return PublicationStatus.COMPLETED;
    if (v === "dropped") return PublicationStatus.CANCELLED;
    if (v === "ongoing") return PublicationStatus.ONGOING;
    return undefined;
  }

  parseChapterList(response: string): Chapter[] {
    const data = JSON.parse(response) as MangaPageData;
    return data.pageProps.chapters.map((ch, idx) => {
      const base = `Chapter ${String(ch.chapter).replace(/\.0$/, "")}`;
      const title = ch.title ? `${base} - ${ch.title}` : base;
      const chapterId = `/series/${ch.series_id}/${ch.token}`;
      return {
        chapterId,
        title,
        date: new Date(ch.release_date * 1000),
        number: Number(ch.chapter),
        index: idx,
        language: this.lang,
      };
    });
  }

  parsePageList(response: string): ChapterData {
    const data = JSON.parse(response) as { pageProps: { chapter: ChapterDTO } };
    const ch = data.pageProps.chapter;
    const imagesArray: Array<{ name: string }> = Array.isArray(ch.images)
      ? (ch.images as Array<{ name: string }>)
      : Object.values(ch.images as any);
    const pages = imagesArray.map((p) => {
      const base = `${this.cdn}/uploads/images/series/${ch.series_id}/${ch.token}/${p.name}`;
      const url = `${base}?${encodeURIComponent(String(ch.release_date))}=`;
      return { url };
    });
    return { pages };
  }

  // Helpers
  private extractPageFromFragment(response: string): number | undefined {
    // Network layer does not expose request here; rely on default page size if needed
    // We keep 1 as default.
    return undefined;
  }

  // URL builders for details/chapters/pages
  mangaDetailsRequest(fragment: string): NetworkRequest {
    // fragment: /series/<id>
    const id = fragment.split("/").filter(Boolean).pop() ?? "";
    const path = `series/${id}.json`;
    return this.dataApi(path, { id }, undefined);
  }

  chapterListRequest(fragment: string): NetworkRequest {
    return this.mangaDetailsRequest(fragment);
  }

  pageListRequest(fragment: string): NetworkRequest {
    // fragment: /series/<id>/<token>
    const parts = fragment.split("/").filter(Boolean);
    const seriesId = parts[1] ?? "";
    const token = parts[2] ?? "";
    const path = `series/${seriesId}/${token}.json`;
    return this.dataApi(path, { id: seriesId, token }, undefined);
  }

  // Ensure buildId exists before any network call that relies on Next data
  private async ensureBuild(): Promise<void> {
    await this.getBuildId();
  }

  // Override core methods to ensure build id is ready
  async getPopularManga(page: number): Promise<PagedResult> {
    await this.ensureBuild();
    return super.getPopularManga(page);
  }
  async getLatestManga(page: number): Promise<PagedResult> {
    await this.ensureBuild();
    return super.getLatestManga(page);
  }
  async getSearchManga(searchRequest: DirectoryRequest): Promise<PagedResult> {
    await this.ensureBuild();
    return super.getSearchManga(searchRequest);
  }
  async getMangaDetails(id: string): Promise<Content> {
    await this.ensureBuild();
    return super.getMangaDetails(id);
  }
  async getMangaChapters(id: string): Promise<Chapter[]> {
    await this.ensureBuild();
    return super.getMangaChapters(id);
  }
  async getPageList(_: string, chapter: string): Promise<ChapterData> {
    await this.ensureBuild();
    return super.getPageList(_, chapter);
  }

  // Filters & Sorting
  async getFilterList(): Promise<DirectoryFilter[]> {
    const { statuses, types, tags } = await this.fetchFilterOptions();
    return [
      {
        id: "status",
        title: "Status",
        type: FilterType.SELECT,
        options: [{ id: "Any", title: "Any" }, ...statuses],
      },
      {
        id: "types",
        title: "Types",
        type: FilterType.MULTISELECT,
        options: types,
      },
      {
        id: "tags",
        title: "Tags",
        type: FilterType.MULTISELECT,
        options: tags,
      },
    ];
  }

  async getSortOptions(): Promise<Option[]> {
    return [
      { id: "views", title: "Views" },
      { id: "title-asc", title: "Title (A–Z)" },
      { id: "title-desc", title: "Title (Z–A)" },
    ];
  }

  private async fetchFilterOptions(): Promise<{ statuses: Option[]; types: Option[]; tags: Option[] }> {
    if (this.cachedFilterOptions) return this.cachedFilterOptions;
    await this.ensureBuild();
    const { data } = await this.client.request(this.dataApi("browse.json"));
    const payload = JSON.parse(data) as SearchPageData;
    const series = payload.pageProps.series ?? [];
    const statusSet = new Set<string>();
    const typeSet = new Set<string>();
    const tagSet = new Set<string>();
    for (const s of series) {
      if (s.status) statusSet.add(String(s.status));
      if (s.type) typeSet.add(String(s.type));
      (s.tags ?? []).forEach((t) => tagSet.add(String(t)));
    }
    const statuses: Option[] = Array.from(statusSet).sort().map((v) => ({ id: v.toLowerCase(), title: v }));
    const types: Option[] = Array.from(typeSet).sort().map((v) => ({ id: v.toLowerCase(), title: v }));
    const tags: Option[] = Array.from(tagSet).sort().map((v) => ({ id: v.toLowerCase(), title: v }));
    this.cachedFilterOptions = { statuses, types, tags };
    return this.cachedFilterOptions;
  }
}
