import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TachiDaraTemplate } from "../../template/tachidara";

const info: RunnerInfo = {
  id: "madaradex",
  name: "MadaraDex",
  thumbnail: "madaradex.png",
  version: 0.1,
  website: "https://madaradex.org",
};

class Template extends TachiDaraTemplate {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  baseUrl = info.website!;
  lang = "en";
  name = info.name;

  protected dateFormat = "MMM D, YYYY";
  protected mangaSubString = "title";
}

export const Target = new TachiBuilder(info, Template);
