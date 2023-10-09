import { PageLinkLabel, PageLinkProvider } from "@suwatte/daisuke";
import { getEnabledSources } from "../api";
import { getHost } from "../utils/store";

export const SuwayomiPageLinkProvider: PageLinkProvider = {
  getBrowsePageLinks: async (): Promise<PageLinkLabel[]> => {
    const sources = await getEnabledSources();
    const host = await getHost();
    return sources
      .filter((v) => v.lang === "en")
      .map((source) => ({
        title: source.name,
        cover: host + source.iconUrl,
        link: {
          request: {
            page: 1,
            context: {
              sourceId: source.id,
            },
            configKey: source.id,
          },
        },
      }));
  },
};
