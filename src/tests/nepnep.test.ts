import { Target } from "../runners/nepnep";
import emulate from "@suwatte/emulator";

describe("NepNep Tests", () => {
  const source = emulate(Target);

  test("Homepage", async () => {
    const data = await source.willResolveExploreCollections();
  });

  test("Get Content", async () => {
    const content = await source.getContent("Parallel-Paradise");
    expect(content.adultContent).toBe(true);
    expect(content.title).toBe("Parallel Paradise");
    // expect(Validate.object.content(content));
    console.log(content.cover);
  });
});
