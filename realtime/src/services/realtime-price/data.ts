import { getExchangesConfig, supportedCurrencies } from "@config"
import { isExchangeActive } from "@domain/exchanges"
import { toTimestamp } from "@domain/primitives"
import { isDefined, median, round } from "@utils"

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

const initializeExchangesData = (): ExchangesData => {
  const exchanges: ExchangesData = {}
  const exchangesConfig = getExchangesConfig()

  for (const currency of supportedCurrencies) {
    if (!exchanges[currency.code]) exchanges[currency.code] = {}

    for (const exchange of exchangesConfig.filter(
      (e) => e.quoteAlias === currency.code,
    )) {
      exchanges[currency.code][exchange.name] = getDefaultData()
    }
  }

  return exchanges
}

export const realTimeData: Data = {
  exchanges: initializeExchangesData(),
  totalActive(currency: CurrencyCode) {
    if (!this.exchanges[currency]) return 0
    return Object.values(this.exchanges[currency]).reduce(
      (total, { active }) => total + (active ? 1 : 0),
      0,
    )
  },
  bids(currency: CurrencyCode) {
    if (!this.exchanges[currency]) return []
    return Object.values(this.exchanges[currency])
      .filter((e) => e.active)
      .map<number | undefined>((e) => e.bid)
      .filter(isDefined)
  },
  asks(currency: CurrencyCode) {
    if (!this.exchanges[currency]) return []
    return Object.values(this.exchanges[currency])
      .filter((e) => e.active)
      .map<number | undefined>((e) => e.ask)
      .filter(isDefined)
  },
  mid(currency: CurrencyCode) {
    const ask = median(this.asks(currency))
    const bid = median(this.bids(currency))
    return round((ask + bid) / 2)
  },
  spread(currency: CurrencyCode) {
    const highAsk = Math.max(...this.asks(currency))
    const lowBid = Math.min(...this.bids(currency))
    const spread = (highAsk - lowBid) / lowBid
    return spread
  },
}
