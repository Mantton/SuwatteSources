import { ChapterEventHandler, ContentEventHandler } from "@suwatte/daisuke";
import { isSignedIn } from "../misc/md";
import { POST } from "../network";
import { MDStore } from "../store";

export const MDLibraryEventHandler: ChapterEventHandler & ContentEventHandler =
  {
    async onChapterRead(contentId: string, chapterId: string): Promise<void> {
      await new MDStore().saveToMimasTargets(contentId);
      const signedIn = await isSignedIn();
      if (!signedIn) return;
      await syncToMD(contentId, [chapterId]);
    },

    async onChaptersMarked(
      contentId: string,
      chapterIds: string[],
      completed: boolean
    ): Promise<void> {
      const signedIn = await isSignedIn();
      if (!signedIn) return;

      if (completed) {
        await syncToMD(contentId, chapterIds);
      } else {
        await syncToMD(contentId, [], chapterIds);
      }
    },

    async onContentsAddedToLibrary(ids: string[]): Promise<void> {
      const signedIn = await isSignedIn();
      if (!signedIn) return;

      for (const id of ids) {
        await POST(`/manga/${id}/status`, {
          body: {
            status: "reading",
          },
        });
      }
    },

    async onContentsReadingFlagChanged(ids, flag) {
      //
    },

    async onContentsRemovedFromLibrary(ids) {
      //
    },
  };

async function syncToMD(
  id: string,
  chapterIdsRead: string[],
  chapterIdsUnread: string[] = []
) {
  try {
    await POST(`/manga/${id}/read`, {
      body: {
        chapterIdsUnread,
        chapterIdsRead,
      },
    });
  } catch {
    console.error("failed to sync to mangadex");
  }
}
