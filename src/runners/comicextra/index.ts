import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { ComicExtra } from "./template";

const info: RunnerInfo = {
  id: "comicextra",
  name: "ComicExtra",
  thumbnail: "comicextra.png",
  version: 0.11,
};
export const Target = new TachiBuilder(info, ComicExtra);
