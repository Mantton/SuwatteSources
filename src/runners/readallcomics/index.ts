import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { Template } from "./template";

const info: RunnerInfo = {
  id: "readallcomics",
  name: "ReadAllComics",
  version: 1,
  website: "https://readallcomics.com",
  thumbnail: "readallcomics.png",
};

export const Target = new TachiBuilder(info, Template);
export default Target;
