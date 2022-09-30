import {
  CollectionExcerpt,
  Content,
  ExploreCollection,
} from "@suwatte/daisuke";
import { Parser } from "./parser";
import { Context } from "./types";
import { AJAXDirectoryRequest } from "./utils";

export class Controller {
  context: Context;
  client = new NetworkClient();
  parser = new Parser();
  constructor(ctx: Context) {
    this.context = ctx;
  }

  // Resolve Explore Collection
  async getCollection(excerpt: CollectionExcerpt): Promise<ExploreCollection> {
    const request = AJAXDirectoryRequest(this.context, {
      sort: { id: excerpt.id, label: "" },
    });
    console.log(request);
    const response = await this.client.request(request);
    const highlights = this.parser.AJAXResponse(this.context, response.data);

    return { ...excerpt, highlights };
  }
  // Get Content
  async getContent(id: string): Promise<Content> {
    const response = await this.client.get(
      `${this.context.baseUrl}/${this.context.contentPath}/${id}/`
    );

    return this.parser.content(this.context, response.data, id);
  }
}
