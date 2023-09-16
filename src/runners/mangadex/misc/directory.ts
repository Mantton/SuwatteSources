import { Option } from "@suwatte/daisuke";

export async function getSearchSorters(): Promise<Option[]> {
  const data = {
    followedCount: "Popular",
    rating: "User Rating",
    createdAt: "New",
    relevance: "Relevant",
    title: "Alphabetically",
    year: "Yearly",
    updatedAt: "Last Updated",
    latestUploadedChapter: "Last Uploaded Chapter",
  };

  return Object.entries(data).map(([id, title]) => ({
    id,
    title,
  }));
}
