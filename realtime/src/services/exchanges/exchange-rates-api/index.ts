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

export const ExchangeRatesAPIExchangeService = async ({
  base,
  quote,
  config,
}: ExchangeRatesAPIExchangeServiceArgs): Promise<
  IExchangeService | ExchangeServiceError
> => {
  if (!config || !config.apiKey) return new InvalidExchangeConfigError()

  const { baseUrl, apiKey, timeout, cacheSeconds, ...params } = config

  const url = baseUrl || "https://api.exchangeratesapi.io/v1"
  const cacheKey = `${CacheKeys.CurrentTicker}:exchangeratesapi:${base}:${quote}`
  const cacheTtlSecs = Number(cacheSeconds)

  const getCachedRate = async (): Promise<number | null> => {
    const cachedTicker = await LocalCacheService().get<number>(cacheKey)
    if (cachedTicker instanceof Error) return null
    return cachedTicker
  }

  const fetchTicker = async (): Promise<Ticker | ServiceError> => {
    // We cant use response.data.timestamp * 1000 because
    // ExchangeRatesAPI does not behave like a bitcoin exchange
    const timestamp = new Date().getTime()

    try {
      const cachedRate = await getCachedRate()
      if (cachedRate) return tickerFromRaw({ rate: cachedRate, timestamp })

      const response = await axios.get(`${url}/latest`, {
        timeout: Number(timeout || 5000),
        params: {
          access_key: apiKey,
          base,
          symbols: quote,
          ...params,
        },
      })

      if (response.status > 400 || !response.data.rates || !response.data.success)
        return new UnknownExchangeServiceError()

      const rate = response.data.rates[quote]

      await LocalCacheService().set<number>({
        key: cacheKey,
        value: rate,
        ttlSecs: toSeconds(cacheTtlSecs > 0 ? cacheTtlSecs : 300),
      })

      return tickerFromRaw({ rate, timestamp })
    } catch (error) {
      baseLogger.error({ error }, "ExchangeRatesAPI unknown error")
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
