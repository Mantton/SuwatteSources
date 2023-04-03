import {
  Chapter,
  Content,
  Highlight,
  NonInteractiveProperty,
  Property,
  ReadingMode,
  SearchRequest,
  Status,
} from "@suwatte/daisuke";
import { MangaExcerpt } from "./types";

export const parseSearchRequest = (request: SearchRequest) => {
  const limit = 30;
  const sort = request.sort ?? "view";
  const page = request.page ?? 1;
  const type = "comic";
  const advanced = "1";
  const tachiyomi = "true";
  let queryString = "";

  for (const filter of request.filters ?? []) {
    switch (filter.id) {
      case "content_type":
        if (filter.included)
          queryString +=
            "&" + filter.included.map((v) => `country=${v}`).join("&");
        break;
      case "demographic":
        if (filter.included)
          queryString +=
            "&" + filter.included.map((v) => `demographic=${v}`).join("&");
        break;
      case "genres":
        if (filter.included)
          queryString +=
            "&" + filter.included.map((v) => `genres=${v}`).join("&");

        if (filter.excluded)
          "&" + filter.excluded.map((v) => `excluded=${v}`).join("&");
        break;
      case "completed":
        if (filter.bool) queryString += `&completed=true`;
        break;

      case "tags":
        if (filter.included)
          queryString +=
            "&" + filter.included.map((v) => `tags=${v}`).join("&");
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
    contentId: manga.slug,
    title: manga.title,
    cover: manga.cover_url,
    stats: {
      follows: manga.user_follow_count,
      rating: manga.rating ? Number(manga.rating) : undefined,
      views: manga.view_count,
    },
  };
};

type Base = { name: string; slug: string };
export const MangaToContent = (data: any, contentId: string): Content => {
  const { comic, artists, authors, genres: ckGenres, matureContent } = data;
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

  // Base Genres
  properties.push({
    id: "genres",
    label: "Genres",
    tags: ckGenres.map((v: Base) => ({
      id: v.slug,
      label: v.name,
      adultContent: false,
    })),
  });

  // MU Tags
  if (muGenres) {
    properties.push({
      id: "tags",
      label: "Tags",
      tags: muGenres.map((v: any) => ({
        id: v.slug,
        label: v.title,
        adultContent: false,
      })),
    });
  }

  // * Reading Mode
  let recommendedReadingMode = ReadingMode.PAGED_MANGA;
  const longStripId = "long-strip";
  const fullColorId = "full-color";
  const mapped = ckGenres.map((v: Base) => v.slug);

  if (mapped.includes(longStripId)) {
    recommendedReadingMode = ReadingMode.VERTICAL;
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
  const nonInteractive: NonInteractiveProperty = {
    id: "general",
    label: "Additional Info",
    tags: genTags,
  };

  const trackerInfo = Array.isArray(links) ? undefined : links;

  return {
    contentId,
    title,
    adultContent,
    cover,
    additionalTitles,
    creators,
    recommendedReadingMode,
    webUrl,
    status,
    summary,
    properties,
    trackerInfo,
    nonInteractiveProperties: [nonInteractive],
  };
};

const convertStatus = (val: number) => {
  switch (val) {
    case 1:
      return Status.ONGOING;
    case 2:
      return Status.COMPLETED;
    case 3:
      return Status.CANCELLED;
    case 4:
      return Status.HIATUS;
    default:
      return Status.UNKNOWN;
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
    contentId: data.slug,
    title: data.title,
    cover: `https://meo.comick.pictures/${data.md_covers?.[0].b2key ?? ""}`,
  };
};
