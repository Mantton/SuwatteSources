import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "toongod",
  name: "ToonGod",
  thumbnail: "toongod.png",
  version: 0.1,
  website: "https://www.toongod.org",
};

class Template extends TachiDaraTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en";
  name = info.name;

  protected searchPage(page: number): string {
    return page == 1 ? "" : `page/${page}/`;
  }

  protected mangaSubString = "webtoons";
  protected useNewChapterEndpoint = false;
  protected dateFormat = "D MMM YYYY";
}

export const Target = new TachiBuilder(info, Template);
