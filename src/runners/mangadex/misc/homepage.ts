import {
  DirectoryRequest,
  PageLink,
  PageSection,
  ResolvedPageSection,
  SectionStyle,
} from "@suwatte/daisuke";
import {
  GlobalStore,
  LAST_SEASONAL_LIST_ID,
  SEASONAL_LIST_ID,
  STAFF_PICKS_LIST_ID,
} from "../constants";
import {
  getCollectionForList,
  getMDSearchResults,
  getMDUpdates,
  getPopularNewTitles,
} from "./md";
import { sample } from "lodash";
import { getSearchSorters } from "./directory";
import { convertMimasRec, getMimasRecommendations } from "./mimas";

export const getHomePageSections = async () => {
  const shuffle = <T>(array: T[]) => {
    let currentIndex = array.length,
      temporaryValue,
      randomIndex;

    // While there remain elements to shuffle...
    while (0 !== currentIndex) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;

      // And swap it with the current element.
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  };
  const injectMimasRecs = await GlobalStore.getMimasEnabled();
  const injectSeasonal = await GlobalStore.getSeasonal();
  const sections: PageSection[] = [
    {
      id: "followedCount",
      title: "Popular Titles...",
      subtitle: "The general consensus is never wrong.",
      style: SectionStyle.INFO,
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
      id: "relevance",
      title: "Relevant Titles",
      subtitle: "This sort option makes no fucking sense.",
      style: SectionStyle.DEFAULT,
    },
    {
      id: "popular_new",
      title: "Popular New Titles",
      style: SectionStyle.GALLERY,
    },
    {
      id: "staff_picks",
      title: "Staff Picks",
      subtitle: "Curated Gems: The MD Team's Favorite Manga Selections",
      style: SectionStyle.GALLERY,
    },
  ];

  // Seasonal Lists
  if (injectSeasonal) {
    sections.push(
      ...[
        {
          id: "seasonal",
          title: "Seasonal List",
          subtitle: "Titles from this anime season.",
          style: SectionStyle.GALLERY,
        },
        {
          id: "prev_seasonal",
          title: "Previous Seasonal List",
          subtitle: "Titles from the previous anime season.",
          style: SectionStyle.GALLERY,
        },
      ]
    );
  }

  // // Mimas Recommendations
  // if (injectMimasRecs) {
  //   const ids = await GlobalStore.getMimasTargets();

  //   const recommended = ids.map(
  //     (v): PageSection => ({
  //       id: `mimas|${v}`,
  //       title: "Recommendation",
  //       style: SectionStyle.DEFAULT,
  //     })
  //   );

  //   sections.push(...recommended);
  // }

  const shuffled = shuffle(sections);
  shuffled.push({
    id: "recentlyUpdated",
    title: "Latest Updates",
    style: SectionStyle.PADDED_LIST,
  });
  return shuffled;
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
    // Get
    case "recentlyUpdated":
      return {
        items: await getMDUpdates(1),
      };
    default:
      if (section.includes("mimas")) {
        const id = section.split("|").pop();
        if (!id) throw new Error("Improper Config");
        const name =
          sample(["More Like", "Because you read", "Similar to"]) ??
          "More Like";

        const { target, recs } = await getMimasRecommendations(id);
        return {
          items: [convertMimasRec(target), ...recs.map(convertMimasRec)],
          updatedTitle: `${name} "${target.title}"`,
        };
      } else {
        const sort = (await getSearchSorters()).find(
          (v) => v.id === section
        )?.id;
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
  }
};
