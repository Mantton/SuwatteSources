import { NetworkRequest, RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { Manhwa18CCTemplate } from "../../template/manhwa18cc";

const info: RunnerInfo = {
  id: "manhwa18_cc_kr",
  name: "Manhwa 18 CC (KR)",
  thumbnail: "manhwa18cc.png",
  version: 0.1,
  website: "https://manhwa18.cc",
};

class Template extends Manhwa18CCTemplate {
  baseUrl = "https://manhwa18.cc";
  lang = "kr";
  name = info.name;

  popularMangaSelector(): string {
    return "div.manga-item:has(h3 a[title$='Raw'])";
  }
  popularMangaRequest(page: number): NetworkRequest {
    return {
      url: `${this.baseUrl}/raw/${page}`,
    };
  }
}

export const Target = new TachiBuilder(info, Template);
