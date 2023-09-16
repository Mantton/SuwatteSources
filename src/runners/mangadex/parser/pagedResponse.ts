import { Highlight, PagedResult } from "@suwatte/daisuke";
import { decode } from "he";
import { getMDCovers } from "../misc/md";
import { COVER_URL, GlobalStore } from "../constants";

export async function parsePagedResponse(
  json: any,
  fetchCovers = false
): Promise<PagedResult> {
  // batch
  const highlights = (json.data as any[]).map(async (manga: any) => {
    const attributes = manga.attributes;

    const tags: string[] = attributes.tags
      .map((tag: any) => tag.attributes.name.en)
      .slice(0, 4);
    const title = decode(attributes.title[Object.keys(attributes.title)[0]]);
    const fileName = manga.relationships
      .filter((x: any) => x.type == "cover_art")
      .map((x: any) => x.attributes?.fileName)[0];

    const suffix = await GlobalStore.getCoverQuality();
    const defaultCover = `${COVER_URL}/${manga.id}/${fileName}${suffix}`;

    const highlight: Highlight = {
      title,
      info: [tags.join(", ")],
      cover: defaultCover,
      id: manga.id,
    };

    if (fetchCovers) {
      highlight.additionalCovers = (await getMDCovers([manga.id]))[
        manga.id
      ].slice(0, 5);
    }
    return highlight;
  });
  const results = await Promise.all(highlights);
  return {
    results,
    isLastPage: highlights.length === 0,
    totalResultCount: json.total,
  };
}
