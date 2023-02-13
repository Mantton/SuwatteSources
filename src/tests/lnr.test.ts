import { Target } from "../runners/lnr";
import emulate from "@suwatte/emulator";

describe("LNR Tests", () => {
  const source = emulate(Target);

  test("Get Content", async () => {
    const id = "i-will-avoid-the-male-lead-and-make-my-harem";
    const data = await source.getContent(id);
    expect(data);
  });

  test("Get Chapters Data", async () => {
    const id = "i-will-avoid-the-male-lead-and-make-my-harem";
    const chapterId = "volume-1/chapter-9";
    const data = await source.getChapterData(id, chapterId);
    expect(data.text).not.toBeUndefined();
    expect(data.text).not.toBeNull();
    expect(data.text?.length).toBeGreaterThan(120);
  });

  test("Parse Ranked Page", async () => {
    const data = await source.getRankedHighlights("subscribers");
    expect(data.length).toEqual(24);
    expect(data[0].title).toEqual("The Beginning After The End");
  });

  test("Get Source Tags", async () => {
    const properties = await source.getSourceTags();
    expect(properties);
  });

  test("Search Source", async () => {
    const pagedResult = await source.getSearchResults({
      // includedTags: ["genre|4", "genre|15"],
      page: 1,
    });
    expect(pagedResult.results[0]).not.toBeUndefined();
    expect(pagedResult.results?.[0].title).toBe("9 Heavenly Thunder Manual");
  });
});
