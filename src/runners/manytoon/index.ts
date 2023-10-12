import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "manytoon",
  name: "ManyToon",
  thumbnail: "manytoon.png",
  version: 0.1,
  website: "https://manytoon.com",
};

class Template extends TachiDaraTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en";
  name = info.name;

  protected useNewChapterEndpoint = true;
  protected mangaSubString = "comic";
}

export const Target = new TachiBuilder(info, Template);
