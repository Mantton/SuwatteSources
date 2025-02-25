import {
  DirectoryConfig,
  DirectoryHandler,
  DirectoryRequest,
  NetworkRequest,
  Highlight,
  PagedResult,
  DirectoryFilter,
  FilterType,
  ExcludableMultiSelectProp,
} from "@suwatte/daisuke";
import { HOST_URL } from ".";
import { CheerioAPI, load } from "cheerio";
import type { Element } from "domhandler";

const FETCH_LIMIT = 24;

export const WCDirectoryHandler: DirectoryHandler = {
  getDirectory: async function (
    request: DirectoryRequest
  ): Promise<PagedResult> {
    const CLIENT = new NetworkClient();
    const urlRequest = prepareDirectoryRequest(request);
    const { data } = await CLIENT.get(urlRequest.url, {
      params: urlRequest.params,
    });

    const $ = load(data);
    return parseDirectoryResponse($);
  },

  getDirectoryConfig: async function (
    _configID?: string
  ): Promise<DirectoryConfig> {
    return {
      filters: FILTERS,
      sort: {
        options: [
          "Best Match",
          "Alphabet",
          "Popularity",
          "Subscribers",
          "Recently Added",
          "Latest Updates",
        ].map((i) => ({ id: i, title: i })),
        canChangeOrder: true,
        default: {
          id: "Popularity",
        },
      },
    };
  },
};

const prepareDirectoryRequest = (
  request: DirectoryRequest<PopulatedFilter>
): NetworkRequest => {
  const url = HOST_URL + "/search/data";
  const params: Record<string, any> = {
    limit: FETCH_LIMIT,
    offset: ((request.page - 1) * FETCH_LIMIT).toString(),
    display_mode: "Full Display",
  };

  if (request.query) {
    params["text"] = request.query.replace(/[!#:()]/g, " ").trim();
  }

  if (request.sort) {
    params["sort"] = request.sort.id;
    params["order"] = request.sort.ascending ? "Ascending" : "Descending";
  }

  const queryStrings: string[] = [];
  if (request.filters) {
    params["official"] = request.filters.official ?? "Any";
    params["adult"] = request.filters.adult ?? "Any";
    params["anime"] = request.filters.anime ?? "Any";

    queryStrings.push(
      toQueryParam("included_status", request.filters.included_status ?? [])
    );
    queryStrings.push(
      toQueryParam("included_type", request.filters.included_type ?? [])
    );
    queryStrings.push(
      toQueryParam("included_tag", request.filters.tags?.included ?? [])
    );
    queryStrings.push(
      toQueryParam("excluded_tag", request.filters.tags?.excluded ?? [])
    );
  }

  if (request.tag) {
    if (request.tag.propertyId === "genre") {
      params["included_tag"] = request.tag.tagId;
    }
  }

  const finalURL = appendQueryStringsToUrl(url, queryStrings);
  return { url: finalURL, params };
};

const parseDirectoryResponse = ($: CheerioAPI): PagedResult => {
  const items = $("article:has(section)").toArray();
  const results = items.map((element) => parseDirectoryItem($, element));
  const isLastPage = $("button").length === 0;
  return {
    isLastPage,
    results,
  };
};

const parseDirectoryItem = ($: CheerioAPI, element: Element): Highlight => {
  const title = $("section:nth-of-type(2)  a", element).first().text().trim();
  const id =
    $("section:nth-of-type(2) a", element)
      .first()
      .attr("href")
      ?.split("/")
      .at(-2) ?? "";
  const cover = $("img", element).first().attr("src") ?? "";

  return { id, title, cover };
};

export type PopulatedFilter = {
  official?: boolean;
  adult?: boolean;
  anime?: boolean;
  included_status?: string[];
  included_type?: string[];
  tags?: ExcludableMultiSelectProp;
};

const FILTERS: DirectoryFilter[] = [
  {
    id: "official",
    title: "Official Translation",
    type: FilterType.SELECT,
    options: ["Any", "True", "False"].map((i) => ({ id: i, title: i })),
  },
  {
    id: "adult",
    title: "NSFW",
    type: FilterType.SELECT,
    options: ["Any", "True", "False"].map((i) => ({ id: i, title: i })),
  },
  {
    id: "anime",
    title: "Anime Adaptation",
    type: FilterType.SELECT,
    options: ["Any", "True", "False"].map((i) => ({ id: i, title: i })),
  },
  {
    id: "included_status",
    title: "Series Status",
    type: FilterType.MULTISELECT,
    options: ["Ongoing", "Complete", "Hiatus", "Canceled"].map((i) => ({
      id: i,
      title: i,
    })),
  },
  {
    id: "included_type",
    title: "Series Type",
    type: FilterType.MULTISELECT,
    options: ["Manga", "Manhwa", "Manhua", "OEL"].map((i) => ({
      id: i,
      title: i,
    })),
  },

  {
    id: "tags",
    title: "Tags",
    type: FilterType.EXCLUDABLE_MULTISELECT,
    options: [
      "Action",
      "Adult",
      "Adventure",
      "Comedy",
      "Doujinshi",
      "Drama",
      "Ecchi",
      "Fantasy",
      "Gender Bender",
      "Harem",
      "Hentai",
      "Historical",
      "Horror",
      "Isekai",
      "Josei",
      "Lolicon",
      "Martial Arts",
      "Mature",
      "Mecha",
      "Mystery",
      "Psychological",
      "Romance",
      "School Life",
      "Sci-fi",
      "Seinen",
      "Shotacon",
      "Shoujo",
      "Shoujo Ai",
      "Shounen",
      "Shounen Ai",
      "Slice of Life",
      "Smut",
      "Sports",
      "Supernatural",
      "Tragedy",
      "Yaoi",
      "Yuri",
      "Other",
    ].map((i) => ({
      id: i,
      title: i,
    })),
  },
];

function toQueryParam(key: string, values: string[]): string {
  return values
    .map((value) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join("&");
}

function appendQueryStringsToUrl(url: string, queryStrings: string[]): string {
  // Filter out empty strings
  const filteredQueryStrings = queryStrings.filter(
    (query) => query.trim() !== ""
  );

  if (filteredQueryStrings.length === 0) {
    return url; // If no valid query strings, return the URL as is
  }

  const separator = url.includes("?") ? "&" : "?";
  return url + separator + filteredQueryStrings.join("&");
}
