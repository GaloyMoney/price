import { wrapAsyncToRunInSpan } from "@services/tracing";

import * as HistoryMod from "./history";

const allFunctions = {
  History: { ...HistoryMod },
};

for (const subModule in allFunctions) {
  for (const fn in allFunctions[subModule]) {
    allFunctions[subModule][fn] = wrapAsyncToRunInSpan({
      namespace: `app.${subModule.toLowerCase()}`,
      fn: allFunctions[subModule][fn],
    });
  }
}

export const { History } = allFunctions;
