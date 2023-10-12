import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "lhtranslation",
  name: "LHTranslation",
  thumbnail: "lhtranslation.png",
  version: 0.1,
  website: "https://lhtranslation.net",
};

class Template extends TachiDaraTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en";
  name = info.name;

  protected useNewChapterEndpoint = true;
}

export const Target = new TachiBuilder(info, Template);
