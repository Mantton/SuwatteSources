import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "1stmanhwa",
  name: "1st Manhwa",
  thumbnail: "1stmanhwa.png",
  version: 0.1,
  website: "https://1stmanhwa.com",
};

class Template extends TachiDaraTemplate {
  baseUrl = "https://1stmanhwa.com";
  lang = "en";
  name = info.name;

  protected searchPage(page: number): string {
    return page == 1 ? "" : `page/${page}/`;
  }

  protected useNewChapterEndpoint = true;
  protected filterNonMangaItems = false;
  protected mangaDetailsSelectorStatus =
    "div.summary-heading:contains(Status) + div.summary-content";

  protected mangaDetailsSelectorTitle = "#manga-title";
}

export const Target = new TachiBuilder(info, Template);
