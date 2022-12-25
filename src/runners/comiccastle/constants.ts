import { CollectionExcerpt, CollectionStyle } from "@suwatte/daisuke";

export const EXCERPTS: CollectionExcerpt[] = [
  {
    id: "popular_today",
    title: "Popular Today",
    style: CollectionStyle.GALLERY,
  },
  {
    id: "ymal",
    title: "You May Like",
    style: CollectionStyle.NORMAL,
  },
  {
    id: "ongoing_updates",
    title: "Ongoing Updates",
    style: CollectionStyle.INFO,
  },
  {
    id: "c_a_o",
    title: "Completed & One-shot",
    style: CollectionStyle.NORMAL,
  },
  {
    id: "most_popular",
    title: "Most Popular Titles",
    style: CollectionStyle.INFO,
  },
  {
    id: "latest",
    title: "Latest Updates",
    style: CollectionStyle.UPDATE_LIST,
  },
];
