import { capitalize } from "lodash";
import { PREF_KEYS } from "../store";
import { CoverQualityOptions, languages } from "../utils";
import {
  Form,
  RunnerPreferenceProvider,
  UIMultiPicker,
  UIPicker,
  UIToggle,
} from "@suwatte/daisuke";
import { GlobalStore } from "../constants";

export const MDPreferenceProvider: RunnerPreferenceProvider = {
  getPreferenceMenu: async function (): Promise<Form> {
    const languageOptions = languages.map((v) => ({
      id: v.languageCode,
      title: v.label,
    }));

    const ratingOptions = ["safe", "suggestive", "erotica", "pornographic"].map(
      (v) => ({
        title: capitalize(v),
        id: v,
      })
    );

    return {
      sections: [
        // * LANGUAGE
        {
          header: "Languages",
          children: [
            UIMultiPicker({
              id: PREF_KEYS.lang,
              title: "Content Languages",
              options: languageOptions,
              value: await GlobalStore.getLanguages(),
              didChange: GlobalStore.setLanguages,
            }),
          ],
        },
        // * IMAGE
        {
          header: "Image Options",
          children: [
            UIToggle({
              id: PREF_KEYS.dataSaver,
              title: "Data Saver Mode",
              value: await GlobalStore.getDSMode(),
              didChange: GlobalStore.setDSMode,
            }),
            UIPicker({
              id: PREF_KEYS.coverQuality,
              title: "Cover/Thumbnail Quality",
              options: CoverQualityOptions,
              value: await GlobalStore.getCoverQuality(),
              didChange: GlobalStore.setCoverQuality,
            }),
          ],
        },
        // * HOMEPAGE
        {
          header: "Explore Page",
          children: [
            UIMultiPicker({
              id: PREF_KEYS.exploreCR,
              title: "Content Rating",
              options: ratingOptions,
              value: await GlobalStore.getContentRatings(),
              didChange: GlobalStore.setContentRatings,
            }),
          ],
        },
      ],
    };
  },
};
