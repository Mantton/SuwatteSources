import emulate from "@suwatte/emulator";
import { Target } from "../runners/en.manhwa18cc";
import {
  ChapterDataSchema,
  ChapterSchema,
  ContentSchema,
  PagedResultSchema,
} from "@suwatte/validate";
describe("Manhwa18cc Tests", () => {
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
        query: "doctor",
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
  const id = "/webtoon/secret-class";

  test("Profile", async () => {
    const content = await source.getContent(id);
    expect(ContentSchema.parse(content)).toEqual(expect.any(Object));
  });

  test("Chapters", async () => {
    const chapters = await source.getChapters(id);
    expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
    expect(chapters.length).toBeGreaterThan(1);
  });

  test("Reader", async () => {
    const contentId = "/webtoon/secret-class";
    const chapterId = "/webtoon/secret-class/chapter-189?style=list";

    const data = await source.getChapterData(contentId, chapterId);
    expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
  });
});
