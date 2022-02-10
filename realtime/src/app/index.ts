import { wrapAsyncToRunInSpan } from "@services/tracing"

import * as RealtimeMod from "./realtime"

const allFunctions = {
  Realtime: { ...RealtimeMod },
}

for (const subModule in allFunctions) {
  for (const fn in allFunctions[subModule]) {
    allFunctions[subModule][fn] = wrapAsyncToRunInSpan({
      namespace: `app.${subModule.toLowerCase()}`,
      fn: allFunctions[subModule][fn],
    })
  }
}

export * from "./errors"
export const { Realtime } = allFunctions
