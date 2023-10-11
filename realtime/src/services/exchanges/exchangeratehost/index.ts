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

export const ExchangeRateHostService = async ({
  base,
  quote,
  config,
}: ExchangeRateHostServiceArgs): Promise<IExchangeService | ExchangeServiceError> => {
  if (!config || !config.apiKey) return new InvalidExchangeConfigError()

  const { baseUrl, apiKey, timeout, cacheSeconds, ...params } = config

  const url = baseUrl || "https://api.exchangerate.host"
  const cacheKey = `${CacheKeys.CurrentTicker}:exchangeratehost:${base}:*`
  const cacheTtlSecs = Number(cacheSeconds)
  const cacheKeyStatus = `${cacheKey}:status`
  const symbol = `${base}${quote}`

  const getCachedRates = async (): Promise<ExchangeRateHostRates | undefined> => {
    const cachedTickers = await LocalCacheService().get<ExchangeRateHostRates>(cacheKey)
    if (cachedTickers instanceof Error) return undefined
    return cachedTickers
  }

  const getLastRequestStatus = async (): Promise<number> => {
    const status = await LocalCacheService().get<number>(cacheKeyStatus)
    if (status instanceof Error) return 0
    return status
  }

  const fetchTicker = async (): Promise<Ticker | ServiceError> => {
    try {
      const cachedRates = await getCachedRates()
      if (cachedRates)
        return tickerFromRaw({
          rate: cachedRates[symbol],
          timestamp: new Date().getTime(),
        })

      // avoid cloudflare ban if rate limit is reached
      const lastCachedStatus = await getLastRequestStatus()
      if (lastCachedStatus >= 400)
        return new UnknownExchangeServiceError(
          `Invalid response. Error ${lastCachedStatus}`,
        )

      const { status, data } = await axios.get<GetExchangeRateHostRatesResponse>(
        `${url}/live`,
        {
          timeout: Number(timeout || 5000),
          params: {
            source: base,
            access_key: apiKey,
            ...params,
          },
        },
      )

      const { success, quotes, timestamp } = data
      if (!success || status >= 400 || !isRatesObjectValid(quotes)) {
        await LocalCacheService().set<number>({
          key: cacheKeyStatus,
          value: status,
          ttlSecs: toSeconds(cacheTtlSecs > 0 ? cacheTtlSecs : 300),
        })
        return new UnknownExchangeServiceError(`Invalid response. Error ${status}`)
      }

      await LocalCacheService().set<ExchangeRateHostRates>({
        key: cacheKey,
        value: quotes,
        ttlSecs: toSeconds(cacheTtlSecs > 0 ? cacheTtlSecs : 300),
      })

      return tickerFromRaw({ rate: quotes[symbol], timestamp })
    } catch (error) {
      baseLogger.error({ error }, "ExchangeRateHost unknown error")
      return new UnknownExchangeServiceError(error.message || error)
    }
  }

  return { fetchTicker }
}

const isRatesObjectValid = (rates: unknown): rates is ExchangeRateHostRates => {
  if (!rates || typeof rates !== "object") return false

  let keyCount = 0
  for (const key in rates) {
    if (typeof key !== "string" || typeof rates[key] !== "number") {
      return false
    }
    keyCount++
  }

  return !!keyCount
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
