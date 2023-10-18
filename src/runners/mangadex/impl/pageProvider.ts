import { Generate, PageLinkLabel, PageLinkProvider } from "@suwatte/daisuke";
import { MDBasicAuthProvider } from "./auth";
import { GET } from "../network";

export const MDPageProvider: PageLinkProvider = {
  async getLibraryPageLinks() {
    const user = await MDBasicAuthProvider.getAuthenticatedUser()
      .then((v) => v)
      .catch((err) => {
        console.log(err);
        return null;
      });
    if (!user) return [];
    const lists: {
      data: { id: string; attributes: { name: string; visibility: string } }[];
    } = await GET("/user/list?limit=100");
    return lists.data.map((v) =>
      Generate<PageLinkLabel>({
        title: v.attributes.name,
        subtitle: v.attributes.visibility === "private" ? "Private" : "",
        link: {
          request: {
            page: 1,
            context: {
              listId: v.id,
            },
          },
        },
      })
    );
  },
};
