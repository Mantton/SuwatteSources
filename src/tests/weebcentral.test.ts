import { Target } from "../runners/weebcentral";
import emulate from "@suwatte/emulator";

describe("Weeb Central", () => {
  const source = emulate(Target);

  describe("HomePage", () => {
    test("Fetch Home Page", async () => {
      const result = await source.getSectionsForPage({ id: "home" });
      console.log(JSON.stringify(result, null, 2));
    });

    test("Fetch Host Updates Page", async () => {
      await source.getSectionsForPage({ id: "kHotUpdates" });
    });
  });

  describe("Get Content", () => {
    test("Log into the Future", async () => {
      const result = await source.getContent("01J76XYHESV0S029GSEE21WD06");
      expect(result.title).toEqual("Log into the Future");

      const chapters = await source.getChapters("01J76XYHESV0S029GSEE21WD06");

      const chapterData = await source.getChapterData(
        "01J76XYHESV0S029GSEE21WD06",
        "01JKKK54RHBM4H88VGHDM3AEBX"
      );

      console.log(JSON.stringify(chapterData, null, 2));
    });

    test("Solo Leveling", async () => {
      const result = await source.getContent("01J76XYCPSY3C4BNPBRY8JMCBE");
      expect(result.title).toEqual("Solo Leveling");
      console.log(JSON.stringify(result, null, 2));
    });
  });

  describe("Get Directory", () => {
    test("Search", async () => {
      const result = await source.getDirectory({
        query: "solo",
        page: 1,
      });
      console.log(JSON.stringify(result, null, 2));
    });
  });
});
