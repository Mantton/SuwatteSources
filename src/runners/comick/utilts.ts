import {
  Chapter,
  Content,
  DirectoryRequest,
  Highlight,
  Property,
  PublicationStatus,
  ReadingMode,
} from "@suwatte/daisuke";
import { MangaExcerpt } from "./types";
import { PopulatedFilter } from "../../template/madara/types";

export const parseSearchRequest = (
  request: DirectoryRequest<PopulatedFilter>
) => {
  const limit = 30;
  const sort = request.sort ?? "view";
  const page = request.page ?? 1;
  const type = "comic";
  const advanced = "1";
  const tachiyomi = "true";
  let queryString = "";

  const { content_type, demographic, genres, completed } =
    request.filters ?? {};

  if (completed) queryString += `&completed=true`;
  if (content_type)
    queryString += "&" + content_type.map((v) => `country=${v}`).join("&");
  if (demographic)
    queryString += "&" + demographic.map((v) => `demographic=${v}`).join("&");

  if (genres) {
    const { included, excluded } = genres;
    if (included)
      queryString += "&" + included.map((v) => `genres=${v}`).join("&");
    if (excluded)
      queryString += "&" + excluded.map((v) => `excluded=${v}`).join("&");
  }

  if (request.tag) {
    switch (request.tag.propertyId) {
      case "genres":
        queryString +=
          "&" + [request.tag.tagId].map((v) => `genres=${v}`).join("&");
        break;
      case "tags":
        queryString +=
          "&" + [request.tag.tagId].map((v) => `tags=${v}`).join("&");
        break;
      case "type":
        queryString +=
          "&" + [request.tag.tagId].map((v) => `country=${v}`).join("&");
        break;
      case "demographic":
        queryString +=
          "&" + [request.tag.tagId].map((v) => `demographic=${v}`).join("&");
        break;
    }
  }

  return {
    queryString,
    core: {
      limit,
      sort,
      page,
      type,
      advanced,
      tachiyomi,
      q: request.query ?? "",
    },
  };
};

export const MangaToHighlight = (manga: MangaExcerpt): Highlight => {
  return {
    id: manga.slug,
    title: manga.title,
    cover: manga.cover_url,
    // stats: {
    //   follows: manga.user_follow_count,
    //   rating: manga.rating ? Number(manga.rating) : undefined,
    //   views: manga.view_count,
    // },
  };
};

type Base = { name: string; slug: string };
export const MangaToContent = (data: any, contentId: string): Content => {
  const { comic, artists, authors, matureContent } = data;
  const {
    title,
    links,
    hentai,
    user_follow_count,
    follow_rank,
    comment_count,
    follow_count,
    desc: summary,
    year,
    bayesian_rating,
    md_titles,
    mu_comics,
    status: ckStatus,
    cover_url: cover,
    translation_completed,
    md_comic_md_genres: mdGenres,
  } = comic;
  const creators: string[] = artists
    .map((v: Base) => v.name)
    .concat(authors.map((v: Base) => v.name));

  // Additional Titles
  const additionalTitles: string[] = [];
  if (md_titles) {
    additionalTitles.push(...md_titles.map((v: any) => v.title));
  }

  // Adult Content
  const adultContent: boolean = (matureContent ?? false) || (hentai ?? false);
  const muGenres = mu_comics?.mu_comic_categories?.map(
    (v: any) => v.mu_categories
  );

  const properties: Property[] = [];

  if (mdGenres) {
    properties.push({
      id: "genres",
      title: "Genres",
      tags: mdGenres.map(({ md_genres }: any) => ({
        id: md_genres.slug,
        title: md_genres.name,
        adultContent: false,
      })),
    });
  }
  // MU Tags
  if (muGenres) {
    properties.push({
      id: "tags",
      title: "Tags",
      tags: muGenres.map((v: any) => ({
        id: v.slug,
        title: v.title,
        adultContent: false,
      })),
    });
  }

  // * Reading Mode
  let recommendedReadingMode = ReadingMode.PAGED_MANGA;
  const longStripId = "long-strip";
  const fullColorId = "full-color";
  const mapped =
    properties?.[0].tags.map((v) => v.id) ??
    properties?.[1].tags.map((v) => v.id) ??
    [];

  if (mapped.includes(longStripId)) {
    recommendedReadingMode = ReadingMode.WEBTOON;
  } else if (mapped.includes(fullColorId)) {
    recommendedReadingMode = ReadingMode.PAGED_COMIC;
  }
  const webUrl = `https://comick.app/comic/${contentId}`;
  const status = convertStatus(ckStatus ?? 99);

  const genTags: string[] = [];

  if (year) genTags.push(`Released ${year}`);
  if (bayesian_rating) genTags.push(`Bayesian Rating: ${bayesian_rating}`);
  if (follow_rank) genTags.push(`No. ${follow_rank} Most Followed Title`);
  if (follow_count) {
    let b = follow_count;
    if (user_follow_count) b += user_follow_count;
    genTags.push(`${b} Follows`);
  }

  if (translation_completed) genTags.push("Translation Completed");
  if (comment_count) genTags.push(`${comment_count} Onsite Comments`);

  const trackerInfo = Array.isArray(links) ? undefined : links;

  return {
    title,
    isNSFW: adultContent,
    cover,
    additionalTitles,
    creators,
    recommendedPanelMode: recommendedReadingMode,
    webUrl,
    status,
    summary,
    properties,
    trackerInfo,
    info: genTags,
  };
};

const convertStatus = (val: number) => {
  switch (val) {
    case 1:
      return PublicationStatus.ONGOING;
    case 2:
      return PublicationStatus.COMPLETED;
    case 3:
      return PublicationStatus.CANCELLED;
    case 4:
      return PublicationStatus.HIATUS;
  }
};

export const CKChapterToChapter = (
  data: any
): Omit<Chapter, "index" | "contentId"> => {
  const {
    title,
    chap,
    vol,
    lang,
    created_at,
    hid: chapterId,
    group_name,
  } = data;

  let number = Number(chap);
  if (Number.isNaN(number)) {
    number = 0.0;
  }
  return {
    date: new Date(created_at),
    chapterId,
    number,
    language: lang,
    ...(group_name && {
      providers: group_name.map((v: string) => ({ id: v, name: v, links: [] })),
    }),
    ...(vol && Number(vol) && { volume: Number(vol) }),
    ...(title && { title }),
  };
};

export const MDComicToHighlight = (data: any): Highlight => {
  return {
    id: data.slug,
    title: data.title,
    cover: `https://meo.comick.pictures/${data.md_covers?.[0].b2key ?? ""}`,
  };
};
