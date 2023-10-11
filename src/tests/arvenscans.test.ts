import emulate from "@suwatte/emulator";
import { Target } from "../runners/arvenscans";
import {
  ChapterDataSchema,
  ChapterSchema,
  ContentSchema,
  PagedResultSchema,
} from "@suwatte/validate";
describe("Arven Scans Tests", () => {
  const source = emulate(Target);

  describe("Paged results", () => {
    test("Popular", async () => {
      const data = await source.getDirectory({
        page: 1,
        sort: { id: "popular" },
      });
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
      expect(data.results.length).toBeGreaterThan(1);
    });
    test("Query", async () => {
      const data = await source.getDirectory({
        page: 1,
        query: "demon",
      });
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
      expect(data.results.length).toBeGreaterThan(1);
    });
    test("Latest", async () => {
      const data = await source.getDirectory({
        page: 1,
        sort: { id: "latest" },
      });
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
      expect(data.results.length).toBeGreaterThan(1);
    });
  });

  describe("Single Profile", () => {
    const id = "/series/would-you-like-to-sign-the-contract/";

    test("Details", async () => {
      const content = await source.getContent(id);
      expect(ContentSchema.parse(content)).toEqual(expect.any(Object));
    });

    test("Chapters", async () => {
      const chapters = await source.getChapters(id);
      expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
    });
  });
  test("Reader", async () => {
    const contentId = "/series/would-you-like-to-sign-the-contract/";
    const chapterId = "/would-you-like-to-sign-the-contract-chapter-24/";
    const data = await source.getChapterData(contentId, chapterId);
    expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
  });
});
