import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { RCO } from "./template";

const info: RunnerInfo = {
  id: "rco",
  name: "ReadComicOnline",
  thumbnail: "rco.png",
  version: 0.1,
};
export const Target = new TachiBuilder(info, RCO);
