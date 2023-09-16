import { MimasRecommendation } from "../utils";

export async function getMimasRecommendations(
  id: string
): Promise<{ recs: MimasRecommendation[]; target: MimasRecommendation }> {
  const MIMAS_URL = "https://mimas.mantton.com";
  const client = new NetworkClient();
  const response = await client.get(
    `${MIMAS_URL}/similar/org.mangadex/${id}?page=1`
  );
  const data = JSON.parse(response.data);
  return {
    recs: data.results,
    target: data.target,
  };
}

export const convertMimasRec = ({
  contentId: id,
  title,
  coverImage: cover,
}: MimasRecommendation) => ({
  id,
  title,
  cover,
});
