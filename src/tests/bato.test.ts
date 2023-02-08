import { Target } from "../runners/bato";
import emulate from "@suwatte/emulator";
import { ReadingMode, Status } from "@suwatte/daisuke";

describe("Bato Tests", () => {
  const source = emulate(Target);

  test("Get Search Results", async () => {
    const includedTags = ["genre:action", "lang:en"];
    const excludedTags = ["genre:crime"];
    const data = await source.getSearchResults({ includedTags, excludedTags });
    expect(data.results.length).toBeGreaterThan(0);
  });

  test("Get Content", async () => {
    const content = await source.getContent("84565");
    expect(content.title).toBe("Sweet Days with a Boy");
    expect(content.recommendedReadingMode).toBe(ReadingMode.PAGED_MANGA);
    expect(content.status).toBe(Status.ONGOING);
    expect(content.properties?.[0]).toBeDefined();
    expect(content.creators?.includes("Aoi nuwi")).toBe(true);
  });

  test("Get Chapter Data", async () => {
    const data = await source.getChapterData("84565", "2176683");
    expect(data.pages).toBeDefined();
    expect(data.pages?.length).toBeGreaterThan(0);
  });
});
