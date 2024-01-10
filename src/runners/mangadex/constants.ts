import { MDStore } from "./store";

export const API_URL = "https://api.mangadex.org";
export const COVER_URL = "https://uploads.mangadex.org/covers";

export const ADULT_TAG_IDS = [
  "b29d6a3d-1569-4e7a-8caf-7557bc92cd5d",
  "97893a4c-12af-4dac-b6be-0dffb353568e",
  "5bd0e105-4481-44ca-b6e7-7544da56b1a3",
];
export const SEASONAL_LIST_ID = "907b6e91-b511-4095-927f-30227ccadfdc";
export const LAST_SEASONAL_LIST_ID = "1b9f88f8-9880-464d-9ed9-59b7e36392e2";
export const STAFF_PICKS_LIST_ID = "805ba886-dd99-4aa4-b460-4bd7c7b71352";
export const RESULT_LIMIT = 30;
export const DEMOGRAPHICS = ["shounen", "shoujo", "seinen", "josei", "none"];
export const CONTENT_RATINGS = [
  "safe",
  "suggestive",
  "erotica",
  "pornographic",
];
export const LANGUAGES = ["en", "ko", "ja", "zh", "zh-hk"];
export const PUBLICATION_STATUS = [
  "ongoing",
  "completed",
  "hiatus",
  "cancelled",
];

export const GlobalStore = new MDStore();
