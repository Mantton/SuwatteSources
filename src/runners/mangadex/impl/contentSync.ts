import {
  DownSyncedContent,
  LibrarySyncHandler,
  UpSyncedContent,
} from "@suwatte/daisuke";
import { GET, POST } from "../network";
import {
  getStatusFlagForReadingFlag,
  getMDUserStatuses,
  getMDReadingStatus,
} from "../misc/md";
import { parsePagedResponse } from "../parser/pagedResponse";

export const MDContentSyncHandler: LibrarySyncHandler = {
  syncUserLibrary: function (
    library: UpSyncedContent[]
  ): Promise<DownSyncedContent[]> {
    return syncUserLibrary(library);
  },
};

async function syncUserLibrary(
  library: UpSyncedContent[]
): Promise<DownSyncedContent[]> {
  const fetchedLib = await fetchUserLibrary();
  // Titles in local but not cloud
  const toUpSync = library.filter(
    (v) => !fetchedLib.find((a) => a.id === v.id)
  );
  // Titles in cloud but not local
  const toDownSync = fetchedLib.filter((v) => {
    const target = library.find((a) => a.id === v.id);

    // Not in library, down sync
    if (!target) return true;

    // NonMatching Reading Flag
    if (v.readingFlag && target.flag != v.readingFlag) return true;

    return false;
  });
  // Handle UpSync
  await handleUpSync(toUpSync);

  return toDownSync;
}

async function handleUpSync(entries: UpSyncedContent[]) {
  for (const entry of entries) {
    const url = `/manga/${entry.id}/status`;
    const status = getStatusFlagForReadingFlag(entry.flag);
    await POST(url, {
      body: {
        status,
      },
    });
  }
}
async function fetchUserLibrary() {
  const library: DownSyncedContent[] = [];

  // Fetch Reading Status
  const statuses = await getMDUserStatuses();
  const limit = 100;
  let offset = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const response = await GET(`/user/follows/manga`, {
      params: {
        limit,
        offset,
        includes: ["cover_art"],
      },
    });
    const highlights = (await parsePagedResponse(response, false)).results;
    // prepare
    const mapped: DownSyncedContent[] = highlights.map(
      (v): DownSyncedContent => {
        const status = getMDReadingStatus(statuses[v.id]);
        return {
          id: v.id,
          title: v.title,
          cover: v.cover,
          readingFlag: status,
        };
      }
    );
    library.push(...mapped);
    // Loop Logic
    offset += limit;
    if (highlights.length < limit) {
      break;
    }
  }

  return library;
}
