import {
  DirectoryHandler,
  DirectoryRequest,
  PagedResult,
  DirectoryConfig,
} from "@suwatte/daisuke";
import { getSearchSorters } from "../misc/directory";
import { buildFilters, getMDList, getMDSearchResults } from "../misc/md";
import { RESULT_LIMIT } from "../constants";

export const MDDirectoryHandler: DirectoryHandler = {
  getDirectory: async function (
    request: DirectoryRequest
  ): Promise<PagedResult> {
    if (request.context?.listId) {
      const list = await getMDList(request.context.listId, request.page);
      const isLastPage = list.highlights.length < RESULT_LIMIT;
      return {
        results: list.highlights,
        isLastPage,
      };
    }
    return getMDSearchResults(request);
  },
  getDirectoryConfig: async function (
    _key?: string | undefined
  ): Promise<DirectoryConfig> {
    return {
      filters: await buildFilters(),
      sort: {
        options: await getSearchSorters(),
        canChangeOrder: false,
        default: {
          id: "followedCount",
          ascending: false,
        },
      },
    };
  },
};
