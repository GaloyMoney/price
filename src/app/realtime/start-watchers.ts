import { schedule } from "node-cron"

import { getExchangesConfig, supportedCurrencies } from "@config"

import { assertUnreachable } from "@utils"
import { CcxtProviderService } from "@services/ccxt"
import { baseLogger } from "@services/logger"

import { data } from "./data"

export const startWatchers = (callback: () => void) => {
  const exchanges = getExchangesConfig()

  for (const currency of supportedCurrencies) {
    if (!data.exchanges[currency]) data.exchanges[currency] = {}
    for (const exchange of exchanges.filter((e) => e.quoteCurrency === currency)) {
      if (!data.exchanges[currency][exchange.name])
        data.exchanges[currency][exchange.name] = getDefaultExchangeData()

      schedule(exchange.cron, async () => {
        await refreshData({
          currency,
          exchange,
        })
        if (callback) {
          callback()
        }
      })
    }
  }
}

const refreshData = async ({
  currency,
  exchange,
}: {
  currency: Currency
  exchange: YamlExchangeConfig
}) => {
  const exchangeService = await getExchange(exchange)
  if (exchangeService instanceof Error) {
    baseLogger.warn(
      { error: exchangeService, exchange },
      "Error initializing exchange service",
    )
    return
  }

  const ticker = await exchangeService.fetchTicker()
  if (ticker instanceof Error) {
    baseLogger.warn({ error: ticker, exchange }, "Error fetching exchange ticker")
    return
  }

  data.exchanges[currency][exchange.name].bid = ticker.bid
  data.exchanges[currency][exchange.name].ask = ticker.ask
  data.exchanges[currency][exchange.name].timestamp = ticker.timestamp
}

const getDefaultExchangeData = () => ({
  bid: undefined,
  ask: undefined,
  timestamp: undefined,
  get active() {
    const staleAfter = 30 * 1000 // value in ms
    if (this.timestamp) {
      return new Date().getTime() - this.timestamp < staleAfter
    }
    return false
  },
  get mid() {
    if (this.active && this.ask && this.bid) {
      return (this.ask + this.bid) / 2
    }
    return NaN
  },
})

const getExchange = async (
  config: YamlExchangeConfig,
): Promise<IExchangeService | ApplicationError> => {
  const provider = config.provider as Provider
  const providerService = getProvider(provider)
  const exchangeConfig = getDefaultExchangeConfig(provider)
  return providerService.createExchangeService({
    name: config.name,
    base: config.base,
    quote: config.quote,
    exchangeConfig: config.config || exchangeConfig,
  })
}

const getDefaultExchangeConfig = (
  provider: Provider,
): { [key: string]: string | number | boolean } => {
  switch (provider) {
    case "ccxt":
      return {
        enableRateLimit: true,
        rateLimit: 2000,
        timeout: 8000,
      }
    default:
      return assertUnreachable(provider)
  }
}

const getProvider = (provider: Provider): IProviderService => {
  switch (provider) {
    case "ccxt":
      return CcxtProviderService()
    default:
      return assertUnreachable(provider)
  }
}
