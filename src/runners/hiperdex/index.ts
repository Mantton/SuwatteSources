import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "hiperdex",
  name: "Hiperdex",
  thumbnail: "hiperdex.png",
  version: 0.1,
  website: "https://hiperdex.com",
};

class Hiperdex extends TachiDaraTemplate {
  baseUrl = "https://hiperdex.com";
  lang = "en";
  name = info.name;

  protected searchPage(page: number): string {
    return page == 1 ? "" : `page/${page}/`;
  }

  protected useNewChapterEndpoint = true;
}

export const Target = new TachiBuilder(info, Hiperdex);
