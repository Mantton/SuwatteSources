import emulate from "@suwatte/emulator";
import { Target } from "../runners/readcomicsonline";
import {
  ChapterDataSchema,
  ChapterSchema,
  ContentSchema,
  PagedResultSchema,
} from "@suwatte/validate";
describe("ReadComicsOnline Tests", () => {
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
        query: "doctor",
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

  describe("Profile", () => {
    const ids = [
      "/comic/batman-2016",
      "/comic/saga-2012",
      "/comic/the-flash-2016",
      "/comic/avengers-2018",
      "/comic/dark-knights-of-steel-2021",
      "/comic/batman-three-jokers-2020",
      "/comic/new-mutants-2019",
      "/comic/fantastic-four-2018",
    ];

    test.each([ids])("Details (%s)", async (id) => {
      const content = await source.getContent(id);
      expect(ContentSchema.parse(content)).toEqual(expect.any(Object));

      const chapters = await source.getChapters(id);
      expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
    });
  });

  test("Reader", async () => {
    const contentId = "/comic/batman-2016";
    const chapterId = "/comic/batman-2016/46";
    const data = await source.getChapterData(contentId, chapterId);
    expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
  });
});
