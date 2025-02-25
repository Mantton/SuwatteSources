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
      console.log(JSON.stringify(section, null, 2));
    });
  });

  describe("Get Content", () => {
    test("Solo Leveling", async () => {
      const result = await source.getContent("01J76XYCPSY3C4BNPBRY8JMCBE");
      expect(result.title).toEqual("Solo Leveling");
      // console.log(JSON.stringify(result, null, 2));
    });
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
