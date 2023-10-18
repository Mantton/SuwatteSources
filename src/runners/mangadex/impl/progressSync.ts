import { ContentProgressState, ProgressSyncHandler } from "@suwatte/daisuke";
import { GET } from "../network";

export const MDProgressStateHandler: ProgressSyncHandler = {
  getProgressState: async function (
    contentId: string
  ): Promise<ContentProgressState> {
    return { readChapterIds: await getReadChapterMarkers(contentId) };
  },
};

async function getReadChapterMarkers(contentId: string): Promise<string[]> {
  const response = await GET(`/manga/read`, {
    params: { ids: [contentId], grouped: true },
  });

  const data = JSON.parse(response.data);

  const ids = data.data[contentId];
  return ids ?? [];
}
