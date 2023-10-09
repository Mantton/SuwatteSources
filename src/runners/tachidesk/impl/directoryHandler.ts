import {
  DirectoryConfig,
  DirectoryHandler,
  DirectoryRequest,
  PagedResult,
} from "@suwatte/daisuke";
import { getHost } from "../utils/store";
import { PagedMangaListDto } from "../types";
import { Generate, toHighlight } from "../utils/parser";
import { getSourceConfig, getSourcePopularPage } from "../api";

export const SuwayomiDirectoryHandler: DirectoryHandler = {
  getDirectory: async function (
    request: DirectoryRequest
  ): Promise<PagedResult> {
    return search(request);
  },
  getDirectoryConfig: async function (
    key?: string | undefined
  ): Promise<DirectoryConfig> {
    if (key) {
      return getSourceConfig(key);
    } else {
      return {};
    }
  },
};

const search = (request: DirectoryRequest): Promise<PagedResult> => {
  const sourceId = request.context?.sourceId;
  if (sourceId) {
    if (
      request.sort?.id === "tachi_popular" &&
      !request.query &&
      !request.filters
    ) {
      return getSourcePopularPage(sourceId, request.page);
    } else {
      return searchSource(sourceId, request);
    }
  }

  // Search All
  throw new Error("Invalid Source Identifier");
};

const searchSource = async (
  sourceId: string,
  request: DirectoryRequest
): Promise<PagedResult> => {
  const client = new NetworkClient();
  const host = await getHost();
  const url = `${host}/api/v1/lite/${sourceId}/search`;

  const { data: raw } = await client.post(url, {
    body: {
      query: request.query,
      page: request.page,
      changes: request.filters ? convertFilterState(request.filters) : [],
    },
  });

  const { mangaList, hasNextPage }: PagedMangaListDto = JSON.parse(raw);
  const highlights = mangaList.map((v) => toHighlight(v, host));
  return Generate<PagedResult>({
    isLastPage: !hasNextPage,
    results: highlights,
  });
};

const convertFilterState = (state: { [key: string]: any }) => {
  const output: any[] = [];
  for (const key in state) {
    const value = state[key];

    const position = parseInt(key);

    if (Number.isNaN(position)) continue;

    if (typeof value === "boolean" && value) {
      // toggle
      output.push({ position, state: "true" });
    } else if (typeof value === "string") {
      // select
      output.push({ position, state: value });
    } else if (typeof value === "object" && Array.isArray(value)) {
      // multiselect
    } else if (typeof value === "object") {
      const included = value.included;
      if (included && Array.isArray(included)) {
        const positions = included
          .map((v) => parseInt(v))
          .filter((v) => !Number.isNaN(v));
        const mapped = positions.map((v) => ({
          position,
          state: JSON.stringify({ position: v, state: "1" }),
        }));
        output.push(...mapped);
      }
      const excluded = value.excluded;
      if (excluded && Array.isArray(excluded)) {
        const positions = excluded
          .map((v) => parseInt(v))
          .filter((v) => !Number.isNaN(v));
        const mapped = positions.map((v) => ({
          position,
          state: JSON.stringify({ position: v, state: "2" }),
        }));
        output.push(...mapped);
      }
    }
  }
};
