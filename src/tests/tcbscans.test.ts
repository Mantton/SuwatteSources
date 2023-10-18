import emulate from "@suwatte/emulator";
import { Target } from "../runners/tcbscans";
import {
  ChapterDataSchema,
  ChapterSchema,
  ContentSchema,
  PagedResultSchema,
} from "@suwatte/validate";
describe("TCB Tests", () => {
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
        query: "bleach",
      });
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
      expect(data.results.length).toBe(1);
    });
  });

  test("Profile", async () => {
    const id = "/mangas/4/jujutsu-kaisen";

    const content = await source.getContent(id);
    expect(ContentSchema.parse(content)).toEqual(expect.any(Object));

    const chapters = await source.getChapters(id);
    expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
  });

  test("Reader", async () => {
    const contentId = "/mangas/4/jujutsu-kaisen";
    const chapterId =
      "/chapters/48/jujutsu-kaisen-chapter-148-review-1688065290";
    const data = await source.getChapterData(contentId, chapterId);
    expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
  });
});
