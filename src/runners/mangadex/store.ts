import { getURLSuffixFor } from "./utils";

export class MDStore {
  store: ValueStore;
  constructor(store: ValueStore) {
    this.store = store;
  }

  async getContentRatings() {
    const ratings = await this.store.get("explore_cr");
    return ratings?.split(", ") ?? ["safe", "suggestive", "erotica"];
  }
  async getDSMode() {
    const value = await this.store.get("data_saver");

    if ((value && value == "true") || value == "1") {
      return true;
    }
    return false;
  }

  async getCoverQuality() {
    const value = await this.store.get("cover_quality");
    return getURLSuffixFor(value ?? "medium");
  }

  async getLanguages(): Promise<string[]> {
    const value = await this.store.get("lang");
    return value?.split(", ") ?? ["en"];
  }
}
