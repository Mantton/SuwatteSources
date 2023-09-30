import { CatalogRating, ContentSource, RunnerInfo } from "@suwatte/daisuke";
import {
  MDBasicAuthProvider,
  MDContentSource,
  MDPageLinkResolver,
  MDPreferenceProvider,
} from "./impl";
import { MDDirectoryHandler } from "./impl/directoryHandler";
import { languages } from "./utils";

export const info: RunnerInfo = {
  name: "MangaDex",
  id: "org.mangadex",
  version: 1.7,
  website: "https://mangadex.org",
  supportedLanguages: languages.map((v) =>
    v.languageCode.includes("-")
      ? v.languageCode
      : v.languageCode + "-" + v.regionCode
  ),
  thumbnail: "mangadex.png",
  minSupportedAppVersion: "6.0.0",
  rating: CatalogRating.MIXED,
};

export const Target: ContentSource = {
  info,
  ...MDContentSource,
  ...MDDirectoryHandler,
  ...MDPageLinkResolver,
  ...MDPreferenceProvider,
  ...MDBasicAuthProvider,
};

// export class T implements ContentSource {
//   private KEYCHAIN = SecureStore;
//   private STORE = new MDStore();
//   private PROPERTIES: Property[] = [];

//   // * Explore
//   // * Search

//   // Events
//   async onChapterRead(contentId: string, chapterId: string): Promise<void> {
//     await this.STORE.saveToMimasTargets(contentId);
//     const signedIn = await this.isSignedIn();
//     if (!signedIn) return;
//     await this.syncToMD(contentId, [chapterId]);
//   }

//   async onChaptersMarked(
//     contentId: string,
//     chapterIds: string[],
//     completed: boolean
//   ): Promise<void> {
//     const signedIn = await this.isSignedIn();
//     if (!signedIn) return;

//     if (completed) {
//       await this.syncToMD(contentId, chapterIds);
//     } else {
//       await this.syncToMD(contentId, [], chapterIds);
//     }
//   }

//   async onContentsAddedToLibrary(ids: string[]): Promise<void> {
//     const signedIn = await this.isSignedIn();
//     if (!signedIn) return;

//     for (const id of ids) {
//       await this.NETWORK_CLIENT.post(`${this.API_URL}/manga/${id}/status`, {
//         body: {
//           status: "reading",
//         },
//         transformRequest: requestHandler,
//       });
//     }
//   }

//   // * Syncing
//   async syncUserLibrary(
//     library: UpSyncedContent[]
//   ): Promise<DownSyncedContent[]> {
//     const fetchedLib = await this.fetchUserLibrary();
//     // Titles in local but not cloud
//     const toUpSync = library.filter(
//       (v) => !fetchedLib.find((a) => a.id === v.id)
//     );
//     // Titles in cloud but not local
//     const toDownSync = fetchedLib.filter((v) => {
//       const target = library.find((a) => a.id === v.id);

//       // Not in library, down sync
//       if (!target) return true;

//       // NonMatching Reading Flag
//       if (v.readingFlag && target.flag != v.readingFlag) return true;

//       return false;
//     });
//     // Handle UpSync
//     await this.handleUpSync(toUpSync);

//     return toDownSync;
//   }

//   async handleUpSync(entries: UpSyncedContent[]) {
//     for (const entry of entries) {
//       const url = `${this.API_URL}/manga/${entry.id}/status`;
//       const status = this.getStatusFlagForReadingFlag(entry.flag);
//       await this.NETWORK_CLIENT.post(url, {
//         body: {
//           status,
//         },
//         transformRequest: requestHandler,
//       });
//     }
//   }
//   async fetchUserLibrary() {
//     const library: DownSyncedContent[] = [];

//     // Fetch Reading Status
//     const statuses = await this.getMDUserStatuses();
//     const limit = 100;
//     let offset = 0;

//     // eslint-disable-next-line no-constant-condition
//     while (true) {
//       const response = await this.NETWORK_CLIENT.get(
//         `${this.API_URL}/user/follows/manga`,
//         {
//           params: {
//             limit,
//             offset,
//             includes: ["cover_art"],
//           },
//           transformRequest: requestHandler,
//         }
//       );
//       const highlights = (
//         await this.parsePagedResponse(response, 1, false, false)
//       ).results;
//       // prepare
//       const mapped: DownSyncedContent[] = highlights.map(
//         (v): DownSyncedContent => {
//           const status = this.getMDReadingStatus(statuses[v.contentId]);
//           return {
//             id: v.contentId,
//             title: v.title,
//             cover: v.cover,
//             readingFlag: status,
//           };
//         }
//       );
//       library.push(...mapped);
//       // Loop Logic
//       offset += limit;
//       if (highlights.length < limit) {
//         break;
//       }
//     }

//     return library;
//   }

//   async getReadChapterMarkers(contentId: string): Promise<string[]> {
//     const response = await this.NETWORK_CLIENT.get(
//       `${this.API_URL}/manga/read`,
//       {
//         params: { ids: [contentId], grouped: true },
//         transformRequest: requestHandler,
//       }
//     );

//     const data = JSON.parse(response.data);

//     const ids = data.data[contentId];
//     return ids ?? [];
//   }

//   async syncToMD(
//     id: string,
//     chapterIdsRead: string[],
//     chapterIdsUnread: string[] = []
//   ) {
//     try {
//       await this.NETWORK_CLIENT.post(`${this.API_URL}/manga/${id}/read`, {
//         body: {
//           chapterIdsUnread,
//           chapterIdsRead,
//         },
//         transformRequest: requestHandler,
//       });
//     } catch {
//       console.error("failed to sync to mangadex");
//     }
//   }
// }
