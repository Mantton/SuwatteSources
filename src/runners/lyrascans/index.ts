import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { MangaThemesiaTemplate } from "../../template/mangathemesia";

const info: RunnerInfo = {
  id: "lyra_scans",
  name: "Lyra Scans",
  thumbnail: "lyra_scans.png",
  version: 0.1,
  website: "https://lyrascans.com",
};

class Template extends MangaThemesiaTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en_us";
  name = info.name;
}

export const Target = new TachiBuilder(info, Template);
