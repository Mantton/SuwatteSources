import {
  Highlight,
  PageLink,
  PageLinkResolver,
  PageSection,
  ResolvedPageSection,
  SectionStyle,
} from "@suwatte/daisuke";
// import { CLIENT } from "./network";
import { HOST_URL } from ".";
import { load } from "cheerio";
import moment from "moment";

const THUMBNAIL_URL = "https://temp.compsci88.com/cover/normal/{$0}.webp";
export const WCPageLinkResolver: PageLinkResolver = {
  getSectionsForPage: function ({ id }: PageLink): Promise<PageSection[]> {
    if (id === "home") return buildHomePageSections();
    if (id === "kHotUpdates") return buildHotUpdatesPage();
    throw new Error(`Unknown Page ${id}`);
  },

  resolvePageSection: function (
    _link: PageLink,
    _sectionID: string
  ): Promise<ResolvedPageSection> {
    throw new Error("unreachable, sections are pre-built");
  },
};

async function buildHomePageSections(): Promise<PageSection[]> {
  const CLIENT = new NetworkClient();

  const { data } = await CLIENT.get(HOST_URL);
  const $ = load(data);

  // Hot Updates
  const hot_updates: PageSection = (() => {
    const SELECTOR =
      "body > main > section:nth-of-type(1) > section  article.md\\:hidden";
    const items = $(SELECTOR).toArray();
    const highlights: Highlight[] = items.map((item) => {
      const el = $(item);
      const title = $("div:nth-of-type(2) > a > div.font-semibold", el)
        .text()
        .trim();
      const subtitle = $("div:nth-of-type(2) > a > div:nth-of-type(2) span", el)
        .text()
        .trim();
      const cover = $("img", el).attr("src") ?? "";
      const id =
        $("div:nth-of-type(1) > a", el).attr("href")?.split("/").at(-2) ?? "";
      return {
        id,
        title,
        subtitle,
        cover,
      };
    });

    return {
      id: "kHotUpdates",
      title: "🔥 Hot Updates",
      subtitle: "Stay in the Know!",
      items: highlights,
      style: SectionStyle.GALLERY,
      viewMoreLink: {
        page: {
          id: "kHotUpdates",
        },
      },
    };
  })();

  // Admin Recommendations
  const admin_recs: PageSection = (() => {
    const SELECTOR = "body > main > section:nth-child(3) .glide__track li > a";
    const items = $(SELECTOR).toArray();
    const highlights: Highlight[] = items.map((item) => {
      const el = $(item);
      const title = el.text().trim();
      const cover = $("img", el).attr("src") ?? "";
      const id = el.attr("href")?.split("/").at(-2) ?? "";
      return {
        id,
        title,
        cover,
      };
    });

    return {
      id: "kAdminRecs",
      title: "Admin's Picks",
      subtitle: "Your Top Picks!",
      items: highlights,
      style: SectionStyle.INFO,
    };
  })();

  // Recently Added
  const recently_added: PageSection = (() => {
    const SELECTOR =
      "body > main > section:nth-child(2) > section:nth-child(2) > section:nth-child(3) a";
    const items = $(SELECTOR).toArray();
    const highlights: Highlight[] = items.map((item) => {
      const el = $(item);
      const title = el.text().trim();
      const id = el.attr("href")?.split("/").at(-2) ?? "";
      const cover = THUMBNAIL_URL.replace("{$0}", id);
      return {
        id,
        title,
        cover,
      };
    });

    return {
      id: "kRecentlyAdded",
      title: "Recently Added",
      subtitle: "Check Out What's New!",
      items: highlights,
    };
  })();

  // Recently Added
  const hot_series = async (key: string): Promise<Highlight[]> => {
    const { data } = await CLIENT.get(HOST_URL + "/hot-series?sort=" + key);
    const $ = load(data);
    const SELECTOR = "a";
    const items = $(SELECTOR).toArray();
    const highlights: Highlight[] = items.map((item) => {
      const el = $(item);
      const title = el.text().trim();
      const id = el.attr("href")?.split("/").at(-2) ?? "";
      const cover = THUMBNAIL_URL.replace("{$0}", id);
      return {
        id,
        title,
        cover,
      };
    });

    return highlights;
  };

  const hot_weekly: PageSection = await (async () => {
    return {
      id: "kHotWeekly",
      title: "Trending This Week",
      subtitle: "What Everyone's Talking About",
      items: await hot_series("weekly_views"),
    };
  })();

  const hot_monthly: PageSection = await (async () => {
    return {
      id: "kHotMonthly",
      title: "Top This Month",
      items: await hot_series("monthly_views"),
      style: SectionStyle.INFO,
    };
  })();

  const hot_total: PageSection = await (async () => {
    return {
      id: "kHotAllTime",
      title: "All Time Favorites",
      subtitle: "The Best of the Best",
      items: await hot_series("total_views"),
      style: SectionStyle.GALLERY,
    };
  })();

  // Recently Added
  const latest_updates: PageSection = (() => {
    const SELECTOR =
      "body > main > section:nth-child(2) > section:nth-child(1) article";
    const items = $(SELECTOR).toArray();
    const highlights: Highlight[] = items.map((item) => {
      const el = $(item);
      const id = $("a:nth-child(1)", el).attr("href")?.split("/").at(-2) ?? "";
      const title = $("a:nth-child(2)  div.font-semibold", el).text().trim();
      const chapter = $("a:nth-child(2) > div:nth-child(2)", el).text().trim();
      const time = moment($("time", el).attr("datetime") ?? "").fromNow();
      const cover = $("img", el).attr("src") ?? "";
      const subtitle = `${chapter} • ${time}`;
      return {
        id,
        title,
        info: [subtitle],
        cover,
      };
    });

    return {
      id: "kUpdates",
      title: "Latest Updates",
      subtitle: "Fresh From the Bakery",
      items: highlights,
      style: SectionStyle.ITEM_LIST,
    };
  })();

  return [
    hot_updates,
    admin_recs,
    recently_added,
    hot_weekly,
    hot_monthly,
    hot_total,
    latest_updates,
  ];
}

async function buildHotUpdatesPage(): Promise<PageSection[]> {
  const CLIENT = new NetworkClient();

  const { data } = await CLIENT.get(HOST_URL + "/hot-updates");
  const $ = load(data);
  const UPDATES_ELEMENT_SELECTOR =
    "body > main > section:nth-of-type(1) > section  article.md\\:hidden";
  const items = $(UPDATES_ELEMENT_SELECTOR).toArray();
  const highlights: Highlight[] = items.map((item) => {
    const el = $(item);
    const title = $("div:nth-of-type(2) > a > div.font-semibold", el)
      .text()
      .trim();
    const cover = $("img", el).attr("src") ?? "";
    const id =
      $("div:nth-of-type(1) > a", el).attr("href")?.split("/").at(-2) ?? "";
    return {
      id,
      title,
      cover,
    };
  });

  return [
    {
      id: "kHotUpdates",
      title: "Hot Updates",
      items: highlights,
      style: SectionStyle.STANDARD_GRID,
    },
  ];
}
