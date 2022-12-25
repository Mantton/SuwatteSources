import { Target } from "../runners/nepnep";
import emulate from "@suwatte/emulator";

describe("NepNep Tests", () => {
  const source = emulate(Target);

  test("Get Filters", async () => {
    const filters = await source.getSearchFilters();
  });
});
