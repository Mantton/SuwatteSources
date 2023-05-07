import { Target } from "../runners/comick";
import emulate from "@suwatte/emulator";
import { Validate } from "@suwatte/validate";

const ids = [
  "solo-leveling",
  "one-punch-man",
  "tensei-shitara-slime-datta-ken",
  "a-story-about-treating-a-female-knight-who-has-never-been-treated-as-a-woman-as-a-woman",
  "kumo-desu-ga-nani-ka",
  "mairimashita-iruma-kun",
  "kage-no-jitsuryokusha-ni-naritakute",
  "a-returner-s-magic-should-be-special",
  "kimetsu-no-yaiba",
  "kaifuku-jutsushi-no-yarinaoshi",
  "mushoku-tensei-isekai-ittara-honki-dasu",
  "mato-seihei-no-slave",
  "iron-ladies",
  "one-punch-man-webcomic-original",
  "fukushuu-o-koinegau-saikyou-yuusha-wa-yami-no-chikara-de-senmetsu-musou-suru",
  "isekai-meikyuu-de-harem-wo",
  "beware-of-the-villainess",
  "arifureta-shokugyou-de-sekai-saikyou",
  "shingeki-no-kyojin",
  "kengan-omega",
  "maou-no-ore-ga-dorei-elf-wo-yome-ni-shitanda-ga-dou-medereba-ii",
  "skeleton-soldier-couldn-t-protect-the-dungeon",
  "jo-jo-s-bizarre-adventure-part-8-jo-jolion",
  "tsuki-ga-michibiku-isekai-douchuu",
  "tate-no-yuusha-no-nariagari",
  "the-world-of-otome-games-is-tough-for-mobs",
  "lv2-kara-cheat-datta-moto-yuusha-kouho-no-mattari-isekai-life",
  "yuragi-sou-no-yuuna-san",
  "tales-of-demons-and-gods",
  "jimi-na-kensei-wa-sore-demo-saikyou-desu",
  "martial-peak",
  "i-m-an-evil-god",
  "more-kill-more-powerful",
  "the-legend-of-zelda-oath-of-lilto",
  "a-liger-under-the-mountain-river",
  "the-reason-why-the-hero-of-another-world-saves-the-earth",
  "this-is-the-law",
  "kono-sekai-ga-izure-horobu-koto-wo-ore-dake-ga-shitte-iru",
  "hwarang-flower-knights-of-the-underworld",
  "no-scope",
  "warrior-executioner",
  "rebirth-of-the-earth-immortal-venerable",
  "cultivator-vs-superhero",
  "souboutei-must-be-destroyed",
  "i-m-cursed-but-i-became-stronger",
  "the-revenge-of-the-soul-eater",
  "tank-chair",
  "the-time-of-rebirth",
  "spy-no-tsuma",
  "the-reborn-super-doctor",
  "the-divine-martial-stars",
  "wo-bei-kun-zai-tongyi-tian-yiqian-nian",
  "messiah-end-of-the-gods",
  "the-greatest-estate-developer",
  "tiger-s-descent",
  "renkinjutsu-shidesu-jichou-wa-gomibako-ni-sutete-kimashita",
  "heroine-wa-zetsubou-shimashita",
  "daimakyo-the-demon-lands",
  "mao",
  "the-tutorial-is-too-hard",
];
describe("ComicK Tests", () => {
  const source = emulate(Target);

  describe("Search Tests", () => {
    test("Search With Tags", async () => {
      const data = await source.getSearchResults({
        filters: [
          { id: "genres", included: ["action", "adventure", "animals"] },
        ],
        sort: "user_follow_count",
      });

      expect(data.results[0].title).toBe("SPY×FAMILY");
      expect(data.results[1].title).toBe("Eleceed");
      expect(data.results[2].title).toBe("I Grow Stronger By Eating!");
      expect(Validate.object.pagedResult(data)).toBe(true);
    });

    test("Search with Query", async () => {
      const data = await source.getSearchResults({
        query: "doctor",
      });
      expect(
        data.results.map((v) => v.title).every((v) => v.includes("doctor"))
      );
      expect(Validate.object.pagedResult(data)).toBe(true);
    });
  });

  describe("Content Information", () => {
    test("Parse Logic", async () => {
      const content = await source.getContent("solo-leveling");
      // Check Title
      expect(content.title).toBe("Solo Leveling");
      // Check Authors
      expect(content.creators).toContain("Jang Sung-Rak (장성락)");
      // Check Genres
      expect(content.properties?.[0].tags.map((v) => v.id)).toContain("action");
      // Check Tags
      expect(content.properties?.[1].tags.map((v) => v.id)).toContain(
        "god-human-relationship"
      );

      expect(Validate.object.content(content)).toBe(true);
    });

    test("Schema Validation", async () => {
      const contents = await Promise.all(ids.map((v) => source.getContent(v)));
      expect(Validate.array.content(contents)).toBe(true);
    });
  });

  describe("Content Chapters", () => {
    test("Get Chapters [Solo Leveling]", async () => {
      const chapters = await source.getChapters("solo-leveling");
      expect(chapters.length).toBeGreaterThan(1);

      // General Schema Check
      expect(Validate.array.chapter(chapters)).toBe(true);
    });
    test("Schema Validation", async () => {
      const all = await Promise.all(ids.map((v) => source.getChapters(v)));
      expect(Validate.array.chapter(all.flatMap((v) => v))).toBe(true);
    });
  });

  test("Chapter Data", async () => {
    const chapters = (await source.getChapters("solo-leveling")).slice(0, 10);
    const data = await Promise.all(
      chapters.map((v) => source.getChapterData(v.contentId, v.chapterId))
    );
    expect(Validate.array.chapterData(data)).toBe(true);
  });

  test("Explore Page", async () => {
    const collections = await source.createExploreCollections();
    const data = await source.resolveExploreCollection(collections[0]);
    expect(data);
  });

  test("Get Filters", async () => {
    const filters = await source.getSearchFilters();
    expect(filters);
  });
});
