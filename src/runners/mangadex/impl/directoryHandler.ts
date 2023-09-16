import {
  DirectoryHandler,
  DirectoryRequest,
  PagedResult,
  DirectoryConfig,
} from "@suwatte/daisuke";
import { getSearchSorters } from "../misc/directory";
import { buildFilters, getMDSearchResults } from "../misc/md";

export const MDDirectoryHandler: DirectoryHandler = {
  getDirectory: function (request: DirectoryRequest): Promise<PagedResult> {
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
