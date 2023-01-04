import axios from "axios"

import {
  InvalidTickerError,
  ExchangeServiceError,
  UnknownExchangeServiceError,
  InvalidExchangeConfigError,
} from "@domain/exchanges"
import { toPrice, toSeconds, toTimestamp } from "@domain/primitives"
import { LocalCacheService } from "@services/cache"
import { CacheKeys } from "@domain/cache"
import { baseLogger } from "@services/logger"

export const CurrencyBeaconExchangeService = async ({
  base,
  quote,
  config,
}: CurrencyBeaconExchangeServiceArgs): Promise<
  IExchangeService | ExchangeServiceError
> => {
  if (!config || !config.apiKey) return new InvalidExchangeConfigError()

  const { baseUrl, apiKey, timeout, cacheSeconds, ...params } = config

  const url = baseUrl || "https://api.currencybeacon.com/v1"
  const cacheKey = `${CacheKeys.CurrentTicker}:currencybeacon:${base}:*`

  const getCachedRates = async (): Promise<CurrencyBeaconRates | undefined> => {
    const cachedTickers = await LocalCacheService().get<CurrencyBeaconRates>(cacheKey)
    if (cachedTickers instanceof Error) return undefined
    return cachedTickers
  }

  const fetchTicker = async (): Promise<Ticker | ServiceError> => {
    // We cant use response.data.response.date because
    // CurrencyBeacon does not behave like a bitcoin exchange
    const timestamp = new Date().getTime()

    try {
      const cachedRates = await getCachedRates()
      if (cachedRates) return tickerFromRaw({ rate: cachedRates[quote], timestamp })

      const response = await axios.get(`${url}/latest`, {
        timeout: Number(timeout || 5000),
        params: {
          api_key: apiKey,
          base,
          ...params,
        },
      })
      if (
        response.status > 400 ||
        !response.data.response ||
        !response.data.response.rates ||
        !Object.keys(response.data.response.rates).length
      )
        return new UnknownExchangeServiceError(
          `Invalid response. Error ${response.status}`,
        )

      const rates = response.data.response.rates

      await LocalCacheService().set<CurrencyBeaconRates>({
        key: cacheKey,
        value: rates,
        ttlSecs: toSeconds(cacheSeconds > 0 ? Number(cacheSeconds) : 300),
      })

      return tickerFromRaw({ rate: rates[quote], timestamp })
    } catch (error) {
      baseLogger.error({ error }, "CurrencyBeacon unknown error")
      return new UnknownExchangeServiceError(error)
    }
  }

  return { fetchTicker }
}

const tickerFromRaw = ({
  rate,
  timestamp,
}: {
  rate: number
  timestamp: number
}): Ticker | InvalidTickerError => {
  if (rate > 0 && timestamp > 0) {
    return {
      bid: toPrice(rate),
      ask: toPrice(rate),
      timestamp: toTimestamp(timestamp),
    }
  }

  return new InvalidTickerError()
}
