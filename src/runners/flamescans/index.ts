import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { MangaThemesiaTemplate } from "../../template/mangathemesia";

const info: RunnerInfo = {
  id: "flamescans",
  name: "Flame Scans",
  thumbnail: "flamescans.png",
  version: 0.1,
  website: "https://flamescans.org",
};

class Template extends MangaThemesiaTemplate {
  baseUrl = "https://flamescans.org";
  lang = "en_us";
  name = "Flame Scans";

  protected mangaUrlDirectory = "/series";
}

export const Target = new TachiBuilder(info, Template);
