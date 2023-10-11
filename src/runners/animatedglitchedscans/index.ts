import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { MangaThemesiaTemplate } from "../../template/mangathemesia";

const info: RunnerInfo = {
  id: "animated_glitched_scans",
  name: "Animated Glitched Scans",
  thumbnail: "ags.png",
  version: 0.1,
  website: "https://anigliscans.xyz",
};

class Template extends MangaThemesiaTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en_us";
  name = info.name;

  protected mangaUrlDirectory = "/series";
}

export const Target = new TachiBuilder(info, Template);
