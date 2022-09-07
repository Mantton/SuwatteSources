import { Preference, PreferenceGroup, PreferenceType } from "@suwatte/daisuke";
import { capitalize } from "lodash";
import { languages } from "./utils";

export const getPreferenceList = (): PreferenceGroup[] => {
  const groups: PreferenceGroup[] = [];

  // Language
  const language: Preference = {
    key: "lang",
    label: "Content Language",
    type: PreferenceType.multiSelect,
    defaultValue: "en",
    options: languages.map((v) => ({
      label: v.label,
      value: v.id,
    })),
  };

  groups.push({
    id: "language",
    children: [language],
  });

  // Data Saver
  const dataSaver: Preference = {
    key: "data_saver",
    label: "DataSaver Mode",
    type: PreferenceType.toggle,
    defaultValue: "false",
  };

  // Cover Quality
  const coverQuality: Preference = {
    key: "cover_quality",
    label: "Cover/Thumbnail Quality",
    defaultValue: "medium",
    type: PreferenceType.select,
    options: [
      {
        label: "Original",
        value: "original",
      },
      {
        label: "Medium",
        value: "medium",
      },
      {
        label: "Low",
        value: "low",
      },
    ],
  };

  const imageGroup: PreferenceGroup = {
    id: "group_1",
    header: "Image Preferences",
    children: [coverQuality, dataSaver],
  };

  groups.push(imageGroup);

  const ratings = ["safe", "suggestive", "erotica", "pornographic"];
  const epCR: Preference = {
    key: "explore_cr",
    label: "Content Rating",
    defaultValue: "safe, suggestive, erotica",
    type: PreferenceType.multiSelect,
    options: ratings.map((v) => ({
      label: capitalize(v),
      value: v,
    })),
  };

  const exploreGroup: PreferenceGroup = {
    id: "explore",
    header: "Explore Page",
    children: [epCR],
  };

  groups.push(exploreGroup);

  // TODO: Should Show Seasonal List

  //
  const recommendations: Preference = {
    key: "mimas_recs",
    label: "Mimas Recommendations",
    type: PreferenceType.toggle,
    defaultValue: "false",
  };

  const mimasGroup: PreferenceGroup = {
    id: "mimas",
    header: "Recommendations",
    children: [recommendations],
  };

  groups.push(mimasGroup);

  return groups;
};
