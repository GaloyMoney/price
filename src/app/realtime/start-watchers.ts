import { schedule } from "node-cron"

import { getExchangesConfig, supportedCurrencies } from "@config"

import { refreshRealtimeData } from "./data"

export const startWatchers = (callback?: RefreshDataCallback) => {
  const exchanges = getExchangesConfig()

  for (const currency of supportedCurrencies) {
    const supportedExchanges = exchanges.filter((e) => e.quoteAlias === currency)
    for (const exchange of supportedExchanges) {
      schedule(exchange.cron, async () => {
        const ticker = await refreshRealtimeData({ currency, exchange })
        if (!callback) return

        if (ticker instanceof Error) {
          callback(ticker)
          return
        }

        callback(null, { exchangeName: exchange.name, ticker })
      })
    }
  }
}
