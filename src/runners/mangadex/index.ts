import { CatalogRating, ContentSource, RunnerInfo } from "@suwatte/daisuke";
import {
  MDBasicAuthProvider,
  MDContentSource,
  MDPageLinkResolver,
  MDPreferenceProvider,
  MDLibraryEventHandler,
  MDContentSyncHandler,
  MDProgressStateHandler,
} from "./impl";
import { MDDirectoryHandler } from "./impl/directoryHandler";
import { languages } from "./utils";

export const info: RunnerInfo = {
  name: "MangaDex",
  id: "org.mangadex",
  version: 1.82,
  website: "https://mangadex.org",
  supportedLanguages: languages.map((v) =>
    v.languageCode.includes("-")
      ? v.languageCode
      : v.languageCode + "-" + v.regionCode
  ),
  thumbnail: "mangadex.png",
  minSupportedAppVersion: "6.0.0",
  rating: CatalogRating.MIXED,
};

export const Target: ContentSource = {
  info,
  ...MDContentSource,
  ...MDDirectoryHandler,
  ...MDPageLinkResolver,
  ...MDPreferenceProvider,
  ...MDBasicAuthProvider,
  ...MDLibraryEventHandler,
  ...MDContentSyncHandler,
  ...MDProgressStateHandler,
};
