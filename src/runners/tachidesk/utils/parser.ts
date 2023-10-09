import {
  Chapter,
  Content,
  Highlight,
  PublicationStatus,
} from "@suwatte/daisuke";
import { ChapterDto, MangaDto } from "../types";
import { decode } from "he";
export const Generate = <T>(v: T) => v;
export const getIdentifier = (manga: MangaDto) =>
  `${manga.sourceId}::${manga.url}`;
export const toIdentifiers = (grouped: string) => {
  const [sourceId, contentId] = grouped.split("::");
  return { sourceId, contentId };
};

export const toHighlight = (manga: MangaDto, host: string): Highlight => {
  return Generate<Highlight>({
    id: getIdentifier(manga),
    title: manga.title,
    cover: manga.thumbnail.startsWith("/")
      ? `${host}${manga.thumbnail}`
      : manga.thumbnail,
  });
};

export const toContent = (manga: MangaDto, host: string): Content =>
  Generate<Content>({
    title: manga.title,
    cover: manga.thumbnail.startsWith("/")
      ? `${host}${manga.thumbnail}`
      : manga.thumbnail,
    summary: manga.description ? decode(manga.description) : manga.description,
    creators: [manga.artist ?? "", manga.author ?? ""]
      .filter((v) => !!v)
      .map((v) => decode(v)),
    properties: [
      {
        id: "tags",
        title: "Tags",
        tags:
          manga.genres?.map((v) => ({
            title: v,
            id: v,
            noninteractive: true,
          })) ?? [],
      },
    ],
    status: toStatus(manga.status),
    webUrl: manga.webUrl,
  });

export const toChapter = (chapter: ChapterDto): Chapter =>
  Generate<Chapter>({
    index: chapter.index,
    number: chapter.chapterNumber,
    chapterId: chapter.url,
    date: new Date(chapter.dateUploaded),
    language: chapter.lang,
    ...(chapter.scanlator && {
      providers: [{ name: chapter.scanlator, id: chapter.scanlator }],
    }),
  });

export const toStatus = (v?: number) => {
  if (!v) return;
  switch (v) {
    case 1:
    case 3:
      return PublicationStatus.ONGOING;
    case 2:
    case 4:
      return PublicationStatus.COMPLETED;
    case 3:
      return PublicationStatus.COMPLETED;
    case 5:
      PublicationStatus.CANCELLED;
    case 6:
      PublicationStatus.HIATUS;
  }
};
