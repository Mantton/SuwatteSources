import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "freemangatop",
  name: "FreeMangaTop",
  thumbnail: "elitemanga.png",
  version: 0.1,
  website: "https://freemangatop.com",
};

class Template extends TachiDaraTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en";
  name = info.name;

  protected filterNonMangaItems = false;
}

export const Target = new TachiBuilder(info, Template);
