import { MDStore } from "./store";

export const API_URL = "https://api.mangadex.org";
export const COVER_URL = "https://uploads.mangadex.org/covers";

export const ADULT_TAG_IDS = [
  "b29d6a3d-1569-4e7a-8caf-7557bc92cd5d",
  "97893a4c-12af-4dac-b6be-0dffb353568e",
  "5bd0e105-4481-44ca-b6e7-7544da56b1a3",
];
export const SEASONAL_LIST_ID = "4be9338a-3402-4f98-b467-43fb56663927";
export const LAST_SEASONAL_LIST_ID = "7df1dabc-b1c5-4e8e-a757-de5a2a3d37e9";
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
