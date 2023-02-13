import { Target } from "../runners/nepnep";
import emulate from "@suwatte/emulator";
import { Validate } from "@suwatte/daisuke";

describe("NepNep Tests", () => {
  const source = emulate(Target);

  test("Get Content", async () => {
    const content = await source.getContent("Parallel-Paradise");
    expect(content.adultContent).toBe(true);
    expect(Validate.object.content(content));
  });
});
