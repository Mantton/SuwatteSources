import emulate from "@suwatte/emulator";
import { Target } from "../runners/flamescans";
import {
  ChapterDataSchema,
  ChapterSchema,
  ContentSchema,
  PagedResultSchema,
} from "@suwatte/validate";
describe("FlameScans Tests", () => {
  const source = emulate(Target);

  describe("Paged results", () => {
    test("Popular", async () => {
      const data = await source.getDirectory({
        page: 1,
        listId: "template_popular_list",
      });
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
      expect(data.results.length).toBeGreaterThan(1);
    });
    test("Query", async () => {
      const data = await source.getDirectory({
        page: 1,
        query: "level",
      });
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
      expect(data.results.length).toBeGreaterThan(1);
    });
    test("Latest", async () => {
      const data = await source.getDirectory({
        page: 1,
        listId: "template_latest_list",
      });
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
      expect(data.results.length).toBeGreaterThan(1);
    });
  });

  describe("Single Profile", () => {
    const id = "/series/real-life-quest/";

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
    const contentId = "/series/real-life-quest/";
    const chapterId = "/irl-quest-chapter-106/";
    const data = await source.getChapterData(contentId, chapterId);
    expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
  });

  describe("Profile", () => {
    const ids = ["/series/real-life-quest/"];

    test.concurrent.each(ids)("run %s", async (id) => {
      const content = await source.getContent(id);
      expect(ContentSchema.parse(content)).toEqual(expect.any(Object));
      const chapters = await source.getChapters(id);
      expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
    });
  });
});
