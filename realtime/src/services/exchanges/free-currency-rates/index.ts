import axios, { AxiosResponse } from "axios"

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

export const FreeCurrencyRatesExchangeService = async ({
  base,
  quote,
  config,
}: FreeCurrencyRatesExchangeServiceArgs): Promise<
  IExchangeService | ExchangeServiceError
> => {
  if (!config) return new InvalidExchangeConfigError()

  const { baseUrl, fallbackUrl, timeout, cacheSeconds } = config

  const url =
    baseUrl || "https://cdn.jsdelivr.net/gh/fawazahmed0/currency-api@1/latest/currencies/"
  const cacheKey = `${CacheKeys.CurrentTicker}:freecurrencyrates:${base}:*`

  const getCachedRates = async (): Promise<FreeCurrencyRatesRates | null> => {
    const cachedTickers = await LocalCacheService().get<FreeCurrencyRatesRates>(cacheKey)
    if (cachedTickers instanceof Error) return null
    return cachedTickers
  }

  const fetchTicker = async (): Promise<Ticker | ServiceError> => {
    // We cant use response.data.date because
    // FreeCurrencyRates does not behave like a bitcoin exchange
    const timestamp = new Date().getTime()
    const baseCurrency = base.toLowerCase()
    const quoteCurrency = quote.toLowerCase()

    try {
      const cachedRates = await getCachedRates()
      if (cachedRates)
        return tickerFromRaw({ rate: cachedRates[quoteCurrency], timestamp })
      const urls = [
        `${url}/${baseCurrency}.min.json`,
        `${url}/${baseCurrency}.json`,
        `${fallbackUrl}/${baseCurrency}.min.json`,
        `${fallbackUrl}/${baseCurrency}.json`,
      ]
      const params = {
        timeout: Number(timeout || 5000),
      }

      const response = await getWithFallback({ urls, params })
      if (response instanceof Error) return response

      if (
        !response ||
        !response[baseCurrency] ||
        !Object.keys(response[baseCurrency]).length
      )
        return new UnknownExchangeServiceError("Invalid response.")

      const rates = response[baseCurrency]

      await LocalCacheService().set<FreeCurrencyRatesRates>({
        key: cacheKey,
        value: rates,
        ttlSecs: toSeconds(cacheSeconds > 0 ? Number(cacheSeconds) : 300),
      })

      return tickerFromRaw({ rate: rates[quoteCurrency], timestamp })
    } catch (error) {
      baseLogger.error({ error }, "FreeCurrencyRates unknown error")
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

const getWithFallback = async ({
  urls,
  params,
}: {
  urls: string[]
  params: { [key: string]: string | number | boolean }
}) => {
  let response: AxiosResponse | undefined
  for (const url of urls) {
    try {
      response = await axios.get(url, params)
      if (response && response.status === 200) return response.data
    } catch {}
  }

  return new UnknownExchangeServiceError(`Invalid response. Error ${response?.status}`)
}
