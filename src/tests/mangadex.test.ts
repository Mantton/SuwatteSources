import { Target } from "../runners/mangadex";
import emulate from "@suwatte/emulator";
import { Validate } from "@suwatte/daisuke";

describe("MangaDex Tests", () => {
  const source = emulate(Target);
  const testIds = [
    "32d76d19-8a05-4db0-9fc2-e0b0648fe9d0",
    "77bee52c-d2d6-44ad-a33a-1734c1fe696a",
    "d8a959f7-648e-4c8d-8f23-f1f3f8e129f3",
  ];
  const seasonalList = "7df1dabc-b1c5-4e8e-a757-de5a2a3d37e9";

  test("Search", async () => {
    const data = await source.getSearchResults({
      filters: [
        {
          id: "content_rating",
          included: ["suggestive"],
        },
      ],
    });
    expect(Validate.object.pagedResult(data)).toBe(true);
  });
  test("Get Tags", async () => {
    const tags = await source.getSourceTags();
    expect(tags).not.toBe(null);
  });

  test("Get Chapters", async () => {
    const chapters = await source.getChapters(
      "259dfd8a-f06a-4825-8fa6-a2dcd7274230"
    );

    expect(chapters.length).toBeGreaterThanOrEqual(1);
  });

  describe("Test Explore Collections", () => {
    test("Create Collections", async () => {
      const collections = await source.createExploreCollections();
      // Simple Test
      expect(collections.length).toBeGreaterThan(1);
    });

    test("Get Popular New Titles", async () => {
      const data = await source.getPopularNewTitles();
      expect(data.results.length).toBeGreaterThan(1);
    });
  });
  test("Get MD Statistics", async () => {
    const result = await source.getMDStatistics(testIds);

    expect(result).not.toBe(null);
  });
  test("Get MD Seasonal List", async () => {
    const list = await source.getMDList(seasonalList);
    expect(list.title).toContain("Seasonal");
  });

  test("Get Chapters", async () => {
    const id = "b2ca4e0e-a7d7-4c98-bfa3-c771c643bb68";

    const chapters = await source.getChapters(id);
    expect(chapters.length).toBeGreaterThan(1);
  });

  describe("Sync Flow", () => {
    test("Sign In", async () => {
      const username = "stt_guest";
      const password = "jo4dKZ8X5bBH8xge";
      await expect(
        source.handleBasicAuth(username, password)
      ).resolves.not.toThrow();
    });

    test("Get Authenticated User", async () => {
      const user = await source.getAuthenticatedUser();

      expect(user).not.toBeNull();
      expect(user?.username).toBe("stt_guest");
    });

    test("Get Library Statuses", async () => {
      await expect(source.getMDUserStatuses()).resolves.not.toThrow();
    });
    test("Sync Library", async () => {
      const library = await source.syncUserLibrary([]);
      expect(library.length).toBeGreaterThan(1);
    });

    test("Get Read Chapter Markers", async () => {
      const markers = source.getReadChapterMarkers(
        "9a414441-bbad-43f1-a3a7-dc262ca790a3"
      );
      await expect(markers).resolves.not.toThrow();
    });
  });

  // test("Search Sorters", async () => {});
  // test("Search Sorters", async () => {});
});
