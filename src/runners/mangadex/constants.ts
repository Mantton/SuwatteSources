import { MDStore } from "./store";

export const API_URL = "https://api.mangadex.org";
export const COVER_URL = "https://uploads.mangadex.org/covers";

export const ADULT_TAG_IDS = [
  "b29d6a3d-1569-4e7a-8caf-7557bc92cd5d",
  "97893a4c-12af-4dac-b6be-0dffb353568e",
  "5bd0e105-4481-44ca-b6e7-7544da56b1a3",
];

export const SEASONAL_LIST_ID = "68ab4f4e-6f01-4898-9038-c5eee066be27";
export const LAST_SEASONAL_LIST_ID = "328b04cf-aad6-4e2d-b3fc-4694075b8437";
export const STAFF_PICKS_LIST_ID = "805ba886-dd99-4aa4-b460-4bd7c7b71352";
export const SELF_PUBLISHED_LIST_ID = "f66ebc10-ef89-46d1-be96-bb704559e04a";
export const FEATURED_LIST_ID = "5c5e6e39-0b4b-413e-be59-27b1ba03d1b9";

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
