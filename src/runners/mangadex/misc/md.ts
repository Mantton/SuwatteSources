import {
  DirectoryFilter,
  DirectoryRequest,
  FilterType,
  Highlight,
  Option,
  PagedResult,
  ReadingFlag,
} from "@suwatte/daisuke";
import {
  CONTENT_RATINGS,
  COVER_URL,
  DEMOGRAPHICS,
  GlobalStore,
  LANGUAGES,
  PUBLICATION_STATUS,
  RESULT_LIMIT,
} from "../constants";
import { GET, isTokenExpired } from "../network";
import { parsePagedResponse } from "../parser/pagedResponse";
import { encode } from "he";
import { groupBy, capitalize } from "lodash";
import { languageLabel } from "../utils";
import moment from "moment";

// Fetches Covers for the provided ids
export async function getMDCovers(
  ids: string[]
): Promise<Record<string, string[]>> {
  const results: any = {};
  const response = await GET("/cover", {
    params: {
      manga: ids,
      limit: 100,
      "order[volume]": "desc",
    },
  });

  const suffix = await GlobalStore.getCoverQuality();
  for (const id of ids) {
    const files = (response.data as any[]).filter((data) =>
      Object.values(data.relationships.flatMap((x: any) => x.id)).includes(id)
    );
    const covers = files.map(
      (val) => `${COVER_URL}/${id}/${val.attributes.fileName}${suffix}`
    );
    results[id] = covers;
  }

  return results;
}

// Gets related titles for provided ids
export async function getMDRelatedCollections(ids: string[]) {
  const response = await GET("/manga", {
    params: {
      includes: ["cover_art"],
      ids,
    },
  });
  const paged = await parsePagedResponse(response);
  return paged.results;
}

// Gets the stats for the provided ids
export async function getMDStatistics(ids: string[]): Promise<any> {
  const response = await GET("/statistics/manga", {
    params: {
      manga: ids,
    },
  });
  const stats = response.statistics;

  const getValue = (key: string) => {
    const obj = stats[key];
    return {
      follows: obj.follows,
      rating: obj.rating.average,
      // views: 0,
    };
  };
  return ids.reduce((a, v) => ({ ...a, [v]: getValue(v) }), {});
}

// Fetches an MD List
export async function getMDList(listId: string, pageNumber = 1) {
  const { data } = await GET(`/list/${listId}`);
  const contentIds = data.relationships
    .filter((x: any) => x.type == "manga")
    .map((x: any) => x.id);

  const listName = data.attributes.name ?? "Seasonal";

  const page = await GET(`/manga`, {
    params: {
      includes: ["cover_art"],
      ids: contentIds,
      limit: RESULT_LIMIT,
      offset: RESULT_LIMIT * (pageNumber - 1),
    },
  });
  return {
    title: listName,
    highlights: (await parsePagedResponse(page)).results,
  };
}

// Fetches Updates from MD
export async function getMDUpdates(page: number): Promise<Highlight[]> {
  const contentRating = await GlobalStore.getContentRatings();
  const langs = await GlobalStore.getLanguages();
  let response = await GET(`/chapter`, {
    params: {
      limit: 50,
      offset: 50 * (page - 1),
      "order[readableAt]": "desc",
      translatedLanguage: langs,
      contentRating: contentRating,
      includeFutureUpdates: "0",
    },
  });

  const chapterListJSON = { ...response };

  const base = chapterListJSON.data.map(
    (x: any) => x.relationships.find((y: any) => y.type == "manga").id
  );
  const ids = Array.from(new Set(base));
  response = await GET(`/manga`, {
    params: {
      ids,
      limit: ids.length,
      contentRating,
      includes: ["cover_art"],
    },
  });

  const highlights = (await parsePagedResponse(response)).results.sort(
    (a, b) => {
      return ids.indexOf(a.id) - ids.indexOf(b.id);
    }
  );

  highlights.forEach((entry) => {
    const chapterObject = chapterListJSON.data.find(
      (json: any) =>
        entry.id == json.relationships.find((y: any) => y.type == "manga").id
    );

    const volume = chapterObject.attributes.volume;
    const chapter = chapterObject.attributes.chapter;
    const chapterName = `${
      volume ? `Volume ${volume} ` : ""
    }Chapter ${chapter}`;
    const chapterDate = moment(chapterObject.attributes.publishAt).fromNow();
    const getOccurrences = (array: string[], value: string) => {
      let count = 0;
      array.forEach((v: string) => v === value && count++);
      return count;
    };
    const chapterCount = getOccurrences(base, entry.id);

    const info = `${chapterCount} Update${
      chapterCount != 1 ? "s" : ""
    } • ${chapterDate}\n${chapterName}`;
    entry.info = [info];
  });
  return highlights;
}

