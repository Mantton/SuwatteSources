import {
  PageLink,
  PageLinkResolver,
  PageSection,
  ResolvedPageSection,
} from "@suwatte/daisuke";
import { getHomePageSections, resolveHomepageSection } from "../misc/homepage";

export const MDPageLinkResolver: PageLinkResolver = {
  getSectionsForPage: function ({ id }: PageLink): Promise<PageSection[]> {
    if (id === "home") return getHomePageSections();
    throw new Error(`Unknown Page ${id}`);
  },
  resolvePageSection: function (
    link: PageLink,
    sectionID: string
  ): Promise<ResolvedPageSection> {
    if (link.id === "home") return resolveHomepageSection(link, sectionID);
    throw new Error(`Unknown Page ${link.id}`);
  },
};
