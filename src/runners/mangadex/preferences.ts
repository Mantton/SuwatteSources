import {
  ButtonPreference,
  MultiSelectPreference,
  PreferenceGroup,
  SelectPreference,
  StepperPreference,
  TogglePreference,
} from "@suwatte/daisuke";
import { capitalize } from "lodash";
import { Target } from ".";
import { MDStore, PREF_KEYS } from "./store";
import { languages } from "./utils";

export const getPreferenceList = (
  store: MDStore,
  ctx: Target
): PreferenceGroup[] => {
  const groups: PreferenceGroup[] = [];

  // Language
  const language = new MultiSelectPreference({
    key: PREF_KEYS.lang,
    label: "Content Language",
    options: languages.map((v) => ({
      label: v.label,
      value: v.languageCode,
    })),
    value: {
      get: async () => {
        return store.getLanguages();
      },
      set: async (v) => {
        return store.setLanguages(v);
      },
    },
  });

  groups.push({
    id: "language",
    children: [language],
  });

  // Data Saver

  const dataSaver = new TogglePreference({
    key: PREF_KEYS.dataSaver,
    label: "DataSaver Mode",
    value: {
      get: async () => {
        return store.getDSMode();
      },
      set: async (v) => {
        return store.setDSMode(v);
      },
    },
  });
  // Cover Quality

  const coverQuality = new SelectPreference({
    key: PREF_KEYS.coverQuality,
    label: "Cover/Thumbnail Quality",
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

    value: {
      get: async () => {
        return store.getCQ();
      },
      set: async (v) => {
        return store.setCoverQuality(v);
      },
    },
  });

  const imageGroup: PreferenceGroup = {
    id: "group_1",
    header: "Image Preferences",
    children: [coverQuality, dataSaver],
  };

  groups.push(imageGroup);

  const ratings = ["safe", "suggestive", "erotica", "pornographic"];

  const exploreContentRating = new MultiSelectPreference({
    key: PREF_KEYS.exploreCR,
    label: "Content Rating",
    options: ratings.map((v) => ({
      label: capitalize(v),
      value: v,
    })),
    value: {
      get: async () => {
        return store.getContentRatings();
      },
      set: async (v) => {
        return store.setContentRatings(v);
      },
    },
  });
  const showSeasonal = new TogglePreference({
    key: PREF_KEYS.showSeasonal,
    label: "Show Seasonal Lists",
    value: {
      get: async () => {
        return store.getSeasonal();
      },
      set: async (v) => {
        return store.setSeasonal(v);
      },
    },
  });
  const exploreGroup: PreferenceGroup = {
    id: "explore",
    header: "Explore Page",
    children: [exploreContentRating, showSeasonal],
  };

  groups.push(exploreGroup);

  //
  const mimasEnabled = new TogglePreference({
    key: PREF_KEYS.mimasEnabled,
    label: "Enabled",
    value: {
      get: async () => {
        return store.getMimasEnabled();
      },
      set: async (v) => {
        return store.setMimasEnabled(v);
      },
    },
  });
  const recommendationsCount = new StepperPreference({
    key: PREF_KEYS.mimasLimit,

    label: "Limit",

    maxValue: 10,
    value: {
      get: async () => {
        return store.getMimasLimit();
      },
      set: async (v) => {
        return store.setMimasLimit(v);
      },
    },
  });

  const clearMimas = new ButtonPreference({
    isDestructive: true,
    systemImage: "trash",
    label: "Clear Recommendations",
    key: "mimas_clear",
    action: store.clearMimasTargets,
  });
  const mimasGroup: PreferenceGroup = {
    id: "mimas",
    header: "Mimas Recommendations",
    children: [mimasEnabled, recommendationsCount, clearMimas],
    footer: "For more info, visit https://github.com/Mantton/SimilarManga",
  };

  groups.push(mimasGroup);

  // Auth Group
  const clearTokens = new ButtonPreference({
    isDestructive: true,
    systemImage: "trash",
    label: "Force Sign Out",
    key: "force_sign_out",
    action: ctx.clearTokens,
  });
  const authGroup: PreferenceGroup = {
    id: "auth",
    header: "Authentication",
    children: [clearTokens],
  };

  groups.push(authGroup);
  return groups;
};
