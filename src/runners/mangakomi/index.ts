import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "mangakomi",
  name: "MangaKomi",
  thumbnail: "mangakomi.png",
  version: 0.1,
  website: "https://mangakomi.io",
};

class Template extends TachiDaraTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en";
  name = info.name;
}

export const Target = new TachiBuilder(info, Template);
