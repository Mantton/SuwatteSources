import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { MangaThemesiaTemplate } from "../../template/mangathemesia";

const info: RunnerInfo = {
  id: "void_scans",
  name: "Infernal Void Scans",
  thumbnail: "void_scans.png",
  version: 0.1,
  website: "https://void-scans.com",
};

class Template extends MangaThemesiaTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en_us";
  name = info.name;

  protected pageSelector = "div#readerarea > p > img";
}

export const Target = new TachiBuilder(info, Template);
