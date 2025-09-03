import {
  DirectoryRequest,
  PageLink,
  PageSection,
  ResolvedPageSection,
  SectionStyle,
} from "@suwatte/daisuke";
import {
  FEATURED_LIST_ID,
  GlobalStore,
  LAST_SEASONAL_LIST_ID,
  SEASONAL_LIST_ID,
  SELF_PUBLISHED_LIST_ID,
  STAFF_PICKS_LIST_ID,
} from "../constants";
import {
  getCollectionForList,
  getMDSearchResults,
  getMDUpdates,
  getPopularNewTitles,
} from "./md";
import { getSearchSorters } from "./directory";
import { GET } from "../network";
import { parsePagedResponse } from "../parser/pagedResponse";
import moment from "moment";

export const getHomePageSections = async () => {
  const sections: PageSection[] = [
    {
      id: "featured",
      title: "Featured Titles",
      style: SectionStyle.GALLERY,
    },
    {
      id: "popular_new",
      title: "Popular New Titles",
      style: SectionStyle.INFO,
    },
    {
      id: "followedCount",
      title: "Popular Titles...",
      subtitle: "The general consensus is never wrong.",
      style: SectionStyle.INFO,
    },
    {
      id: "seasonal",
      title: "Seasonal List",
      subtitle: "Titles from the Summer 2025 anime season.",
      style: SectionStyle.GALLERY,
    },
    {
      id: "prev_seasonal",
      title: "Seasonal List",
      subtitle: "Titles from the Winter 2025 anime season.",
      style: SectionStyle.DEFAULT,
    },
    {
      id: "createdAt",
      title: "Recently Added",
      style: SectionStyle.DEFAULT,
    },
    {
      id: "rating",
      title: "Highly Rated Titles",
      subtitle: "Masterpieces",
      style: SectionStyle.INFO,
    },

    {
      id: "staff_picks",
      title: "MD Staff Picks",
      subtitle: "Curated Gems: The MD Team's Favorite Manga Selections",
      style: SectionStyle.DEFAULT,
    },
    {
      id: "self_published",
      title: "Self Published",
      style: SectionStyle.INFO,
    },
    {
      id: "added_this_week",
      title: "New This Week",
      style: SectionStyle.INFO,
    },
    {
      id: "recentlyUpdated",
      title: "Latest Updates",
      style: SectionStyle.PADDED_LIST,
    },
  ];

  return sections;
};

export const resolveHomepageSection = async (
  _link: PageLink,
  section: string
): Promise<ResolvedPageSection> => {
  switch (section) {
    case "popular_new":
      return {
        items: (await getPopularNewTitles()).results,
      };
    case "seasonal": {
      const { highlights: items, title: updatedTitle } =
        await getCollectionForList(SEASONAL_LIST_ID);
      return { items, updatedTitle };
    }

    case "prev_seasonal": {
      const { highlights: items, title: updatedTitle } =
        await getCollectionForList(LAST_SEASONAL_LIST_ID);
      return { items, updatedTitle };
    }
    case "staff_picks": {
      const { highlights: items, title: updatedTitle } =
        await getCollectionForList(STAFF_PICKS_LIST_ID);
      return { items, updatedTitle };
    }
    case "featured": {
      const { highlights: items, title: updatedTitle } =
        await getCollectionForList(FEATURED_LIST_ID);
      return { items, updatedTitle };
    }
    case "self_published": {
      const { highlights: items, title: updatedTitle } =
        await getCollectionForList(SELF_PUBLISHED_LIST_ID);
      return { items, updatedTitle };
    }
    // Get
    case "recentlyUpdated":
      return {
        items: await getMDUpdates(1),
      };
    case "added_this_week":
      let date = moment().subtract(1, "week").format("YYYY-MM-DDTHH:mm:ss");
      const location = `/manga?includes[]=cover_art&includes[]=artist&includes[]=author&order[followedCount]=desc&contentRating[]=safe&contentRating[]=suggestive&hasAvailableChapters=true&createdAtSince=${date}`;
      const response = await GET(location);
      let result = await parsePagedResponse(response);
      return { items: result.results };
    default:
      const sort = (await getSearchSorters()).find((v) => v.id === section)?.id;
      const content_ratings = await GlobalStore.getContentRatings();
      const query: DirectoryRequest = {
        page: 1,
        filters: { content_rating: { included: content_ratings } },
        ...(sort && {
          sort: {
            id: sort,
            ascending: false,
          },
        }),
      };

      const overrides = {
        limit: 20,
        getStats: ["followedCount", "rating"].includes(section),
      };
      return {
        items: (await getMDSearchResults(query, overrides)).results,
      };
  }
};
