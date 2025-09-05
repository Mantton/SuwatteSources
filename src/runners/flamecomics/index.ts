import { TachiBuilder } from "../../template/tachiyomi";
import { Template } from "./template";

export const Target = new TachiBuilder(
  {
    id: "flamecomics",
    name: "Flame Comics",
    version: 1.1,
    website: "https://flamecomics.xyz",
    thumbnail: "flamescans.png",
  },
  Template
);

export default Target;
