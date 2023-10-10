import emulate from "@suwatte/emulator";
import { Target } from "../graveyard/readcomicsonline";
import {
  ChapterDataSchema,
  ChapterSchema,
  ContentSchema,
  PagedResultSchema,
} from "@suwatte/validate";
describe("ReadComicOnline Tests", () => {
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

  test("Profile", async () => {
    const id = "/Comic/The-Walking-Dead";

    const content = await source.getContent(id);
    expect(ContentSchema.parse(content)).toEqual(expect.any(Object));

    const chapters = await source.getChapters(id);
    console.log(chapters.reverse());
    expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
  });

  test("Reader", async () => {
    const contentId = "/Comic/The-Walking-Dead";
    const chapterId = "/Comic/The-Walking-Dead/Issue-42?id=1807";
    const data = await source.getChapterData(contentId, chapterId);

    console.log(data);
    expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
  });
});
