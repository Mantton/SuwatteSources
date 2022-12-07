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
      value: v.languageCode,
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

  const showSeasonalLists: Preference = {
    key: "explore_show_seasonal",
    label: "Show Seasonal Lists",
    defaultValue: "true",
    type: PreferenceType.toggle,
  };
  const exploreGroup: PreferenceGroup = {
    id: "explore",
    header: "Explore Page",
    children: [epCR, showSeasonalLists],
  };

  groups.push(exploreGroup);

  // TODO: Should Show Seasonal List

  //
  const recommendations: Preference = {
    key: "mimas_recs",
    label: "Enabled",
    type: PreferenceType.toggle,
    defaultValue: "false",
  };

  const recommendationsCount: Preference = {
    key: "mimas_limit",
    label: "Limit",
    type: PreferenceType.stepper,
    defaultValue: "5",
    maxStepperValue: 10,
  };

  const mimasGroup: PreferenceGroup = {
    id: "mimas",
    header: "Mimas Recommendations",
    children: [recommendations, recommendationsCount],
    footer: "For more info, visit https://github.com/Mantton/SimilarManga",
  };

  groups.push(mimasGroup);

  return groups;
};
