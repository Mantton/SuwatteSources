import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { MangaThemesiaTemplate } from "../../template/mangathemesia";

const info: RunnerInfo = {
  id: "arvens_scans",
  name: "Arven Scans",
  thumbnail: "arven_scans.png",
  version: 0.1,
  website: "https://arvenscans.com",
};

class Template extends MangaThemesiaTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en_us";
  name = info.name;

  protected mangaUrlDirectory = "/series";
}

export const Target = new TachiBuilder(info, Template);
