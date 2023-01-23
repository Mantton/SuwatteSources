import {
  CollectionExcerpt,
  ExploreCollection,
  PagedResult,
  Property,
  SearchRequest,
} from "@suwatte/daisuke";
import { data } from "cheerio/lib/api/attributes";
import { HIGHLIGHT_LIMIT, PATHS, SORT_KEYS } from "./constants";
import { Parser } from "./parser";
import { Store } from "./store";
import { DirectoryEntry, ParsedRequest } from "./types";
import { dynamicSort, prepareURLSuffix } from "./utils";

export class Controller {
  private client = new NetworkClient();
  private parser = new Parser();
  private store = new Store();

  private directory: DirectoryEntry[] = [];
  private directoryHTML = "";
  // private homeHTML: String = "";

  // Directory
  async populate() {
    await this.fetchDirectory();
  }

  private async fetchDirectory() {
    const url = await this.store.host();
    const response = await this.client.get(`${url}/search`);

    const html = response.data;
    this.directoryHTML = html;
    this.parser.thumbnail(html);
    const regex = PATHS.directory;
    const dirStr = html.match(regex)?.[1];

    if (!dirStr) throw new Error("Failed to parse NepNep Directory");
    this.directory = JSON.parse(dirStr);
  }

  private async fetchHomePage(): Promise<string> {
    const host = await this.store.host();
    const response = await this.client.get(host);
    return response.data;
  }

  // Explore
  async resolveExcerpt(excerpt: CollectionExcerpt): Promise<ExploreCollection> {
    const html = await this.fetchHomePage();
    const regex = PATHS[excerpt.id];
    const str = html.match(regex)?.[1];

    if (!str) throw new Error("Failed to Match HomePage Section");
    const highlights = this.parser.homepageSection(JSON.parse(str));

    return { ...excerpt, highlights };
  }

  // Search
  async getFilters() {
    if (!this.directoryHTML) {
      await this.fetchDirectory();
    }
    return this.parser.filters(this.directoryHTML);
  }

  async getSearchResults(request: SearchRequest): Promise<PagedResult> {
    // Populate if empty
    if (this.directory.length == 0) {
      await this.populate();
    }

    const key = SORT_KEYS[request.sort?.id ?? ""] ?? "v";

    const parsed = this.parser.search(request);

    const matches = this.directory.filter((v) =>
      this.matchesRequest(v, parsed)
    );
    const page = request.page ?? 1;
    const min = HIGHLIGHT_LIMIT * (page - 1);
    const max = HIGHLIGHT_LIMIT * page;

    if (key !== "s") {
      matches.sort(dynamicSort(key));
    }

    const results = matches
      .slice(min, max)
      .map((v) => this.parser.toHighlight(v));

    return {
      page,
      results,
      isLastPage: results.length <= HIGHLIGHT_LIMIT,
      totalResultCount: matches.length,
    };
  }

  matchesRequest(entry: DirectoryEntry, request: ParsedRequest): Boolean {
    let match = true;
    // Author
    if (request.authors && request.authors.length > 0) {
      const hasAuthor = (name: string) => {
        return (entry.a ?? [])
          .map((v) => v.toLowerCase().trim())
          .includes(name.toLowerCase().trim());
      };
      match = request.authors.some(hasAuthor);
      // Check
      if (!match) {
        return false;
      }
    }
    // Query
    if (request.query) {
      const str = [...(entry.al ?? []), entry.s].join(" ");
      match = str.toLowerCase().includes(request.query.toLowerCase());
      // Check
      if (!match) {
        return false;
      }
    }

    // Release Year
    if (request.released) {
      match = entry.y == request.released;
      // Check
      if (!match) {
        return false;
      }
    }

    // Official Translation
    if (request.originalTranslation) {
      match = entry.o === "yes";
      // Check
      if (!match) {
        return false;
      }
    }

    // Included Types
    if (request.includeTypes && request.includeTypes.length > 0) {
      match = request.includeTypes.includes(entry.t.toLowerCase());
      // Check
      if (!match) {
        return false;
      }
    }
    // Excluded Types
    if (request.excludeTypes && request.excludeTypes.length > 0) {
      match = !request.excludeTypes.includes(entry.t.toLowerCase());
      // Check
      if (!match) {
        return false;
      }
    }

    // Scan Status
    if (request.s_status && request.s_status.length > 0) {
      match = request.s_status.includes(entry.ss.toLowerCase());
      // Check
      if (!match) {
        return false;
      }
    }

    // Publication Status
    if (request.p_status && request.p_status.length > 0) {
      match = request.p_status.includes(entry.ps.toLowerCase());
      // Check
      if (!match) {
        return false;
      }
    }

    /**
     * checks if the entry's genre list contains provided genre
     * @param v Genre Name
     */
    const hasTag = (v: string) => {
      return (entry.g ?? [])
        .map((v) => v.toLowerCase().trim())
        .includes(v.toLowerCase().trim());
    };

    // Included Tags
    if (request.includedTags && request.includedTags.length > 0) {
      match = request.includedTags.every(hasTag);
      // Check
      if (!match) {
        return false;
      }
    }

    // Excluded Tags
    if (request.excludedTags && request.excludedTags.length > 0) {
      match = !request.excludedTags.some(hasTag);
      if (!match) {
        return false;
      }
    }

    return true;
  }

  // Content
  async getContent(id: string) {
    const host = await this.store.host();
    const response = await this.client.get(`${host}/manga/${id}`);
    const html = response.data;

    if (!this.parser.hasThumbnail()) {
      await this.populate();
    }
    return this.parser.content(html, id, host);
  }

  // Chapters
  async getChapters(id: string) {
    const host = await this.store.host();
    const response = await this.client.get(`${host}/manga/${id}`);
    const html = response.data;
    return this.parser.chapters(html, id);
  }

  async getChapterData(contentId: string, chapterId: string) {
    const host = await this.store.host();
    const suffix = prepareURLSuffix(chapterId);
    const url = `${host}/read-online/${contentId}${suffix}`;

    const response = await this.client.get(url);
    return this.parser.chapterData(response.data, chapterId, contentId);
  }
}
