import { RunnerInfo } from "@suwatte/daisuke";
import { MMRCMSTemplate } from "../../template/mmrcms";
import { TachiBuilder } from "../../template/tachiyomi";

const info: RunnerInfo = {
  id: "rco_ru",
  name: "ReadComicsOnline",
  thumbnail: "rco_ru.png",
  version: 0.1,
};

class Template extends MMRCMSTemplate {
  DATE_FORMAT = "d MMM. yyyy";
  ITEM_URL = "https://readcomicsonline.ru/comic/";
  baseUrl = "https://readcomicsonline.ru";
  lang = "en";
  supportsLatest = false;
  name = info.name;
}
export const Target = new TachiBuilder(info, Template);
