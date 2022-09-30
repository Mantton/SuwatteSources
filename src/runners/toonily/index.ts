import { RunnerType, SourceInfo } from "@suwatte/daisuke";
import { MadaraTemplate } from "../../multi/madara2";
import { DEFAULT_CONTEXT } from "../../multi/madara2/constants";
import { Context } from "../../multi/madara2/types";
// import { Madara } from "../../multi/madara";

export class Target extends MadaraTemplate {
  info: SourceInfo = {
    id: "com.toonily",
    name: "Toonily",
    thumbnail: "toonily.png",
    version: 1.0,
    hasExplorePage: true,
    primarilyAdultContent: true,
    website: "https://toonily.com",
    supportedLanguages: ["GB"],
  };

  // Template Variables
  // BASE_URL = "https://toonily.com";
  // CONTENT_TRAVERSAL_PATH = "webtoon";
  // GENRE_TRAVERSAL_PATH = "webtoon-genre";
  // HAS_ADVANCED_SEARCH = true;
  // async getCFRequestURL() {
  //   return this.BASE_URL;
  // }

  constructor() {
    super({
      ...DEFAULT_CONTEXT,
      baseUrl: "https://toonily.com",
      contentPath: "webtoon",
    });
  }
}
