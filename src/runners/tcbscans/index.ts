import { RunnerInfo } from "@suwatte/daisuke";
import { TachiBuilder } from "../../template/tachiyomi";
import { TCBScans } from "./template";

const info: RunnerInfo = {
  id: "tcbscans",
  name: "TCB Scans",
  thumbnail: "tcb.png",
  version: 0.1,
};
export const Target = new TachiBuilder(info, TCBScans);
