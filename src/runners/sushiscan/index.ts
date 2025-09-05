import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { Template } from "./template";

const info: RunnerInfo = {
  id: "sushiscan",
  name: "Sushi-Scan",
  version: 1,
  website: "https://sushiscan.net",
  supportedLanguages: ["fr"],
  thumbnail: "sushiscanlogo.webp",
};

export const Target = new TachiBuilder(info, Template);
export default Target;
