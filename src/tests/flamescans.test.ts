import emulate from "@suwatte/emulator";
import { Target } from "../runners/flamescans";
import {
  ChapterDataSchema,
  ChapterSchema,
  ContentSchema,
  PagedResultSchema,
} from "@suwatte/validate";
describe("FlameScans Tests", () => {
  const source = emulate(Target);

  describe("Paged results", () => {
    test("Popular", async () => {
      const data = await source.getDirectory({
        page: 1,
        sort: { id: "popular" },
      });
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
      expect(data.results.length).toBeGreaterThan(1);
    });
    test("Query", async () => {
      const data = await source.getDirectory({
        page: 1,
        query: "level",
      });
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
      expect(data.results.length).toBeGreaterThan(1);
    });
    test("Latest", async () => {
      const data = await source.getDirectory({
        page: 1,
        sort: { id: "latest" },
      });
      expect(PagedResultSchema.parse(data)).toEqual(expect.any(Object));
      expect(data.results.length).toBeGreaterThan(1);
    });
  });

  describe("Single Profile", () => {
    const id = "/series/1696975321-my-wife-is-actually-the-empress/";

    test("Details", async () => {
      const content = await source.getContent(id);
      expect(ContentSchema.parse(content)).toEqual(expect.any(Object));
    });

    test("Chapters", async () => {
      const chapters = await source.getChapters(id);
      expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
    });
  });
  test("Reader", async () => {
    const contentId = "/series/1696975321-my-wife-is-actually-the-empress/";
    const chapterId = "/1696975261-my-wife-is-actually-the-empress-chapter-41/";
    const data = await source.getChapterData(contentId, chapterId);
    expect(ChapterDataSchema.parse(data)).toEqual(expect.any(Object));
  });

  describe("Profile", () => {
    const ids = [
      ["/series/1696975321-omniscient-readers-viewpoint/"],
      ["/series/1696975321-heavenly-demon-cultivation-simulation/"],
      ["/series/1696975321-reincarnation-of-the-murim-clans-former-ranker/"],
      ["/series/1696975321-the-ancient-sovereign-of-eternity/"],
      ["/series/1696975321-is-this-hero-for-real/"],
      ["/series/1696975321-solo-necromancy/"],
      ["/series/1696975321-real-life-quest/"],
      ["/series/1696975321-monster-pet-evolution/"],
      ["/series/1696975321-i-used-to-be-a-boss/"],
      ["/series/1696975321-jungle-juice/"],
      ["/series/1696975321-hero-has-returned/"],
      [
        "/series/1696975321-clever-cleaning-life-of-the-returned-genius-hunter/",
      ],
      ["/series/1696975321-my-wife-is-actually-the-empress/"],
      ["/series/1696975321-the-heavenly-demon-destroys-the-lich-kings-murim/"],
      ["/series/1696975321-bj-archmage/"],
      ["/series/1696975321-tyrant-of-the-tower-defense-game/"],
      ["/series/1696975321-solo-leveling/"],
      ["/series/1696975321-a-returners-magic-should-be-special/"],
      ["/series/1696975321-moon-shadow-sword-emperor/"],
      ["/series/1696975321-the-breaker-3/"],
      ["/series/1696975321-level-1-player/"],
      ["/series/1696975321-ex-and-ash/"],
      ["/series/1696975321-dungeon-reset/"],
      [
        "/series/1696975321-i-got-caught-up-in-a-hero-summon-but-the-other-world-was-at-peace/",
      ],
    ];

    test.concurrent.each(ids)("run %s", async (id) => {
      const content = await source.getContent(id);
      expect(ContentSchema.parse(content)).toEqual(expect.any(Object));
      const chapters = await source.getChapters(id);
      expect(ChapterSchema.array().parse(chapters)).toEqual(expect.any(Array));
    });
  });
});
