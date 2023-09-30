import { PagedResultSchema } from "@suwatte/validate";
import { Target } from "../runners/nepnep";
import emulate from "@suwatte/emulator";

describe("NepNep", () => {
  const source = emulate(Target);

  describe("Directory", () => {
    test("Standard Fetch", async () => {
      const result = await source.getDirectory({ page: 1 });
      expect(PagedResultSchema.parse(result)).toEqual(expect.any(Object));
      expect(result.isLastPage).toBe(false);
      expect(result.results).not.toHaveLength(0);
      expect(result.results[0]).not.toBe(undefined);
      expect(result.results[0].title).toBe("One Piece");
      expect(result.results[0].id).toBe("One-Piece");
    });

    test("Queried Fetch", async () => {
      const result = await source.getDirectory({ page: 1, query: "doctor" });
      expect(PagedResultSchema.parse(result)).toEqual(expect.any(Object));
      expect(result.isLastPage).toBe(true);
      expect(result.results).not.toHaveLength(0);
      expect(result.results[0]).not.toBe(undefined);
      expect(result.results[0].title).toBe("Mesmerizing Ghost Doctor");
      expect(result.results[0].id).toBe("The-Ghostly-Doctor");
    });

    test("Tag Fetch", async () => {
      const result = await source.getDirectory({
        page: 1,
        tag: {
          tagId: "Gender Bender",
          propertyId: "genres",
        },
      });
      expect(PagedResultSchema.parse(result)).toEqual(expect.any(Object));
      expect(result.isLastPage).toBe(false);
      expect(result.results).not.toHaveLength(0);
      expect(result.results[0]).not.toBe(undefined);
      expect(result.results[0].title).toBe("Parallel Paradise");
      expect(result.results[0].id).toBe("Parallel-Paradise");
    });

    test("Filtered Fetch", async () => {
      const result = await source.getDirectory({
        page: 1,
        filters: {
          genres: {
            included: ["Drama", "Comedy", "Psychological"],
            excluded: ["Action"],
          },
        },
      });
      expect(PagedResultSchema.parse(result)).toEqual(expect.any(Object));
      expect(result.isLastPage).toBe(false);
      expect(result.results).not.toHaveLength(0);
      expect(result.results[0]).not.toBe(undefined);
      expect(result.results[0].title).toBe("[Oshi No Ko]");
      expect(result.results[0].id).toBe("Oshi-no-Ko");
    });
  });
});
