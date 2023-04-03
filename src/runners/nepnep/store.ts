import { NEPNEP_DOMAINS } from "./constants";

export class Store {
  private store = new ObjectStore();

  async host() {
    const value = await this.store.string("n_host");
    if (typeof value !== "string") return NEPNEP_DOMAINS[0].url;
    const host =
      NEPNEP_DOMAINS.find((v) => v.id === value) ?? NEPNEP_DOMAINS[0];
    return host.url;
  }
}
