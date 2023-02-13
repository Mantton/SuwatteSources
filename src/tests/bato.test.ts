import { Target } from "../runners/bato";
import emulate from "@suwatte/emulator";
import { ReadingMode, Status } from "@suwatte/daisuke";

describe("Bato Tests", () => {
  const source = emulate(Target);

  test("Get Search Results", async () => {
    const data = await source.getSearchResults({
      filters: [
        { id: "genre", included: ["action"], excluded: ["crime"] },
        { id: "lang", included: ["en"] },
      ],
    });
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
  test("Get Content", async () => {
    const content = await source.getContent("72315");
    expect(content.title).toBe("Doctor Elise: The Royal Lady with the Lamp");
    expect(content.recommendedReadingMode).toBe(ReadingMode.PAGED_COMIC);
    expect(content.status).toBe(Status.COMPLETED);
    expect(content.properties?.[0]).toBeDefined();
    expect(content.creators?.includes("Mini")).toBe(true);
  });
  test("Get Chapter Data", async () => {
    const data = await source.getChapterData("84565", "2176683");
    expect(data.pages).toBeDefined();
    expect(data.pages?.length).toBeGreaterThan(0);
  });
});
