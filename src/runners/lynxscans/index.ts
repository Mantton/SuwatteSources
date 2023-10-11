import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { MangaThemesiaTemplate } from "../../template/mangathemesia";

const info: RunnerInfo = {
  id: "lynx_scans",
  name: "Lynx Scans",
  thumbnail: "lynx_scans.png",
  version: 0.1,
  website: "https://lynxscans.com",
};

class Template extends MangaThemesiaTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en_us";
  name = info.name;

  protected mangaUrlDirectory = "/comics";
}

export const Target = new TachiBuilder(info, Template);
