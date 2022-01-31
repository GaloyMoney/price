import { CcxtProviderService } from "@services/ccxt"
import { baseLogger } from "@services/logger"
import { assertUnreachable } from "@utils"

import { realTimeData } from "./data"

export const refreshRealtimeData = async ({
  currency,
  exchange,
}: {
  currency: Currency
  exchange: YamlExchangeConfig
}): Promise<Ticker | ApplicationError> => {
  const exchangeService = await getExchange(exchange)
  if (exchangeService instanceof Error) {
    baseLogger.warn(
      { error: exchangeService, exchange },
      "Error initializing exchange service",
    )
    return exchangeService
  }

  const ticker = await exchangeService.fetchTicker()
  if (ticker instanceof Error) {
    baseLogger.warn({ error: ticker, exchange }, "Error fetching exchange ticker")
    return ticker
  }

  realTimeData.exchanges[currency][exchange.name].bid = ticker.bid
  realTimeData.exchanges[currency][exchange.name].ask = ticker.ask
  realTimeData.exchanges[currency][exchange.name].timestamp = ticker.timestamp

  return ticker
}

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
