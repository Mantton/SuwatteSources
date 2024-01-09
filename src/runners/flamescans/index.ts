import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { MangaThemesiaTemplate } from "../../template/mangathemesia";

const info: RunnerInfo = {
  id: "flamecomics",
  name: "Flame Comics",
  thumbnail: "flamescans.png",
  version: 0.3,
  website: "https://flamecomics.com",
};

class Template extends MangaThemesiaTemplate {
  baseUrl = "https://flamecomics.com";
  lang = "en_us";
  name = "Flame Comics";

  protected mangaUrlDirectory = "/series/";
}

export const Target = new TachiBuilder(info, Template);
