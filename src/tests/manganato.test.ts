import { Status } from "@suwatte/daisuke";
import { Target } from "../runners/manganato";
import emulate from "@suwatte/emulator";
import { Validate, ZExploreCollection } from "@suwatte/validate";

describe("MangaNato Tests", () => {
  const source = emulate(Target);

  describe("Explore Page", () => {
    beforeAll(() => {
      return source.willResolveExploreCollections();
    });

    test.each([
      { id: "top", title: "Top This Week", style: 0 },
      { id: "new", title: "New Titles", style: 0 },
      { id: "latest", title: "Latest Updates", style: 3 },
    ])("Test Explore Collections", async (excerpt) => {
      const data = await source.resolveExploreCollection(excerpt);
      expect(data.highlights.length).toBeGreaterThan(5);
      expect(() => {
        ZExploreCollection.parse(data);
      }).not.toThrowError();
    });
  });

  describe("Search Tests", () => {
    test("No Query/Filter Search", async () => {
      const result = await source.getSearchResults({});
      expect(Validate.object.pagedResult(result)).toBe(true);
    });
    test("Query Search", async () => {
      const result = await source.getSearchResults({ query: "doctor" });
      expect(
        result.results.some((v) => v.title.toLowerCase().includes("doctor"))
      ).toBe(true);
      expect(Validate.object.pagedResult(result)).toBe(true);
    });
    test("Filter Search", async () => {
      const result = await source.getSearchResults({
        filters: [{ id: "genre", included: ["7", "12"] }],
      });
      expect(Validate.object.pagedResult(result)).toBe(true);
      expect(result.results.map((v) => v.title)).toContain("Isekai Ryouridou");
    });
  });

  describe("Content Tests", () => {
    test("Content Parse Check", async () => {
      const id = "manga-bn979022";
      const content = await source.getContent(id);
      expect(content.title).toBe("Isekai Ryouridou");
      expect(content.contentId).toBe(id);
      expect(content.cover).toBe(
        "https://avt.mkklcdnv6temp.com/25/v/16-1583494399.jpg"
      );
      expect(content.status).toBe(Status.ONGOING);
    });
  });

  test("Get Content Chapters", async () => {
    const id = "manga-bn979022";
    const chapters = await source.getChapters(id);
    expect(chapters.length).toBeGreaterThan(40);
    expect(Validate.array.chapter(chapters)).toBe(true);
  });

  test("Get Chapter Data", async () => {
    const data = await source.getChapterData("manga-bn979022", "chapter-9");
    expect(data.pages?.length).toBeGreaterThan(0);
    expect(Validate.object.chapterData(data)).toBe(true);
  });
});
