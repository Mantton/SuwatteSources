import { Target } from "../runners/toonily";
import emulate from "@suwatte/emulator";

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
    console.log(data);
  });

  test("Get Chapters Data", async () => {
    const id = "please-throw-me-away";
    const data = await source.getContent(id);

    const chapter = data.chapters?.[0];

    if (chapter) {
      const data = await source.getChapterData(
        chapter.contentId,
        chapter.chapterId
      );
      console.log(data);
    }
  });
});
