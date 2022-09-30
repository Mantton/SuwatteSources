import { Target } from "../runners/lnr";
import emulate from "@suwatte/emulator";

describe("LNR Tests", () => {
  const source = emulate(Target);

  test("Get Content", async () => {
    const id = "i-will-avoid-the-male-lead-and-make-my-harem";
    const data = await source.getContent(id);
  });

  test("Get Explore Page", async () => {
    const collections = await source.createExploreCollections();
    console.log(collections);
  });

  test("Get Chapters Data", async () => {
    const id = "i-will-avoid-the-male-lead-and-make-my-harem";
    const chapterId = "volume-1/chapter-9";
    const data = await source.getChapterData(id, chapterId);
    console.log(data);
  });
});
