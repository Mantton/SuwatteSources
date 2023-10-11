import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { MangaThemesiaTemplate } from "../../template/mangathemesia";

const info: RunnerInfo = {
  id: "cosmic_scans",
  name: "Cosmic Scans",
  thumbnail: "cosmic_scans.png",
  version: 0.1,
  website: "https://cosmicscans.com",
};

class Template extends MangaThemesiaTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en_us";
  name = info.name;
  protected pageSelector = "div#readerarea img[data-src]";
}

export const Target = new TachiBuilder(info, Template);
