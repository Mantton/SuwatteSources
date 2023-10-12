import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "luffymanga",
  name: "Luffy Manga",
  thumbnail: "luffymanga.png",
  version: 0.1,
  website: "https://luffymanga.com",
};

class Template extends TachiDaraTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en";
  name = info.name;

  protected useNewChapterEndpoint = false;

  protected searchPage(page: number): string {
    return page == 1 ? "" : `page/${page}/`;
  }
}

export const Target = new TachiBuilder(info, Template);
