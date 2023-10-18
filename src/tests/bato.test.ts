import { Target } from "../runners/bato";
import emulate from "@suwatte/emulator";
import { ReadingMode, PublicationStatus } from "@suwatte/daisuke";
import {
  PagedResultSchema,
  ContentSchema,
  ChapterSchema,
  ChapterDataSchema,
} from "@suwatte/validate";

describe("Bato Tests", () => {
  const source = emulate(Target);

  test("Query", async () => {
    const data = await source.getDirectory({
      page: 1,
      query: "doctor",
    });
    expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
    expect(data.results.length).toBeGreaterThan(1);
  });

  test("Profile", async () => {
    const content = await source.getContent("72315");
    expect(ContentSchema.parse(content)).toEqual(expect.any(Object));
    expect(content.title).toBe("Doctor Elise: The Royal Lady with the Lamp");
    expect(content.recommendedPanelMode).toBe(ReadingMode.PAGED_COMIC);
    expect(content.status).toBe(PublicationStatus.COMPLETED);
    expect(content.properties?.[0]).toBeDefined();
    expect(content.creators?.includes("Mini")).toBe(true);
  });

  test("Chapters", async () => {
    const chapters = await source.getChapters("72315");
    expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
    expect(chapters.length).toBeGreaterThan(1);
  });

  test("Reader", async () => {
    const data = await source.getChapterData("84565", "2176683");
    expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
  });
});
