import { DirectoryRequest, PageSection, PagedResult } from "@suwatte/daisuke";
import {
  HIGHLIGHT_LIMIT,
  HOME_PAGE_SECTIONS,
  PATHS,
  SORT_KEYS,
} from "./constants";
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
  // Directory
  private async getDirectoryString() {
    if (this.directoryHTML) {
      return this.directoryHTML;
    }
    const url = await this.store.host();
    const response = await this.client.get(`${url}/search/`); // trailing slash required to avoid insecure redirect
    const html = response.data;
    this.directoryHTML = html;
    return this.directoryHTML;
  }
  private async fetchDirectory() {
    const html = await this.getDirectoryString();
    const regex = PATHS.directory;
    const dirStr = html.match(regex)?.[1];
    if (!dirStr) throw new Error("Failed to parse NepNep Directory");
    this.directory = JSON.parse(dirStr);
  }

  async buildHomePageSections() {
    const host = await this.store.host();
    const { data: response } = await this.client.get(host);

    const temp = response.match(/ng-src="(.*\.jpg)"/)?.[1];
    if (temp) this.parser.THUMBNAIL_TEMPLATE = temp;

    const out: PageSection[] = [];
    for (const section of HOME_PAGE_SECTIONS) {
      const regex = PATHS[section.id];
      const str = response.match(regex)?.[1];

      if (!str) {
        console.error(`[${section.id}] Failed to match section`);
        continue;
      }
      const items = this.parser.homepageSection(JSON.parse(str));
      out.push({ ...section, items });
    }
    return out;
  }

  // Search
  async getFilters() {
    const html = await this.getDirectoryString();
    return this.parser.filters(html);
  }
  async getSearchResults(request: DirectoryRequest): Promise<PagedResult> {
    // Populate if empty
    if (this.directory.length == 0) {
      await this.fetchDirectory();
    }
    const temp = this.directoryHTML.match(/ng-src="(.*\.jpg)"/)?.[1];
    if (temp) this.parser.THUMBNAIL_TEMPLATE = temp;
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
      results,
      isLastPage: results.length < HIGHLIGHT_LIMIT,
      totalResultCount: matches.length,
    };
  }
  matchesRequest(entry: DirectoryEntry, request: ParsedRequest): boolean {
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
  //   // Content
  async getContent(id: string) {
    const host = await this.store.host();
    const response = await this.client.get(`${host}/manga/${id}`);
    const html = response.data;
    return this.parser.content(html, id, host);
  }
  // Chapters
  async getChapters(id: string) {
    const host = await this.store.host();
    const response = await this.client.get(`${host}/manga/${id}`);
    const html = response.data;
    return this.parser.chapters(html);
  }
  async getChapterData(contentId: string, chapterId: string) {
    const host = await this.store.host();
    const suffix = prepareURLSuffix(chapterId);
    const url = `${host}/read-online/${contentId}${suffix}`;
    const response = await this.client.get(url);
    return this.parser.chapterData(response.data);
  }
}
