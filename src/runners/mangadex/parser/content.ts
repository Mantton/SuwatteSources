import {
  Content,
  ContentType,
  HighlightCollection,
  Property,
  PublicationStatus,
  ReadingMode,
  Tag,
} from "@suwatte/daisuke";
import { decode } from "he";
import { capitalize } from "lodash";
import { languageLabel } from "../utils";
import { ADULT_TAG_IDS } from "../constants";
import {
  getMDCovers,
  getMDRelatedCollections,
  getMDStatistics,
} from "../misc/md";

export const parseContent = async (
  { data }: any,
  contentId: string
): Promise<Content> => {
  const attributes = data.attributes;
  const relationships = data.relationships;

  const titles = [attributes.title[Object.keys(attributes.title)[0]]].concat(
    attributes.altTitles.map((x: any) => decode(x[Object.keys(x)[0]]))
  );
  let nsfw = false;
  const summary = decode(attributes.description.en ?? "").replace(
    /\[\/{0,1}[bus]\]/g,
    ""
  );
  // Status
  let status: PublicationStatus | undefined;
  switch (attributes.status) {
    case "ongoing": {
      status = PublicationStatus.ONGOING;
      break;
    }
    case "completed": {
      status = PublicationStatus.COMPLETED;
      break;
    }
    case "hiatus": {
      status = PublicationStatus.HIATUS;
      break;
    }
    case "cancelled": {
      status = PublicationStatus.CANCELLED;
      break;
    }
  }

  // Properties
  const properties: Property[] = [];

  // Genres
  const genreTags: Tag[] = [];
  for (const tag of attributes.tags) {
    const tagIsNSFW = ADULT_TAG_IDS.includes(tag.id);
    const t: Tag = {
      id: tag.id,
      nsfw: tagIsNSFW,
      title: tag.attributes.name.en,
    };

    if (tagIsNSFW) {
      nsfw = true;
    }

    genreTags.push(t);
  }
  const propertyTags: Property = {
    id: "genres",
    title: "Genres",
    tags: genreTags,
  };
  properties.push(propertyTags);

  // * Reading Mode
  let recommendedPanelMode = ReadingMode.PAGED_MANGA;
  const longStripId = "3e2b8dae-350e-4ab8-a8ce-016e844b9f0d";
  const fullColorId = "f5ba408b-0e7a-484d-8d49-4e9125ac96de";
  const mapped = genreTags.map((v) => v.id);

  if (mapped.includes(longStripId)) {
    recommendedPanelMode = ReadingMode.WEBTOON;
  } else if (mapped.includes(fullColorId)) {
    recommendedPanelMode = ReadingMode.PAGED_COMIC;
  }

  // * Content Rating & Publication Demographic & Original Language
  if (attributes.contentRating) {
    const tags: Tag[] = [];
    const tag: Tag = {
      id: attributes.contentRating.toLowerCase(),
      title: capitalize(attributes.contentRating),
      nsfw: attributes.contentRating == "pornographic",
    };
    if (!nsfw) nsfw = attributes.contentRating == "pornographic";
    tags.push(tag);
    const contentRatingProperty: Property = {
      id: "content_rating",
      title: "Content Rating",
      tags,
    };
    properties.push(contentRatingProperty);
  }

  // Original Language
  const originalLang = attributes.originalLanguage;
  if (originalLang) {
    const tags: Tag[] = [];
    const languageTag: Tag = {
      id: originalLang,
      title: languageLabel(originalLang ?? "unknown"),
      nsfw: false,
    };

    // Properly Rename, Common Languages

    tags.push(languageTag);
    const languageTags: Property = {
      id: "lang",
      title: "Original Language",
      tags,
    };
    properties.push(languageTags);
  }

  // Creators
  const credits = relationships.filter((x: any) =>
    ["author", "artist"].includes(x.type)
  );
  const authors = relationships
    .filter((x: any) => x.type == "author")
    .map((x: any) => x.attributes.name);

  const artists = relationships
    .filter((x: any) => x.type == "artist")
    .map((x: any) => x.attributes.name);

  if (credits.length != 0) {
    try {
      const tags: Tag[] = [];
      // Clickable artist & author properties
      const appendedIds: any = [];

      credits.forEach((obj: any) => {
        const tag: Tag = {
          id: obj.id,
          title: decode(obj.attributes.name),
          nsfw: false,
        };

        if (!appendedIds.includes(obj.id)) {
          tags.push(tag);
          appendedIds.push(obj.id);
        }
      });
      const creditsProperty: Property = {
        id: "authors",
        title: "Credits",
        tags,
      };
      properties.push(creditsProperty);

      // let ids = creators;
    } catch (err) {
      // handle error
      console.log("MangaDex: Failed To Parse Creators");
    }
  }
  // Links

  const trackerInfo: Record<string, string> = {
    al: attributes?.links?.al,
    kt: attributes?.links?.kt,
    mal: attributes?.links?.mal,
    mu: attributes?.links?.mu,
  };

  // Related Content
  const includedCollections: HighlightCollection[] = [];
  const relatedManga = relationships
    .filter((v: any) => v.type === "manga")
    .map((v: any) => v.id);

  if (relatedManga.length > 0) {
    const highlights = await getMDRelatedCollections(relatedManga);
    includedCollections.push({
      id: "related_manga",
      title: "Related Titles",
      highlights,
    });
  }
  const covers = (await getMDCovers([contentId]))[contentId];
  const stats = (await getMDStatistics([contentId]))[contentId];

  const info = [
    `📚 Follows: ${stats.follows.toLocaleString()}`,
    stats.rating ? `⭐️ Rating: ${stats.rating.toFixed(1)} / 10 ` : "",
  ].filter((v) => !!v);

  let contentType: ContentType | undefined;

  switch (originalLang) {
    case "jp":
      contentType = ContentType.MANGA;
      break;
    case "ko":
      contentType = ContentType.MANHWA;
      break;
  }
  return {
    title: titles[0],
    additionalTitles: titles,
    cover: covers[0],
    additionalCovers: covers,
    properties,
    summary,
    webUrl: `https://mangadex.org/title/${contentId}`,
    trackerInfo,
    status,
    creators: Array.from(new Set(artists.concat(authors))),
    isNSFW: nsfw,
    recommendedPanelMode,
    collections: includedCollections,
    contentType,
    info,
  };
};
