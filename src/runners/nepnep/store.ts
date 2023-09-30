import { NEPNEP_DOMAINS } from "./constants";

export class Store {
  async host() {
    const value = await ObjectStore.string("n_host");
    if (typeof value !== "string") return NEPNEP_DOMAINS[0].url;
    const host =
      NEPNEP_DOMAINS.find((v) => v.id === value) ?? NEPNEP_DOMAINS[0];
    return host.url;
  }

  async hostName() {
    const value = await ObjectStore.string("n_host");
    if (typeof value !== "string") return NEPNEP_DOMAINS[0].url;
    const host =
      NEPNEP_DOMAINS.find((v) => v.id === value) ?? NEPNEP_DOMAINS[0];
    return host.name;
  }
}
