import {
  ContentSource,
  ImageRequestHandler,
  NetworkRequest,
  PageLinkResolver,
  RunnerInfo,
} from "@suwatte/daisuke";
import { WCContentSource } from "./contentSource";
import { WCDirectoryHandler } from "./directoryHandler";
import { WCPageLinkResolver } from "./pageResolver";

export const HOST_URL = "https://weebcentral.com";
export const info: RunnerInfo = {
  name: "Weeb Central",
  id: "aegir.weebcentral",
  version: 1.01,
  website: HOST_URL,
  supportedLanguages: ["en_us"],
  thumbnail: "weebcentral.png",
  minSupportedAppVersion: "6.0.0",
};

export const WCImageInterceptor: ImageRequestHandler = {
  willRequestImage: async function (imageURL: string): Promise<NetworkRequest> {
    return {
      url: imageURL,
      headers: {
        Accept: "image/avif,image/webp,*/*",
      },
    };
  },
};

export const Target: ContentSource & PageLinkResolver = {
  info,
  ...WCContentSource,
  ...WCDirectoryHandler,
  ...WCPageLinkResolver,
  ...WCImageInterceptor,
};
