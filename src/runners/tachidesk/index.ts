"stt_env wk";
import { ContentSource, RunnerInfo, SourceConfig } from "@suwatte/daisuke";
import { SuwayomiContentSource } from "./impl/contentSource";
import { SuwayomiDirectoryHandler } from "./impl/directoryHandler";
import { SuwayomiPageLinkProvider, SuwayomiSetupBuilder } from "./impl";

// Define
type TachiDesk = ContentSource;

// Info
const info: RunnerInfo = {
  id: "lite.tachidesk",
  name: "TachiDesk",
  version: 1.0,
  minSupportedAppVersion: "6.0.0",
  thumbnail: "tachidesk.png",
  website: "https://suwayomi.org",
  supportedLanguages: [],
};

// Config

export const Target: TachiDesk = {
  info,
  ...SuwayomiContentSource,
  ...SuwayomiDirectoryHandler,
  ...SuwayomiPageLinkProvider,
  ...SuwayomiSetupBuilder,
};
