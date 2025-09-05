import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { Template } from "./template";

const info: RunnerInfo = {
  id: "asurascans",
  name: "Asura Scans",
  version: 0.33,
  website: "https://asuracomic.net",
  thumbnail: "asurascan.png",
};

export const Target = new TachiBuilder(info, Template);
