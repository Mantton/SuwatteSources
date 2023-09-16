import { capitalize } from "lodash";
import { PREF_KEYS } from "../store";
import { CoverQualityOptions, languages } from "../utils";
import {
  Form,
  RunnerPreferenceProvider,
  UIButton,
  UIMultiPicker,
  UIPicker,
  UIStepper,
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
            UIToggle({
              id: PREF_KEYS.showSeasonal,
              title: "Show Seasonal Lists",
              value: await GlobalStore.getSeasonal(),
              didChange: GlobalStore.setSeasonal,
            }),
          ],
        },
        // * MIMAS
        {
          header: "Mimas Recommendations",
          children: [
            UIToggle({
              id: PREF_KEYS.mimasEnabled,
              title: "Enable Recommendations",
              value: await GlobalStore.getMimasEnabled(),
              didChange: GlobalStore.setMimasEnabled,
            }),
            UIStepper({
              id: PREF_KEYS.mimasLimit,
              title: "Limit",
              upperBound: 10,
              value: await GlobalStore.getMimasLimit(),
              didChange: GlobalStore.setMimasLimit,
            }),
            UIButton({
              id: "mimas_clear",
              title: "Clear Current Recommendations",
              isDestructive: true,
              systemImage: "trash",
              action: GlobalStore.clearMimasTargets,
            }),
          ],
        },
        // * AUTH
        {
          header: "Authentication",
          children: [
            UIButton({
              id: "force_sign_out",
              title: "Force Sign Out",
              isDestructive: true,
              async action() {
                //
              },
            }),
          ],
        },
      ],
    };
  },
};
