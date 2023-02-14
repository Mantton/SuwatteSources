import { Target } from "../runners/mangapill";
import emulate from "@suwatte/emulator";
import { Status, Validate } from "@suwatte/daisuke";

describe("MangaPill Tests", () => {
  const source = emulate(Target);

  describe("Search Tests", () => {
    test("Query Search", async () => {
      const data = await source.getSearchResults({ query: "doctor" });
      expect(data.results.length).toBeGreaterThan(3);
      expect(
        data.results.some((v) => v.title.toLowerCase().includes("doctor"))
      ).toBe(true);
      expect(Validate.object.pagedResult(data)).toBe(true);
    });
    test("Filter Search", async () => {
      const data = await source.getSearchResults({
        filters: [
          { id: "genre", included: ["Historical"] },
          { id: "status", included: ["on hiatus"] },
          { id: "type", included: ["manga"] },
        ],
      });
      expect(data.results.length).toBeGreaterThan(3);
      expect(Validate.object.pagedResult(data)).toBe(true);
    });
  });

  test("Get Content", async () => {
    const content = await source.getContent("1");
    expect(content.title).toBe("Berserk");
    expect(content.status).toBe(Status.ONGOING);
    expect(Validate.object.content(content)).toBe(true);
  });

  test("Get Chapters", async () => {
    const chapters = await source.getChapters("1");
    expect(Validate.array.chapter(chapters)).toBe(true);
  });

  test("Get Chapter Data", async () => {
    const data = await source.getChapterData(
      "1",
      "/chapters/1-20370000/berserk-chapter-370"
    );
    expect(data.pages?.every((v) => v.url)).toBe(true);
    expect(Validate.object.chapterData(data)).toBe(true);
  });
});
