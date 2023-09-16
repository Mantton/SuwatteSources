import {
  Chapter,
  Provider,
  ProviderLink,
  ProviderLinkType,
} from "@suwatte/daisuke";
import { decode } from "he";
import { CONTENT_RATINGS, GlobalStore } from "../constants";
import { languageCode } from "../utils";
import { GET } from "../network";

export const getChapters = async (contentId: string) => {
  const translatedLanguage = await GlobalStore.getLanguages();
  const chapters: Chapter[] = [];
  let offset = 0;
  const limit = 500;
  let loop = true;
  let index = 0;
  while (loop) {
    const path = `/manga/${contentId}/feed`;
    const params = {
      limit,
      offset,
      translatedLanguage,
      contentRating: CONTENT_RATINGS,
      includes: ["scanlation_group"],
      "order[volume]": "desc",
      "order[chapter]": "desc",
      "order[publishAt]": "desc",
    };

    const json = await GET(path, { params });

    for (const chapter of json.data) {
      const id = chapter.id;
      const attributes = chapter.attributes;
      const title = attributes.title ? decode(attributes.title) : undefined;
      const number = Number(attributes.chapter);
      const volume = attributes.volume ? Number(attributes.volume) : undefined;
      const date = new Date(attributes.publishAt);
      const language = languageCode(attributes.translatedLanguage);

      let webUrl = attributes.externalUrl;
      if (!webUrl) {
        webUrl = `https://mangadex.org/chapter/${id}`;
      }

      const providers: Provider[] = chapter.relationships
        .filter((v: any) => v.type === "scanlation_group")
        .map((data: any): Provider => {
          const links: ProviderLink[] = [];

          if (data.attributes.website) {
            links.push({
              type: ProviderLinkType.WEBSITE,
              url: data.attributes.website,
            });
          }

          if (data.attributes.twitter) {
            links.push({
              type: ProviderLinkType.TWITTER,
              url: data.attributes.twitter,
            });
          }

          if (data.attributes.discord) {
            const str = data.attributes.discord;
            links.push({
              type: ProviderLinkType.DISCORD,
              url: `https://discord.gg/${str}`,
            });
          }

          return {
            id: data.id,
            name: data.attributes.name,
            links,
          };
        });

      if (attributes.pages <= 0) {
        continue;
      }
      chapters.push({
        chapterId: id,
        title,
        number,
        volume,
        date,
        language,
        webUrl,
        providers,
        index,
      });
      index++;
    }

    offset += 500;
    if (json.total <= offset) {
      loop = false;
    }
  }

  return chapters;
};

export const parseChapterData = async (json: any) => {
  const isDataSaver = await GlobalStore.getDSMode();

  const serverUrl = json.baseUrl;
  const chapter = json.chapter;
  const key = isDataSaver ? "dataSaver" : "data";
  const path = isDataSaver ? "data-saver" : "data";
  const urls = chapter[key].map((v: string) => ({
    url: `${serverUrl}/${path}/${chapter.hash}/${v}`,
  }));
  return urls;
};
