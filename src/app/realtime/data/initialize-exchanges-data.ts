import { getExchangesConfig, supportedCurrencies } from "@config"
import { isExchangeActive } from "@domain/exchanges"
import { toTimestamp } from "@domain/primitives"
import { round } from "@utils"

export const initializeExchangesData = (): ExchangesData => {
  const exchanges: ExchangesData = {}
  const exchangesConfig = getExchangesConfig()

  for (const currency of supportedCurrencies) {
    if (!exchanges[currency]) exchanges[currency] = {}

    for (const exchange of exchangesConfig.filter((e) => e.quoteAlias === currency)) {
      exchanges[currency][exchange.name] = getDefaultData()
    }
  }

  return exchanges
}

const getDefaultData = () => ({
  bid: undefined,
  ask: undefined,
  timestamp: undefined,
  get active() {
    if (!this.timestamp) return false
    return isExchangeActive(toTimestamp(this.timestamp))
  },
  get mid() {
    if (this.active && this.ask && this.bid) {
      return round((this.ask + this.bid) / 2)
    }
    return NaN
  },
})
