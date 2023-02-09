import { CollectionExcerpt, CollectionStyle, Property } from "@suwatte/daisuke";
import { range } from "lodash";

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

const GENRE_LIST = [
  "Action/Adventure",
  "Anthology",
  "Anthropomorphic",
  "Biography",
  "Children's",
  "Comedy",
  "Crime",
  "Drama",
  "Fantasy",
  "Gore",
  "Graphic Novels",
  "Historical",
  "Holiday",
  "Horror",
  "Leading Ladies",
  "LGBTQ",
  "Literature",
  "Manga",
  "Martial Arts",
  "Mature",
  "Military",
  "Movies & TV",
  "Music",
  "Mystery",
  "Mythology",
  "Non-Fiction",
  "Original Series",
  "Political",
  "Post-Apocalyptic",
  "Pulp",
  "Religious",
  "Risque",
  "Robots, Cyborgs & Mecha",
  "Romance",
  "School Life",
  "Science Fiction",
  "Slice of Life",
  "Spy",
  "Steampunk",
  "Superhero",
  "Supernatural/Occult",
  "Suspense",
  "Vampires",
  "Video Games",
  "Web Comics",
  "Werewolves",
  "Western",
  "Zombies",
];
const PUBLISHER_LIST = [
  "Action Lab",
  "Aftershock",
  "AHOY",
  "American Mythology",
  "Aspen",
  "Avatar Press",
  "AWA Studios",
  "Black Mask",
  "BOOM! Studios",
  "Dark Horse",
  "DC",
  "Death Rattle",
  "Dynamite",
  "IDW",
  "Image",
  "Magnetic Press",
  "Marvel",
  "MAX",
  "Titan",
  "Ubiworkshop",
  "Valiant",
  "Vault",
  "Vertigo",
  "Wildstorm",
  "Zenescope",
];

const YEAR_LIST = range(1963, 2023);

export const properties = () => {
  const properties: Property[] = [];

  // Genres
  properties.push({
    id: "genres",
    label: "Genres",
    tags: GENRE_LIST.map((v) => ({
      id: `genre:${v}`,
      label: v,
      adultContent: false,
    })),
  });

  // Publishers
  properties.push({
    id: "publishers",
    label: "Publishers",
    tags: PUBLISHER_LIST.map((v) => ({
      id: `publisher:${v}`,
      label: v,
      adultContent: false,
    })),
  });

  // Years
  properties.push({
    id: "years",
    label: "Years",
    tags: YEAR_LIST.map((v) => ({
      id: `year:${v}`,
      label: v.toString(),
      adultContent: false,
    })),
  });
  return properties;
};
