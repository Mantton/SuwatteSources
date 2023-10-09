import {
  BooleanState,
  RunnerSetupProvider,
  UITextField,
} from "@suwatte/daisuke";
import { SuwayomiStore } from "../utils/store";

export const SuwayomiSetupBuilder: RunnerSetupProvider = {
  async getSetupMenu() {
    return {
      sections: [
        {
          header: "Server URL",
          children: [
            UITextField({
              id: "host",
              title: "Server URL",
              value: (await SuwayomiStore.host()) ?? "",
            }),
          ],
        },
      ],
    };
  },

  async validateSetupForm({ host }: { host: string }) {
    await ObjectStore.set("host", host);
  },
  isRunnerSetup: async function (): Promise<BooleanState> {
    return {
      state: !!(await SuwayomiStore.host()),
    };
  },
};
