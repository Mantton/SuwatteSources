import { PublicationStatus } from "@suwatte/daisuke";
import { Target } from "../runners/mangapill";
import emulate from "@suwatte/emulator";
import {
  ChapterDataSchema,
  ChapterSchema,
  ContentSchema,
  PagedResultSchema,
} from "@suwatte/validate";
describe("MangaPill Tests", () => {
  const source = emulate(Target);

  describe("Search Tests", () => {
    test("Query Search", async () => {
      const data = await source.getDirectory({ query: "doctor", page: 1 });
      expect(data.results.length).toBeGreaterThan(3);
      expect(
        data.results.some((v) => v.title.toLowerCase().includes("doctor"))
      ).toBe(true);
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
      expect(data.results.length).toBeGreaterThan(1);
    });

    test("Filter Search", async () => {
      const data = await source.getDirectory({
        page: 1,
        filters: {
          genre: ["Historical"],
          status: "on hiatus",
          type: "manga",
        },
      });
      expect(data.results.length).toBeGreaterThan(3);
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
    });
  });

  test("Get Content", async () => {
    const content = await source.getContent("1");
    expect(content.title).toBe("Berserk");
    expect(content.status).toBe(PublicationStatus.ONGOING);
    expect(ContentSchema.parse(content)).toEqual(expect.any(Object));
  });

  test("Get Chapters", async () => {
    const chapters = await source.getChapters("1");
    expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
    expect(chapters.length).toBeGreaterThan(1);
  });

  test("Get Chapter Data", async () => {
    const data = await source.getChapterData(
      "1",
      "/chapters/1-20370000/berserk-chapter-370"
    );
    expect(data.pages?.every((v) => v.url)).toBe(true);
    expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
  });
});
