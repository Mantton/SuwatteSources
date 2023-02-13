import { Content, SearchRequest } from "@suwatte/daisuke";
import { CheerioAPI, load } from "cheerio";
import {
  parseChapterData,
  parseChapters,
  parseContent,
  parseHomePageLatestSection,
  parseHomePageNewSection,
  parseHomePageTopSection,
  parseSearchRequest,
  parseSearchResponse,
} from "./parser";

export class Controller {
  private client = new NetworkClient();
  private homepage: CheerioAPI | undefined;

  async getHomePage() {
    const { data } = await this.client.get("https://manganato.com");
    this.homepage = load(data);
  }

  async resolveExploreCollection(id: string) {
    if (!this.homepage) throw new Error("Homepage Not Initialized");
    switch (id) {
      case "top":
        return parseHomePageTopSection(this.homepage);
      case "new":
        return parseHomePageNewSection(this.homepage);
      case "latest":
        return parseHomePageLatestSection(this.homepage);
    }
    throw "Invalid Collection ID";
  }

  async getSearchResults(request: SearchRequest) {
    const params = parseSearchRequest(request);

    const { data } = await this.client.get(
      "https://manganato.com/advanced_search",
      { params }
    );

    const results = parseSearchResponse(data);
    return results;
  }

  async getContent(contentId: string): Promise<Content> {
    const { data } = await this.client.get(
      `https://chapmanganato.com/${contentId}`
    );

    return parseContent(data, contentId);
  }

  async getChapters(contentId: string) {
    const { data } = await this.client.get(
      `https://chapmanganato.com/${contentId}`
    );

    const chapters = parseChapters(data, contentId);
    return chapters;
  }

  async getChapterData(contentId: string, chapterId: string) {
    const { data } = await this.client.get(
      `https://chapmanganato.com/${contentId}/${chapterId}`
    );

    const pages = parseChapterData(data);
    return {
      contentId,
      chapterId,
      pages,
    };
  }
}