// Fetches Search results from MD
export async function getMDSearchResults(
  query: DirectoryRequest,
  overrides: any = {}
): Promise<PagedResult> {
  const page = query.page ?? 1;
  const limit = overrides.limit ?? RESULT_LIMIT;
  const offset = (page - 1) * limit;

  const params: any = { limit, offset, includes: ["cover_art"] };

  // Keyword
  if (query.query) {
    params.title = encode(query.query);
  }

  // Order
  if (query.sort) {
    params[`order[${query.sort.id}]`] = "desc";
  } else {
    params["order[followedCount]"] = "desc";
  }

  console.log(query);

  for (const key in query.filters ?? {}) {
    const filter = query.filters[key];
    if (!filter) {
      break;
    }
    const included = filter.included ?? [];
    const excluded = filter.excluded ?? [];
    switch (key) {
      case "demographic":
        params.publicationDemographic = included;
        break;
      case "content_rating":
        params.contentRating =
          included.length == 0
            ? ["safe", "suggestive", "erotica", "pornographic"]
            : included;
        break;
      case "lang":
      case "language":
        params.originalLanguage = included;
        break;
      case "pb_status":
      case "status":
        params.status = included;
        break;
      case "author":
      case "credits":
        params.authors = included;
        break;
      default:
        params.includedTags = included;
        params.excludedTags = excluded;

        break;
    }
  }
  const response = await GET("/manga", { params });

  return parsePagedResponse(response);
}

export async function buildFilters() {
  const filters: DirectoryFilter[] = [];

  const { data } = await GET(`/manga/tag`);
  const grouped = groupBy(data, (v) => v.attributes.group);
  for (const group in grouped) {
    const title = capitalize(group);

    const options = grouped[group].map((tag): Option => {
      return {
        title: tag.attributes.name.en,
        id: tag.id,
      };
    });

    const filter: DirectoryFilter = {
      id: group,
      title,
      options,
      type: FilterType.EXCLUDABLE_MULTISELECT,
    };

    filters.push(filter);
  }

  filters.push({
    id: "pb_status",
    title: "Publication Status",
    options: PUBLICATION_STATUS.map((id) => {
      return {
        id,
        title: capitalize(id),
      };
    }),
    type: FilterType.MULTISELECT,
  });

  filters.push({
    id: "demographic",
    title: "Publication Demographic",
    options: DEMOGRAPHICS.map((id) => {
      return {
        id,
        title: capitalize(id),
      };
    }),
    type: FilterType.MULTISELECT,
  });

  filters.push({
    id: "content_rating",
    title: "Content Rating",
    options: CONTENT_RATINGS.map((id) => {
      return {
        id,
        title: capitalize(id),
      };
    }),
    type: FilterType.MULTISELECT,
  });

  filters.push({
    id: "lang",
    title: "Original Language",
    type: FilterType.MULTISELECT,
    options: LANGUAGES.map((id) => {
      return {
        id,
        title: languageLabel(id),
      };
    }),
  });

  return filters;
}

export async function getCollectionForList(id: string) {
  const list = await getMDList(id);
  return { highlights: list.highlights, title: list.title };
}

export async function getPopularNewTitles(): Promise<PagedResult> {
  const date = moment().subtract({ month: 1 }).toDate();
  const contentRating = await GlobalStore.getContentRatings();
  const params = {
    includes: ["cover_art"],
    "order[followedCount]": "desc",
    contentRating,
    hasAvailableChapters: true,
    limit: 15,
    createdAtSince: date.toISOString().split(".")[0],
  };
  const response = await GET("/manga", {
    params,
  });

  return parsePagedResponse(response);
}

export async function clearTokens() {
  await SecureStore.remove("session");
  await SecureStore.remove("refresh");
}

export async function isSignedIn() {
  const session = await SecureStore.string("session");
  const refresh = await SecureStore.string("refresh");

  if (!session || !refresh) return false; // Either Refresh or Access is missing, not signed in

  if (isTokenExpired(refresh)) {
    // Refresh is expired, not signed in
    await clearTokens(); // clear tokens
    return false;
  }
  return true;
}

export async function getStatusFlagForReadingFlag(flag: ReadingFlag) {
  const READING_STATUS: Record<string, ReadingFlag> = {
    reading: ReadingFlag.READING,
    plan_to_read: ReadingFlag.PLANNED,
    dropped: ReadingFlag.DROPPED,
    completed: ReadingFlag.COMPLETED,
    re_reading: ReadingFlag.REREADING,
    on_hold: ReadingFlag.PAUSED,
  };
  return (
    Object.keys(READING_STATUS).find((key) => READING_STATUS[key] === flag) ??
    "reading"
  );
}
// Authenticated User
export function getMDReadingStatus(str: string): ReadingFlag {
  switch (str) {
    case "reading":
      return ReadingFlag.READING;
    case "plan_to_read":
      return ReadingFlag.PLANNED;
    case "dropped":
      return ReadingFlag.DROPPED;
    case "completed":
      return ReadingFlag.COMPLETED;
    case "re_reading":
      return ReadingFlag.REREADING;
    case "on_hold":
      return ReadingFlag.PAUSED;
    default:
      break;
  }
  return ReadingFlag.UNKNOWN;
}
export async function getMDUserStatuses() {
  try {
    const response = await GET(`$/manga/status`);
    return response.statuses as Record<string, string>;
  } catch (err: any) {
    console.log(err.response.data);
  }
  return {};
}
