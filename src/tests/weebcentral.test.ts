import { Target } from "../runners/weebcentral";
import emulate from "@suwatte/emulator";

describe("Weeb Central", () => {
  const source = emulate(Target);

  describe("HomePage", () => {
    test("Fetch Home Page", async () => {
      const result = await source.getSectionsForPage({ id: "home" });

      for (const r of result) {
        expect(r.items).toBeDefined();
        expect(r.items!.length).toBeGreaterThan(0);
      }
    });

    test("Fetch Host Updates Page", async () => {
      let section = await source.getSectionsForPage({ id: "kHotUpdates" });
      // console.log(JSON.stringify(section, null, 2));
    });
  });

  describe("Get Content", () => {
    const CONTENT_ID = "01J76XYCPSY3C4BNPBRY8JMCBE";
    test("Solo Leveling", async () => {
      const result = await source.getContent(CONTENT_ID);
      expect(result.title).toEqual("Solo Leveling");
      // console.log(JSON.stringify(result, null, 2));
    });

    test("Get Chapters", async () => {
      const result = await source.getChapters(CONTENT_ID);
      expect(result.length).toBeGreaterThan(1);
      // console.log(JSON.stringify(result, null, 2));
    })

    test("Get Chapter Data", async () => {
      const result = await source.getChapters(CONTENT_ID);
      let targets = result.slice(0, 3);

      for (const target of targets) {
        const result = await source.getChapterData(CONTENT_ID, target.chapterId, target);
        expect(result.pages).toBeDefined();
        // console.log(JSON.stringify(result, null, 2));
      }
    })
  });

  describe("Get Directory", () => {
    test("Search", async () => {
      const result = await source.getDirectory({
        query: "solo",
        page: 1,
      });
      // console.log(JSON.stringify(result, null, 2));
    });
  });

  
});
