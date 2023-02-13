import { Target } from "../runners/comiccastle";
import emulate from "@suwatte/emulator";
import { CollectionStyle, Status } from "@suwatte/daisuke";

describe("Comic Castle Tests", () => {
  const source = emulate(Target);

  test("Test Get Content", async () => {
    const id = "3789";
    const data = await source.getContent(id);
    expect(data);
    expect(data.title).toEqual("Web of Black Widow (2019)");
    expect(data.status).toEqual(Status.COMPLETED);
  });

  test("should Get Chapters", async () => {
    const data = await source.getChapters("3789");
    expect(data);
  });
  describe("Explore Collections", () => {
    test("Popular Today", async () => {
      const data = await source.resolveExploreCollection({
        id: "popular_today",
        title: "",
        style: CollectionStyle.NORMAL,
      });
      expect(data.highlights.length).toBeGreaterThan(1);
    });
    test("You may Also Like", async () => {
      const data = await source.resolveExploreCollection({
        id: "ymal",
        title: "",
        style: CollectionStyle.NORMAL,
      });
      expect(data.highlights.length).toBeGreaterThan(1);
    });
    test("Ongoing Updates", async () => {
      const data = await source.resolveExploreCollection({
        id: "ongoing_updates",
        title: "",
        style: CollectionStyle.NORMAL,
      });
      expect(data.highlights.length).toBeGreaterThan(1);
    });
    test("Completed & One Shots", async () => {
      const data = await source.resolveExploreCollection({
        id: "c_a_o",
        title: "",
        style: CollectionStyle.NORMAL,
      });
      expect(data.highlights.length).toBeGreaterThan(1);
    });
    test("Most Popular", async () => {
      const data = await source.resolveExploreCollection({
        id: "most_popular",
        title: "",
        style: CollectionStyle.NORMAL,
      });
      expect(data.highlights.length).toBeGreaterThan(1);
    });
    test("Latest", async () => {
      const data = await source.resolveExploreCollection({
        id: "latest",
        title: "",
        style: CollectionStyle.NORMAL,
      });
      expect(data.highlights.length).toBeGreaterThan(1);
    });
  });

  test("Get Chapter Data", async () => {
    const data = await source.getChapterData("456", "4201");
    expect(data.pages?.length).toBeGreaterThan(0);
  });

  test("Get Search Results", async () => {
    const data = await source.getSearchResults({ query: "doctor" });
    expect(data.results.length).toBeGreaterThan(1);
    expect(data.results[0].title).toBe(
      "Doctor Star and The Kingdom of Lost Tomorrows: From the World of Black Hammer"
    );
  });
  test("Get Search Results", async () => {
    const data = await source.getSearchResults({
      filters: [{ id: "publisher", included: ["Marvel"] }],
    });
    expect(data.results.length).toBeGreaterThan(1);
  });
});
