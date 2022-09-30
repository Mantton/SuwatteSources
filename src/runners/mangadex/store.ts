import { getURLSuffixFor } from "./utils";

export class MDStore {
  store: ValueStore;
  constructor(store: ValueStore) {
    this.store = store;
  }

  async getSeasonal() {
    const value = await this.store.get("explore_show_seasonal");
    if (value === "true") {
      return true;
    }
    return false;
  }
  async getContentRatings() {
    const ratings = await this.store.get("explore_cr");
    return ratings?.split(", ") ?? ["safe", "suggestive", "erotica"];
  }
  async getDSMode() {
    const value = await this.store.get("data_saver");

    if (value === "true") {
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

  // Recommendations
  async getMimasEnabled() {
    const value = await this.store.get("mimas_recs");

    if ((value && value == "true") || value == "1") {
      return true;
    }
    return false;
  }

  async getMimasTargets() {
    const value = await this.store.get("mimas_targets");
    return value?.split(", ") ?? [];
  }

  async getMimasLimit() {
    const value = (await this.store.get("mimas_limit")) ?? "5";
    return parseInt(value) ?? 5;
  }

  async saveToMimasTargets(id: string) {
    const limit = await this.getMimasLimit();
    const targets = await this.getMimasTargets();
    targets.push(id);
    const newTargets = Array.from(new Set(targets))
      .filter((v) => !!v.trim())
      .slice(-limit);

    const value = newTargets.join(", ");
    await this.store.set("mimas_targets", value);
  }

  async clearMimasTargets() {
    await this.store.remove("mimas_targets");
  }
}
