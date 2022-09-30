import { NEPNEP_DOMAINS } from "./constants";

export class Store {
  private store = new ValueStore();

  async host() {
    const value = await this.store.get("host");
    const host =
      NEPNEP_DOMAINS.find((v) => v.id === value) ?? NEPNEP_DOMAINS[0];
    return host.url;
  }
}
