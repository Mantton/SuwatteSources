import { Target } from "../runners/toonily";
import emulate from "@suwatte/emulator";
import { ZChapterData, ZContent } from "@suwatte/daisuke";

describe("Toonily Tests", () => {
  const source = emulate(Target);

  test("Explore Page", async () => {
    const collections = await source.createExploreCollections();
    const collection = collections[0];
    const data = await source.resolveExploreCollection(collection);

    expect(collection.title).toEqual(data.title);
  });

  test("Get Content", async () => {
    const id = "please-throw-me-away";
    const data = await source.getContent(id);
    expect(data.title).toBe("Just Leave Me Be");
    const parse = () => {
      ZContent.parse(data);
    };
    expect(parse).not.toThrowError();
  });

  test("Get Chapters Data", async () => {
    const id = "please-throw-me-away";
    const chapters = await source.getChapters(id);

    expect(chapters.length).toBeGreaterThan(1);
    const chapter = chapters[0];
    const data = await source.getChapterData(
      chapter.contentId,
      chapter.chapterId
    );
    const parse = () => {
      ZChapterData.parse(data);
    };

    expect(parse).not.toThrowError();
    expect(data.pages).toBeDefined();
  });

  test("Get Source Tags", async () => {
    await expect(source.getSourceTags()).resolves.not.toThrow();
  });

  test("Handle Search", async () => {
    const pagedResult = await source.getSearchResults({ query: "noona" });
    expect(pagedResult.results.length).toBeGreaterThan(2);
    expect(
      pagedResult.results.filter((v) => v.title == "My Landlady Noona").length
    ).toBe(1);
  });
});
