import { PreferenceGroup, PreferenceType } from "@suwatte/daisuke";
import { NEPNEP_DOMAINS } from "./constants";

export const preferences: PreferenceGroup[] = [
  {
    id: "general",
    header: "General",
    children: [
      {
        key: "host",
        label: "NepNep Site",
        defaultValue: NEPNEP_DOMAINS[0].id,
        type: PreferenceType.select,
        options: NEPNEP_DOMAINS.map((v) => ({ label: v.name, value: v.id })),
      },
    ],
  },
];
