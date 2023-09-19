import axios from "axios"

import {
  InvalidTickerError,
  ExchangeServiceError,
  UnknownExchangeServiceError,
  InvalidExchangeConfigError,
  InvalidExchangeResponseError,
} from "@domain/exchanges"
import { toPrice, toSeconds, toTimestamp } from "@domain/primitives"
import { LocalCacheService } from "@services/cache"
import { CacheKeys } from "@domain/cache"
import { baseLogger } from "@services/logger"

export const YadioExchangeService = async ({
  base,
  quote,
  config,
}: YadioExchangeServiceArgs): Promise<IExchangeService | ExchangeServiceError> => {
  if (!config) return new InvalidExchangeConfigError()

  const { baseUrl, timeout, cacheSeconds, ...params } = config

  const url = baseUrl || "https://api.yadio.io/exrates"
  const cacheKey = `${CacheKeys.CurrentTicker}:yadio:${base}:*`
  const cacheTtlSecs = Number(cacheSeconds)

  const getCachedRates = async (): Promise<YadioRates | undefined> => {
    const cachedTickers = await LocalCacheService().get<YadioRates>(cacheKey)
    if (cachedTickers instanceof Error) return undefined
    return cachedTickers
  }

  const fetchTicker = async (): Promise<Ticker | ServiceError> => {
    // We cant use response.data.response.date because
    // Yadio does not behave like a bitcoin exchange
    const timestamp = new Date().getTime()
    const baseCurrency = base.toLowerCase()

    try {
      const cachedRates = await getCachedRates()
      if (cachedRates) return tickerFromRaw({ rate: cachedRates[quote], timestamp })

      const { status, data } = await axios.get<GetYadioRatesResponse<typeof base>>(
        `${url}/${baseCurrency}`,
        {
          timeout: Number(timeout || 5000),
          params,
        },
      )

      const rates = data && data[base]
      if (status >= 400 || !isRatesObjectValid(rates))
        return new InvalidExchangeResponseError(`Invalid response. Error ${status}`)

      await LocalCacheService().set<YadioRates>({
        key: cacheKey,
        value: rates,
        ttlSecs: toSeconds(cacheTtlSecs > 0 ? cacheTtlSecs : 300),
      })

      return tickerFromRaw({ rate: rates[quote], timestamp })
    } catch (error) {
      baseLogger.error({ error }, "Yadio unknown error")
      return new UnknownExchangeServiceError(error.message || error)
    }
  }

  return { fetchTicker }
}

const isRatesObjectValid = (rates: unknown): rates is YadioRates => {
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
