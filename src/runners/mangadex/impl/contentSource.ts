import { Chapter, ChapterData, Content, ContentSource } from "@suwatte/daisuke";
import { GET } from "../network";
import { parseContent } from "../parser/content";
import { getChapters, parseChapterData } from "../parser/chapter";

type MethodOnlyContentSource = Omit<
  ContentSource,
  "info" | "getDirectory" | "getDirectoryConfig"
>;
export const MDContentSource: MethodOnlyContentSource = {
  getContent: async function (contentId: string): Promise<Content> {
    const path = `/manga/${contentId}`;
    const params = {
      includes: ["artist", "author", "cover_art"],
    };

    const response = await GET(path, { params });
    return parseContent(response, contentId);
  },
  getChapters: function (contentId: string): Promise<Chapter[]> {
    return getChapters(contentId);
  },

  getChapterData: async function (_, chapterId: string): Promise<ChapterData> {
    const json = await GET(`/at-home/server/${chapterId}`);
    return {
      pages: await parseChapterData(json),
    };
  },

  // async getIdentifierForURL(url: string): Promise<ContentIdentifier | null> {
  //   const titleRegex =
  //     /^https:\/\/mangadex.org\/title\/([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/?/;
  //   const contentId = url.match(titleRegex)?.[1];

  //   if (contentId)
  //     return {
  //       contentId,
  //     };

  //   const chapterRegex =
  //     /^https:\/\/mangadex.org\/chapter\/([0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})\/?/;
  //   const chapterId = url.match(chapterRegex)?.[1];

  //   async function getMangaFromChapterId(id: string) {
  //     const url = `/chapter/${id}?includes[]=manga`;
  //     const {
  //       data: { data },
  //     } = await GET(url);
  //     const contentId = data.relationships.find(
  //       (v: any) => v.type === "manga"
  //     )?.id;

  //     return contentId;
  //   }
  //   if (chapterId) {
  //     const id = await getMangaFromChapterId(chapterId);
  //     return {
  //       contentId: id,
  //       chapterId,
  //     };
  //   }

  //   return null;
  // },
};
