import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "lilymanga",
  name: "LilyManga",
  thumbnail: "lilymanga.png",
  version: 0.1,
  website: "https://lilymanga.net",
};

class Template extends TachiDaraTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en";
  name = info.name;
  protected mangaSubString = "ys";
  protected dateFormat = "YYYY-MM-DD";
}

export const Target = new TachiBuilder(info, Template);
