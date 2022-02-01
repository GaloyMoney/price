import { defaultBaseCurrency } from "@config"
import { toCurrency } from "@domain/primitives"
import { CcxtProviderService } from "@services/ccxt"
import { ExchangeRatesAPIProviderService } from "@services/exchange-rates-api"
import { baseLogger } from "@services/logger"
import { assertUnreachable } from "@utils"

import { realTimeData } from "./data"

export const refreshRealtimeData = async ({
  currency,
  exchange,
}: {
  currency: Currency
  exchange: ExchangeConfig
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

  let rate = 1
  if (defaultBaseCurrency !== exchange.base) {
    rate = realTimeData.mid(toCurrency(exchange.base))
  }
  realTimeData.exchanges[currency][exchange.name].bid = ticker.bid * rate
  realTimeData.exchanges[currency][exchange.name].ask = ticker.ask * rate
  realTimeData.exchanges[currency][exchange.name].timestamp = ticker.timestamp
  return ticker
}

const getExchange = async (
  config: ExchangeConfig,
): Promise<IExchangeService | ApplicationError> => {
  const provider = config.provider as Provider
  const providerService = getProvider(provider)
  const exchangeConfig = getDefaultExchangeConfig(provider)
  return providerService.createExchangeService({
    name: config.name,
    base: config.base,
    quote: config.quote,
    exchangeConfig: { ...exchangeConfig, ...config.config },
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
    case "exchangeratesapi":
      return {
        timeout: 5000,
      }
    default:
      return assertUnreachable(provider)
  }
}

const getProvider = (provider: Provider): IProviderService => {
  switch (provider) {
    case "ccxt":
      return CcxtProviderService()
    case "exchangeratesapi":
      return ExchangeRatesAPIProviderService()
    default:
      return assertUnreachable(provider)
  }
}
