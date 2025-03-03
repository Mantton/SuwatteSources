import { Target } from "../runners/toonily/index";
import emulate from "@suwatte/emulator";

describe("Toonily", () => {
  const source = emulate(Target);

  describe("Directory", () => {
    test("Search Content", async () => {
      const result = await source.getDirectory({
        query: "martial",
        page: 1,
      });
      expect(result).toBeDefined();
      // console.log(JSON.stringify(result, null, 2));
      // expect(result.items).toBeDefined();
      // expect(result.items.length).toBeGreaterThan(0);
    }); 
  });

  describe("Content", () => {
    test("Fetch Specific Content", async () => {
      const id = "you-wont-get-me-twice";
      const content = await source.getContent(id);
      expect(content).toBeDefined();
      expect(content.title).toBeDefined();
      expect(content.summary).toBeDefined();
      expect(content.creators).toBeDefined();
    });
  });

});