import { Target } from "../runners/hiperdex";
import emulate from "@suwatte/emulator";
import { ZChapterData, ZContent } from "@suwatte/daisuke";

describe("Hiperdex Tests", () => {
  const source = emulate(Target);

  test("Explore Page", async () => {
    const collections = await source.createExploreCollections();
    const collection = collections[0];
    const data = await source.resolveExploreCollection(collection);

    expect(data.highlights.length).toBeGreaterThan(1);
    expect(collection.title).toEqual(data.title);
  });

  test("Get Content", async () => {
    const id = "unlock-her-heart";
    const data = await source.getContent(id);
    expect(data.title).toBe("Unlock Her Heart");
    const parse = () => {
      ZContent.parse(data);
    };
    expect(parse).not.toThrowError();
  });

  test("Get Chapters Data", async () => {
    const id = "unlock-her-heart";
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
