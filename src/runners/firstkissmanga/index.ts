import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "first_kiss_manga_net",
  name: "1st Kiss Manga",
  thumbnail: "1km.png",
  version: 0.1,
  website: "https://1st-kissmanga.net",
};

class Template extends TachiDaraTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en";
  name = info.name;
}

export const Target = new TachiBuilder(info, Template);
