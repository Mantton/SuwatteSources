import { Target } from "../runners/coloredmanga";
import emulate from "@suwatte/emulator";
import {
  PagedResultSchema,
  ContentSchema,
  ChapterSchema,
} from "@suwatte/validate";

describe("ColoredManga Tests", () => {
  const source = emulate(Target);

  test("Query", async () => {
    const data = await source.getDirectory({
      page: 1,
      query: "doctor",
    });
    console.log(data);
    expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
    expect(data.results.length).toBeGreaterThan(1);
  });

  test("Profile", async () => {
    const content = await source.getContent("solo-leveling-webtoon");
    expect(ContentSchema.parse(content)).toEqual(expect.any(Object));
  });

  test("Chapters", async () => {
    const chapters = await source.getChapters("solo-leveling-webtoon");
    expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
    expect(chapters.length).toBeGreaterThan(1);
  });

  //   test("Reader", async () => {
  //     const data = await source.getChapterData("84565", "2176683");
  //     expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
  //   });
});
